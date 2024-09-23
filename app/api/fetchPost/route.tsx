import { NextResponse } from 'next/server';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

interface Item {
  title?: string[];
  link?: string[];
  description?: string[];
  'content:encoded'?: string[];
  pubDate?: string[];
  author?: string[];
  'dc:creator'?: string[];
  category?: string[];
  guid?: string[];
  'media:thumbnail'?: { $: { url: string; width?: string; height?: string } }[];
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
  thumbnail: { url: string; width?: string; height?: string } | null;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');


    const response = await axios.get('https://blog55973.wordpress.com/feed/');
    if (response.status !== 200) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
    }

    const xmlData = response.data;
    const result = await parseStringPromise(xmlData as string);
    const channel = result.rss.channel[0];

    const items: Item[] = channel.item || [];

    if (id) {
      const post = items[parseInt(id, 10)];
      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      
      const formattedPost: FormattedItem = {
        title: post.title?.[0] || 'No title',
        link: post.link?.[0] || '#',
        description: post['content:encoded']?.[0] || post.description?.[0] || 'No description',
        pubDate: post.pubDate?.[0] || 'No date',
        author: post.author?.[0] || 'Unknown author',
        creator: post['dc:creator']?.[0] || 'Unknown creator',
        category: post.category || ['Uncategorized'],
        guid: post.guid?.[0] || 'No GUID',
        thumbnail: post['media:thumbnail']?.[0]
          ? {
              url: post['media:thumbnail'][0].$.url,
              width: post['media:thumbnail'][0].$.width,
              height: post['media:thumbnail'][0].$.height,
            }
          : null,
      };

      return NextResponse.json(formattedPost);
    }

    const formattedPosts: FormattedItem[] = items.map((item) => ({
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
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error('Error fetching or parsing RSS feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts', details: (error as Error).message },
      { status: 500 }
    );
  }
}
