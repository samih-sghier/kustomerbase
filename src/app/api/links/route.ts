// src/app/api/links/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { parseStringPromise } from 'xml2js';

// Fetch internal links from a given page URL
async function getInternalLinksFromPage(baseUrl: string): Promise<string[]> {
  try {
    const { data } = await axios.get(baseUrl);
    const $ = cheerio.load(data);
    const links = new Set<string>();

    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        try {
          const absoluteUrl = new URL(href, baseUrl).toString();
          if (absoluteUrl.startsWith(baseUrl) && !href.match(/\.(pdf|jpg|jpeg|png|gif)$/i)) {
            links.add(absoluteUrl);
          }
        } catch (e) {
          console.warn('Invalid link format:', href);
        }
      }
    });

    return Array.from(links);
  } catch (error) {
    console.error(`Failed to get links from ${baseUrl}:`, error);
    throw new Error('Failed to retrieve links');
  }
}

// Fetch links from a sitemap URL
async function getLinksFromSitemap(sitemapUrl: string): Promise<string[]> {
  try {
    const { data } = await axios.get(sitemapUrl);
    const result = await parseStringPromise(data);
    const urls = result.urlset.url.map((entry: any) => entry.loc[0]);
    return urls;
  } catch (error) {
    console.error(`Failed to get sitemap links from ${sitemapUrl}:`, error);
    throw new Error('Failed to retrieve sitemap links');
  }
}

// Handling GET requests
export async function GET(request: Request) {
  const url = new URL(request.url);
  const pageUrl = url.searchParams.get('page');
  const sitemapUrl = url.searchParams.get('sitemap');

  if (pageUrl) {
    // Handle page URL
    try {
      const links = await getInternalLinksFromPage(pageUrl);
      return NextResponse.json(links);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to retrieve links from page' }, { status: 500 });
    }
  } else if (sitemapUrl) {
    // Handle sitemap URL
    try {
      const links = await getLinksFromSitemap(sitemapUrl);
      return NextResponse.json(links);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to retrieve links from sitemap' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Invalid query parameter' }, { status: 400 });
  }
}
