import { NextResponse } from 'next/server';
import axios from 'axios';

interface Post {
  id: number;
  date: string;
  modified: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  author: number;
  link: string;
  featured_media: number;
  categories: number[];
  slug: string; // Add slug
  jetpack_featured_media_url: string; // Add jetpack_featured_media_url
}

interface FeedResponse {
  title: string;
  link: string;
  description: string;
  items: FormattedItem[];
}

interface FormattedItem {
  id: number;
  date: string;
  title: string;
  link: string;
  content: string;
  excerpt: string;
  author: number;
  featured_media: number;
  categories: number[];
  slug: string; 
  jetpack_featured_media_url: string; 
}

export async function GET() {
  try {
    const response = await axios.get<Post[]>('https://public-api.wordpress.com/wp/v2/sites/blog55973.wordpress.com/posts');

    if (response.status !== 200) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    const posts: Post[] = response.data;

    // Format the posts into the desired response structure
    const formattedItems: FormattedItem[] = posts.map((post) => ({
      id: post.id,
      date: post.date,
      title: post.title.rendered,
      link: post.link,
      content: post.content.rendered,
      excerpt: post.excerpt.rendered,
      author: post.author,
      featured_media: post.featured_media,
      categories: post.categories,
      slug: post.slug, // Include slug
      jetpack_featured_media_url: post.jetpack_featured_media_url, // Include jetpack_featured_media_url
    }));

    const responsePayload: FeedResponse = {
      title: 'WordPress Blog Posts',
      link: 'https://blog55973.wordpress.com/',
      description: 'Latest posts from the WordPress blog.',
      items: formattedItems,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch posts',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
