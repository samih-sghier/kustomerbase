'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';
import { toast } from 'sonner';

const urlSchema = z.string().url().min(1, 'URL cannot be empty');
const sitemapSchema = z.string().url().min(1, 'Sitemap URL cannot be empty');

interface Link {
  id: number;
  url: string;
  llmData?: string; // Optional field for LLM data
}

export default function WebsiteContent() {
  const [links, setLinks] = useState<Link[]>([]);
  const [crawlLink, setCrawlLink] = useState('');
  const [sitemapLink, setSitemapLink] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLink, setNewLink] = useState('');
  const [fetching, setFetching] = useState(false);
  const [progress, setProgress] = useState(0); // Progress state for the progress bar

  // Calculate total characters in the link URLs and LLM data
  const totalChars = links.reduce((total, link) => total + (link.url.length + (link.llmData?.length || 0)), 0);

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
  const handleDeleteLink = (id: number) => {
    setLinks(prevLinks => prevLinks.filter((link) => link.id !== id));
  };

  // Add a new link to the list and start fetching its LLM data
  const handleAddLink = async () => {
    try {
      urlSchema.parse(newLink);

      const normalizedNewLink = normalizeUrl(newLink);

      if (links.some(link => normalizeUrl(link.url) === normalizedNewLink)) {
        toast.error('This URL is already in the list.');
        return;
      }

      const newId = links.length > 0 ? links[links.length - 1].id + 1 : 1;
      const newLinkEntry = { id: newId, url: newLink };

      setLinks(prevLinks => [...prevLinks, newLinkEntry]);
      setNewLink('');
      setIsAddingLink(false);

      // Fetch LLM data for all links including the new one
      fetchLinks('page');
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
      setProgress(0);
      const totalLinks = linksToFetch.length;
      let completedLinks = 0;

      // Fetch LLM data for all links
      const fetchPromises = linksToFetch.map(link =>
        fetch(`https://r.jina.ai/${link.url}`)
          .then(response => response.text())
          .then(text => {
            completedLinks += 1;
            setProgress(Math.round((completedLinks / totalLinks) * 100));
            return { ...link, llmData: text };
          })
          .catch(error => {
            completedLinks += 1;
            setProgress(Math.round((completedLinks / totalLinks) * 100));
            return { ...link, llmData: `Failed to fetch LLM data: ${error.message}` };
          })
      );

      const updatedLinks = await Promise.all(fetchPromises);
      setLinks(updatedLinks);
    } catch (error) {
      console.error('Detailed LLM fetch error info:', error);
    }
  };

  // Fetch links based on crawl or sitemap link
  const fetchLinks = async (type: 'page' | 'sitemap') => {
    setFetching(true);
    setProgress(0);

    try {
      if (type === 'page') {
        urlSchema.parse(crawlLink);
      } else if (type === 'sitemap') {
        sitemapSchema.parse(sitemapLink);
      }

      const response = await fetch(`/api/links?${type}=${encodeURIComponent(type === 'page' ? crawlLink : sitemapLink)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const fetchedLinks: string[] = await response.json();
      const newLinks = fetchedLinks.map((url: string, index: number) => ({
        id: links.length + index + 1,
        url
      }));

      // Check for duplicates and add new links
      const existingUrls = new Set(links.map(link => normalizeUrl(link.url)));
      const filteredNewLinks = newLinks.filter(link => !existingUrls.has(normalizeUrl(link.url)));

      if (filteredNewLinks.length !== newLinks.length) {
        toast.error('Some links were duplicates and were not added.');
      }

      const allLinks = [...links, ...filteredNewLinks];
      setLinks(allLinks);

      // Fetch LLM data for all links
      fetchLLMDataForLinks(allLinks);

      if (type === 'page') setCrawlLink('');
      if (type === 'sitemap') setSitemapLink('');
    } catch (error: any) {
      console.error('Detailed error info:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setFetching(false);
      setProgress(100); // Ensure progress is complete when done
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
              <Button variant="ghost" onClick={() => setLinks([])} className="text-red-500">
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
              <Button variant="ghost" onClick={() => handleDeleteLink(link.id)} className="text-red-500 ml-2">
                🗑️
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">{totalChars} detected characters</p>
      </div>
    </div>
  );
}
