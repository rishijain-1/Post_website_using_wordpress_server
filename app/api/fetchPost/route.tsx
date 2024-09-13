import { NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id'); 
    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Fetch RSS Feed
    const response = await fetch('https://blog55973.wordpress.com/feed/');
    if (!response.ok) {
      throw new Error('Failed to fetch RSS feed');
    }

    const xmlData = await response.text();
    const result = await parseStringPromise(xmlData); 
    const channel = result.rss.channel[0];
    const items = channel.item || [];
    const post = items[parseInt(id, 10)];

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const formattedPost = {
      title: post.title?.[0] || 'No title',
      link: post.link?.[0] || '#',
      description: post['content:encoded']?.[0] || post.description?.[0] || 'No description',
      pubDate: post.pubDate?.[0] || 'No date',
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error('Error fetching or parsing RSS feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post', details: (error as Error).message },
      { status: 500 }
    );
  }
}
