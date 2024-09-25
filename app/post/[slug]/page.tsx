import PostPage from '../../../components/PostPage';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const url = process.env.NEXT_API_URL;
  const fetchUrl = `${url}/fetchPost?slug=${params.slug}`;
  
  try {
    const response = await fetch(fetchUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch post data');
    }

    const post = await response.json();
    console.log(post); // You can remove this later

    // Access title and description from the rendered property
    const title = post?.title?.rendered || 'Untitled';
    const description = post?.description?.rendered || '';
    
    // Clean up the description text
    const cleanedDescription = description
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '')
      .replace(/\[\&hellip;\]/g, '')
      .trim();

    return {
      title,
      description: cleanedDescription,
      openGraph: {
        title,
        description: cleanedDescription,
        url: post?.link || '',
        type: 'article',
        images: [post?.thumbnail?.url || ''], // Use the thumbnail URL if available
      },
    };
  } catch (error) {
    console.error('Error fetching post data:', error);
    return {
      title: 'Post not found',
      description: 'Could not retrieve post data.',
      openGraph: {
        title: 'Post not found',
        description: 'Could not retrieve post data.',
        url: '',
        type: 'article',
        images: [''], // Fallback image if no media URL is available
      },
    };
  }
}

export default function Page() {
  return <PostPage />;
}
