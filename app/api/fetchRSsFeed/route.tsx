import { NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';

interface Channel {
  title: string[];
  link: string[];
  item: Item[];
}

interface Item {
  title: string[];
  link: string[];
  description?: string[];
  'content:encoded'?: string[];
  pubDate: string[];
}

interface FeedResponse {
  title: string;
  link: string;
  items: FormattedItem[];
}

interface FormattedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

export async function GET() {
  try {
    const response = await fetch('https://blog55973.wordpress.com/feed/');
    if (!response.ok) {
      throw new Error('Failed to fetch RSS feed');
    }
    const xmlData = await response.text();

    const result = await parseStringPromise(xmlData);
    const channel = result.rss.channel[0] as Channel;

    const title = channel.title?.[0] || 'No title';
    const link = channel.link?.[0] || 'No link';

    const items = channel.item || [];

    const formattedItems: FormattedItem[] = items.map((item: Item) => ({
      title: item.title?.[0] || 'No title',
      link: item.link?.[0] || '#',
      description: item['content:encoded']?.[0] || item.description?.[0] || 'No description',
      pubDate: item.pubDate?.[0] || 'No date',
    }));

    const responsePayload: FeedResponse = {
      title,
      link,
      items: formattedItems,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Error fetching or parsing RSS feed:', error);
    return NextResponse.json({ 
      error: 'Failed to parse XML', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}
