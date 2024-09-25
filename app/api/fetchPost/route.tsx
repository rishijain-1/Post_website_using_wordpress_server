import { NextResponse } from 'next/server';

interface Item {
  jetpack_featured_media_url: string | null;
  title?: { rendered: string };  // Updated to match the structure
  link?: string;
  content?: { rendered: string }; // Updated to match the structure
  date?: string;
  author?: { name: string }; 
  categories?: number[]; // Assuming categories are IDs
  id?: number;
}

interface FormattedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  author: string;
  category: string[];
  guid: string;
  jetpack_featured_media_url: string;
}

// api/fetchPost/route.ts
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Fetching from the WordPress API
    const response = await fetch(`https://public-api.wordpress.com/wp/v2/sites/blog55973.wordpress.com/posts?slug=${slug}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    const items: Item[] = await response.json();
    const post = items[0];

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Format and return the post
    const formattedPost: FormattedItem = {
      title: post.title?.rendered || 'No title',
      link: post.link || '#',
      description: post.content?.rendered || 'No description',
      pubDate: post.date || 'No date',
      author: post.author?.name || 'Unknown author',
      category: post.categories ? await fetchCategories(post.categories) : ['Uncategorized'],
      guid: post.id?.toString() || 'No GUID',
      jetpack_featured_media_url: post.jetpack_featured_media_url || '',
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error('Error fetching or parsing posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Helper function to fetch category names if needed
async function fetchCategories(categoryIds: number[]): Promise<string[]> {
  const categoriesResponse = await fetch(`https://public-api.wordpress.com/wp/v2/sites/blog55973.wordpress.com/categories`);
  const categoriesData = await categoriesResponse.json();

  const categoryMap = new Map<number, string>();
  categoriesData.forEach((category: { id: number; name: string }) => {
    categoryMap.set(category.id, category.name);
  });

  return categoryIds.map(id => categoryMap.get(id) || 'Unknown Category');
}
