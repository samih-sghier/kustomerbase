'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';
import { toast } from 'sonner';
import { clearSourceFields, removeWebsiteDataField, updateWebsiteDataField } from '@/server/actions/sources/mutations';
import { sourcesUpdateSchema } from '@/server/db/schema';
import { PricingPlan } from '@/config/pricing';

const urlSchema = z.string().url().min(1, 'URL cannot be empty');
const sitemapSchema = z.string().url().min(1, 'Sitemap URL cannot be empty');

interface Link {
    id: number;
    url: string;
    llmData?: string; // Optional field for LLM data
}

export default function WebsiteContent({ source, stats, subscription }: { source: any, stats: any, subscription: PricingPlan }) {
    const [links, setLinks] = useState<Link[]>([]);
    const [crawlLink, setCrawlLink] = useState('');
    const [sitemapLink, setSitemapLink] = useState('');
    const [isAddingLink, setIsAddingLink] = useState(false);
    const [newLink, setNewLink] = useState('');
    const [fetching, setFetching] = useState(false);
    const [progress, setProgress] = useState(0); // Progress state for the progress bar
    const [currentTotalChars, setTotalChars] = useState(0); // Total characters in the link URLs and LLM data

    const {
        textInputChars,
        linkChars,
        totalChars,
        linkCount,
        qaChars,
        qaCount,
        fileChars,
        fileCount,
        trainChatbot,
        lastTrainedDate
    } = stats;

    useEffect(() => {
        if (source && source.website_data) {
            const initialLinks = Object.keys(source.website_data).map((url, index) => ({
                id: index + 1,
                url,
                llmData: source.website_data[url], // Assuming website_data stores the llmData as values
            }));
            setLinks(initialLinks);
            const totalChars = initialLinks.reduce((acc, link) => acc + (link.llmData?.length || 0), 0);
            setTotalChars(totalChars);
        }
    }, [source]);

    // Normalize the URL by removing trailing slashes and converting to lowercase
    const normalizeUrl = (url: string) => {
        try {
            const parsedUrl = new URL(url);
            const normalizedPath = parsedUrl.pathname.replace(/\/+$/, '');
            const normalizedOrigin = parsedUrl.origin.toLowerCase();
            return `${normalizedOrigin}${normalizedPath}`;
        } catch (e) {
            return url.toLowerCase().replace(/\/+$/, '');
        }
    };

    // Handle the deletion of a link by its ID
    const handleDeleteLink = async (id: number, url: string) => {
        try {
            // Create a set with the URL to delete (assuming removeWebsiteDataField expects a Set)
            const urlsToDelete = new Set([url]);

            // Call the mutation to delete the link from the website_data field
            await removeWebsiteDataField(urlsToDelete);

            // Update the UI after successful deletion
            setLinks((prevLinks) => prevLinks.filter((link) => link.id !== id));
            setTotalChars((prevTotal) => prevTotal - (source.website_data[url]?.length || 0));
            toast.success('Link deleted successfully.');

            // Update the website data field
            const updatedLinks = links.filter(link => link.id !== id);
            const websiteDataUpdate = updatedLinks.reduce((acc: Record<string, string>, link: Link) => {
                if (link.llmData) {
                    acc[link.url] = link.llmData;
                }
                return acc;
            }, {});
            await updateWebsiteDataField(websiteDataUpdate);

        } catch (error) {
            toast.error(`Error: ${error.message}`);
        }
    };

    // Add a new link to the list and start fetching its LLM data
    const handleAddLink = async () => {
        try {
            const trimmedLink = newLink.trim();

            if (trimmedLink.length === 0) {
                toast.error('URL cannot be empty');
                return;
            }

            const urlToValidate = /^https?:\/\//i.test(trimmedLink) ? trimmedLink : `http://${trimmedLink}`;

            urlSchema.parse(urlToValidate);

            const normalizedNewLink = normalizeUrl(urlToValidate);

            if (links.some(link => normalizeUrl(link.url) === normalizedNewLink)) {
                toast.error('This URL is already in the list.');
                return;
            }

            // Check link count limit
            const maxLinks = Number(subscription.links);
            const currentLinkCount = links.length;
            
            if (currentLinkCount >= maxLinks) {
                toast.error(`You have reached the maximum number of links allowed for your plan (${maxLinks}).`);
                return;
            }

            const newId = links.length > 0 ? links[links.length - 1].id + 1 : 1;
            const newLinkEntry = { id: newId, url: urlToValidate };

            setLinks(prevLinks => [...prevLinks, newLinkEntry]);
            setNewLink('');
            setIsAddingLink(false);

            // Fetch LLM data for the new link
            setFetching(true);
            setProgress(0);

            try {
                const response = await fetch(`https://r.jina.ai/${urlToValidate}`);
                const text = await response.text();
                setProgress(100);

                // Check character limit
                const maxChars = subscription.charactersPerChatbot;
                const currentChars = totalChars;
                const remainingChars = Math.max(0, maxChars - currentChars);
                
                let truncatedText = text;
                if (text.length > remainingChars) {
                    truncatedText = text.slice(0, remainingChars);
                    toast.warning(`The content was truncated to fit within your plan's character limit.`);
                }

                const updatedLink = { ...newLinkEntry, llmData: truncatedText };
                setLinks(prevLinks => prevLinks.map(link =>
                    link.id === newId ? updatedLink : link
                ));
                setTotalChars(prevTotal => Math.min(prevTotal + truncatedText.length, maxChars));

                // Update the website data field with the new link and its LLM data
                const websiteDataUpdate = { [urlToValidate]: truncatedText };
                await updateWebsiteDataField(websiteDataUpdate);

                toast.success('Link added and LLM data fetched successfully.');
            } catch (error) {
                console.error('Error fetching LLM data:', error);
                toast.error(`Failed to fetch LLM data: ${error.message}`);

                const errorMessage = `Failed to fetch LLM data: ${error.message}`;
                const updatedLink = { ...newLinkEntry, llmData: errorMessage };
                setLinks(prevLinks => prevLinks.map(link =>
                    link.id === newId ? updatedLink : link
                ));
                setTotalChars(prevTotal => prevTotal + errorMessage.length);

                // Update the website data field with the new link and error message
                const websiteDataUpdate = { [urlToValidate]: errorMessage };
                await updateWebsiteDataField(websiteDataUpdate);
            } finally {
                setFetching(false);
                setProgress(100);
            }

        } catch (e) {
            if (e instanceof z.ZodError) {
                const errors = e.errors.map(error => error.message).join(', ');
                toast.error(`Invalid input: ${errors}`);
            } else {
                toast.error('An unexpected error occurred');
            }
        }
    };

    // Fetch LLM data for a given link and update its entry in the state
    const fetchLLMDataForLinks = async (linksToFetch: Link[]) => {
        try {
            const totalLinks = linksToFetch.length;
            let completedLinks = 0;
            let totalNewChars = 0;

            const maxChars = Number(subscription.charactersPerChatbot);
            const initialTotalChars = totalChars;

            // Fetch LLM data for all links
            const fetchPromises = linksToFetch.map(async (link) => {
                try {
                    const response = await fetch(`https://r.jina.ai/${link.url}`);
                    const text = await response.text();
                    completedLinks += 1;
                    
                    const remainingChars = Math.max(0, maxChars - (initialTotalChars + totalNewChars));
                    let truncatedText = text;
                    if (text.length > remainingChars) {
                        truncatedText = text.slice(0, remainingChars);
                        toast.warning(`Some content was truncated to fit within your plan's character limit.`);
                    }
                    
                    totalNewChars += truncatedText.length;
                    setProgress(Math.round((completedLinks / totalLinks) * 100));

                    return { ...link, llmData: truncatedText };
                } catch (error) {
                    completedLinks += 1;
                    setProgress(Math.round((completedLinks / totalLinks) * 100));
                    return { ...link, llmData: `Failed to fetch LLM data: ${error.message}` };
                }
            });

            const updatedLinks = await Promise.all(fetchPromises);
            setLinks(updatedLinks);
            setTotalChars(prevTotal => Math.min(prevTotal + totalNewChars, maxChars));

            // Update the website data field with the fetched LLM data
            const websiteDataUpdate = updatedLinks.reduce((acc: Record<string, string>, link: Link) => {
                if (link.llmData) {
                    acc[link.url] = link.llmData;
                }
                return acc;
            }, {});
            await updateWebsiteDataField(websiteDataUpdate);

        } catch (error) {
            console.error('Detailed LLM fetch error info:', error);
            toast.error(`Error: ${error.message}`);
        }
    };

    // Fetch links based on crawl or sitemap link
    const fetchLinks = async (type: 'page' | 'sitemap') => {
        setFetching(true);
        setProgress(0);

        try {
            const linkToFetch = type === 'page' ? crawlLink : sitemapLink;
            
            if (type === 'page') {
                urlSchema.parse(linkToFetch);
            } else if (type === 'sitemap') {
                sitemapSchema.parse(linkToFetch);
            }

            const response = await fetch(`/api/links?page=${encodeURIComponent(linkToFetch)}&linkType=${type}`);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
            }

            const fetchedLinks: string[] = await response.json();
            const newLinks = fetchedLinks.map((url: string, index: number) => ({
                id: links.length + index + 1,
                url
            }));

            // Check for duplicates and add new links
            const existingUrls = new Set(links.map(link => normalizeUrl(link.url)));
            const filteredNewLinks = newLinks.filter(link => !existingUrls.has(normalizeUrl(link.url)));

            // Check link count limit
            const maxLinks = Number(subscription.links);
            const availableSlots = Math.max(0, maxLinks - links.length);
            const linksToAdd = filteredNewLinks.slice(0, availableSlots);

            if (linksToAdd.length === 0) {
                if (links.length >= maxLinks) {
                    toast.error(`No links were added. You have reached the maximum number of links (${maxLinks}) allowed for your plan.`);
                } else if (filteredNewLinks.length === 0) {
                    toast.error(`No new links were found or all fetched links are already in your list.`);
                } else {
                    toast.error(`No links were added due to reaching your plan's limit of ${maxLinks} links.`);
                }
                return; // Exit the function early as no links can be added
            }

            const allLinks = [...links, ...linksToAdd];
            setLinks(allLinks);

            // Fetch LLM data for new links only
            await fetchLLMDataForLinks(linksToAdd);

            if (type === 'page') setCrawlLink('');
            if (type === 'sitemap') setSitemapLink('');

            if (linksToAdd.length < filteredNewLinks.length) {
                const remainingLinks = filteredNewLinks.length - linksToAdd.length;
                toast.warning(`Added ${linksToAdd.length} links. ${remainingLinks} links were not added due to reaching your plan's limit of ${maxLinks} links.`);
            } else {
                toast.success(`Successfully added ${linksToAdd.length} new links.`);
            }
        } catch (error: any) {
            console.error('Detailed error info:', error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setFetching(false);
            setProgress(100);
        }
    };

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            {fetching && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
                    <div
                        className="bg-green-600 h-2.5 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                    <div
                        className="absolute inset-0 flex items-center justify-center text-xs font-medium text-black"
                        style={{ width: '100%' }}
                    >
                        {progress}%
                    </div>
                </div>
            )}

            {/* Crawl Section */}
            <div>
                <p className="text-sm font-medium mb-2">Crawl</p>
                <div className="flex space-x-2">
                    <Input
                        placeholder="https://www.example.com"
                        className="flex-1"
                        value={crawlLink}
                        onChange={(e) => setCrawlLink(e.target.value)}
                    />
                    <Button onClick={() => fetchLinks('page')} disabled={fetching}>
                        {fetching ? 'Fetching...' : 'Fetch links from page'}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    This will crawl all the internal links starting with the URL (excluding files).
                </p>
            </div>

            {/* OR Divider */}
            <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-300 w-full"></div>
                <span className="absolute bg-white px-2 text-sm text-muted-foreground">Or</span>
            </div>

            {/* Sitemap Section */}
            <div>
                <p className="text-sm font-medium mb-2">Submit Sitemap</p>
                <div className="flex space-x-2">
                    <Input
                        placeholder="https://www.example.com/sitemap.xml"
                        className="flex-1"
                        value={sitemapLink}
                        onChange={(e) => setSitemapLink(e.target.value)}
                    />
                    <Button onClick={() => fetchLinks('sitemap')} disabled={fetching}>
                        {fetching ? 'Fetching...' : 'Fetch links from sitemap'}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    This will fetch all the links listed in the sitemap XML URL.
                </p>
            </div>

            {/* OR Divider */}
            <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-300 w-full"></div>
                <span className="absolute bg-white px-2 text-sm text-muted-foreground">Included Links</span>
            </div>

            {/* Included Links Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm font-medium">Included Links</p>
                    <div className="flex items-center space-x-2">
                        {!isAddingLink && (
                            <Button onClick={() => setIsAddingLink(true)}>
                                +
                            </Button>
                        )}
                        {links.length > 0 && (
                            <Button variant="ghost" onClick={() => {
                                const ls = links.map(l => l.url);
                                removeWebsiteDataField(new Set(ls));
                                setLinks([])
                            }} className="text-red-500">
                                Delete all
                            </Button>
                        )}
                    </div>
                </div>
                {isAddingLink && (
                    <div className="flex space-x-2 mb-4">
                        <Input
                            placeholder="https://www.example.com"
                            className="flex-1"
                            value={newLink}
                            onChange={(e) => setNewLink(e.target.value)}
                        />
                        <Button onClick={handleAddLink}>Add Link</Button>
                        <Button onClick={() => setIsAddingLink(false)} variant="ghost">
                            Cancel
                        </Button>
                    </div>
                )}
                <div className="space-y-2">
                    {links.map((link) => (
                        <div key={link.id} className="flex items-center bg-gray-100 p-2 rounded-md">
                            <div className="flex items-center space-x-2 flex-grow">
                                <Badge>Link</Badge>
                                <p className="text-sm flex-grow">{link.url}</p>
                                {link.llmData && (
                                    <p className="text-xs text-muted-foreground ml-4">
                                        {link.llmData.length} chars
                                    </p>
                                )}
                            </div>
                            <Button variant="ghost" onClick={() => handleDeleteLink(link.id, link.url)} className="text-red-500 ml-2">
                                🗑️
                            </Button>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">{currentTotalChars} detected characters</p>
            </div>
        </div>
    );
}