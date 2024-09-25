import PostPage from '../../../components/PostPage';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const  url = process.env.NEXT_API_URL;
  const fetchUrl = `${url}/fetchPost?slug=${params.slug}`;
  const response = await fetch(fetchUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch post data');
  }
  const post = await response.json();
  const cleanedDescription = post.description.rendered
  .replace(/<p>/g, '')
  .replace(/<\/p>/g, '')
  .replace(/\[\&hellip;\]/g, '')
  .trim();

  return {
    title: post.title.rendered,
    description: cleanedDescription,
    openGraph: {
      title: post.title,
      description: cleanedDescription,
      url: post.link,
      type: 'article',
      images: [post.jetpack_featured_media_url || ''], // Use the featured media URL
    },
  };
}

export default function Page() {
  return <PostPage />;
}
