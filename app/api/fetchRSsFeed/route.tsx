import { NextResponse } from 'next/server';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

interface Channel {
  title?: string[];
  link?: string[];
  description?: string[];
  item?: Item[];
}

interface Item {
  title?: string[];
  link?: string[];
  description?: string[];
  'content:encoded'?: string[];
  pubDate?: string[];
  author?: string[];
  'dc:creator'?: string[]; // Dublin Core's creator field
  category?: string[];
  guid?: string[];
  'media:thumbnail'?: MediaContent[]; // Thumbnail
  'media:content'?: MediaContent[]; // Media content
}

interface MediaContent {
  $: {
    url: string;
    type?: string;
    width?: string;
    height?: string;
  };
}

interface FeedResponse {
  title: string;
  link: string;
  description: string;
  items: FormattedItem[];
}

interface FormattedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  author: string;
  creator: string;
  category: string[];
  guid: string;
  media: MediaContentFormatted[]; 
  thumbnail: MediaContentFormatted | null;
}

interface MediaContentFormatted {
  url: string;
  type?: string;
  width?: string;
  height?: string;
}

export async function GET() {
  try {
    
    const response = await axios.get('https://blog55973.wordpress.com/feed/');
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
    }

    const xmlData = response.data;


    const result = await parseStringPromise(xmlData as string);
    if (!result?.rss?.channel?.[0]) {
      throw new Error('Unexpected RSS feed structure');
    }

    const channel = result.rss.channel[0] as Channel;

    const title = channel.title?.[0] || 'No title';
    const link = channel.link?.[0] || 'No link';
    const description = channel.description?.[0] || 'No description';

    const items = channel.item || [];

    // Extract and format additional data like creator, media, and thumbnail
    const formattedItems: FormattedItem[] = items.map((item: Item) => ({
      title: item.title?.[0] || 'No title',
      link: item.link?.[0] || '#',
      description: item['content:encoded']?.[0] || item.description?.[0] || 'No description',
      pubDate: item.pubDate?.[0] || 'No date',
      author: item.author?.[0] || 'Unknown author',
      creator: item['dc:creator']?.[0] || 'Unknown creator', 
      category: item.category || ['Uncategorized'], 
      guid: item.guid?.[0] || 'No GUID',
      thumbnail: item['media:thumbnail']?.[0]
        ? {
            url: item['media:thumbnail'][0].$.url,
            width: item['media:thumbnail'][0].$.width,
            height: item['media:thumbnail'][0].$.height,
          }
        : null, 
      media: (item['media:content'] || []).map((media: MediaContent) => ({
        url: media.$.url,
        type: media.$.type,
        width: media.$.width,
        height: media.$.height,
      })),
    }));


    const responsePayload: FeedResponse = {
      title,
      link,
      description,
      items: formattedItems,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Error fetching or parsing RSS feed:', error);
    return NextResponse.json({
      error: 'Failed to fetch or parse XML',
      details: (error as Error).message,
    }, { status: 500 });
  }
}
