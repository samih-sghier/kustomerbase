import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { parseStringPromise } from 'xml2js';
import * as zlib from 'zlib';

const MAX_DEPTH = 3;
const MAX_LINKS = 1000;
const TIMEOUT = 30000; // Increased timeout to 30 seconds
const MAX_RETRIES = 3;

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:90.0) Gecko/20100101 Firefox/90.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.70',
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
];

const SITEMAP_OPTIONS = [
  '/sitemap.xml',
  '/sitemap-index.xml',
  '/sitemap.php',
  '/sitemap.txt',
  '/sitemap.xml.gz',
  '/sitemap/',
  '/sitemap/sitemap.xml',
  '/sitemapindex.xml',
  '/sitemap/index.xml',
  '/sitemap1.xml',
  '/rss/',
  '/rss.xml',
  '/atom.xml',
  '/sitemap_index.xml'
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function normalizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    parsedUrl.hash = '';
    return parsedUrl.toString();
  } catch (e) {
    console.warn('Invalid URL format:', url);
    return '';
  }
}

async function fetchWithRetry(url: string, options: any, retries = MAX_RETRIES): Promise<any> {
  try {
    return await axios(url, options);
  } catch (error) {
    if (retries > 0 && (error.code === 'ECONNABORTED' || error.response?.status >= 500)) {
      console.log(`Retrying ${url}, ${retries} attempts left`);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

async function checkForSitemap(baseUrl: string): Promise<string | null> {
  for (const option of SITEMAP_OPTIONS) {
    const sitemapUrl = new URL(option, baseUrl).toString();
    console.log(`Checking URL: ${sitemapUrl}`);
    try {
      const response = await fetchWithRetry(sitemapUrl, { 
        headers: { 
          'User-Agent': getRandomUserAgent(),
          'Accept': 'application/xml,text/xml,application/x-gzip,text/plain,*/*',
        },
        timeout: TIMEOUT,
        maxRedirects: 5,
      });
      console.log(`Response Status: ${response.status}`);
      console.log(`Content-Type: ${response.headers['content-type']}`);
      const contentType = response.headers['content-type']?.toLowerCase() || '';
      if (response.status === 200 && 
          (contentType.includes('xml') || 
           contentType.includes('text/plain') ||
           contentType.includes('application/x-gzip'))) {
        console.log(`Sitemap found at ${sitemapUrl}`);
        return sitemapUrl;
      }
    } catch (error) {
      console.error(`Error fetching ${sitemapUrl}: ${error.message}`);
    }
  }
  return null;
}

async function getLinksFromSitemap(sitemapUrl: string, allLinks: Set<string>): Promise<void> {
  try {
    const response = await fetchWithRetry(sitemapUrl, { 
      timeout: TIMEOUT,
      headers: { 'User-Agent': getRandomUserAgent() },
      responseType: 'stream'
    });
    
    const contentType = response.headers['content-type']?.toLowerCase() || '';
    const isGzipped = contentType.includes('gzip') || sitemapUrl.endsWith('.gz');
    
    let stream = response.data;
    if (isGzipped) {
      stream = stream.pipe(zlib.createGunzip());
    }

    let xmlData = '';
    for await (const chunk of stream) {
      xmlData += chunk.toString();
    }
    
    const result = await parseStringPromise(xmlData);

    if (result.sitemapindex) {
      const sitemapUrls = result.sitemapindex.sitemap.map((entry: any) => entry.loc[0]);
      const promises = sitemapUrls.slice(0, 5).map(url => getLinksFromSitemap(url, allLinks));
      await Promise.all(promises);
    } else if (result.urlset) {
      result.urlset.url.forEach((entry: any) => {
        if (allLinks.size < MAX_LINKS) {
          allLinks.add(entry.loc[0]);
        }
      });
    }
  } catch (error) {
    console.error(`Failed to get sitemap links from ${sitemapUrl}:` + error?.message);
  }
}

async function getInternalLinksFromPage(baseUrl: string, depth: number, allLinks: Set<string>): Promise<void> {
  if (depth > MAX_DEPTH || allLinks.size >= MAX_LINKS) return;

  try {
    const { data } = await fetchWithRetry(baseUrl, { 
      headers: { 'User-Agent': getRandomUserAgent() },
      timeout: TIMEOUT
    });
    const $ = cheerio.load(data);

    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        try {
          const absoluteUrl = new URL(href, baseUrl).toString();
          const normalizedUrl = normalizeUrl(absoluteUrl);
          if (normalizedUrl.startsWith(baseUrl) && !href.match(/\.(pdf|jpg|jpeg|png|gif)$/i)) {
            allLinks.add(normalizedUrl);
            if (allLinks.size >= MAX_LINKS) return false;
          }
        } catch (e) {
          console.warn('Invalid link format:', href);
        }
      }
    });

    const promises = Array.from(allLinks).slice(0, 5).map(async (link) => {
      if (link !== baseUrl) {
        await getInternalLinksFromPage(link, depth + 1, allLinks);
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error(`Failed to get links from ${baseUrl}:`, error);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pageUrl = url.searchParams.get('page');
  const linkType = url.searchParams.get('linkType');

  if (!pageUrl) {
    return NextResponse.json({ error: 'Invalid query parameter' }, { status: 400 });
  }

  try {
    const allLinks = new Set<string>();
    const sitemapUrl = linkType === 'sitemap' ? pageUrl : await checkForSitemap(pageUrl);
    
    if (sitemapUrl) {
      console.log(`Sitemap found at ${sitemapUrl}. Using sitemap for crawling.`);
      await getLinksFromSitemap(sitemapUrl, allLinks);
    }
    
    if (allLinks.size === 0) {
      console.log(`No links found from sitemap. Falling back to recursive crawling.`);
      await getInternalLinksFromPage(pageUrl, 0, allLinks);
    }

    return NextResponse.json(Array.from(allLinks));
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json({ error: 'Failed to retrieve links', details: error.message }, { status: 500 });
  }
}