// app/posts/[id]/page.tsx

import PostPage from '../../../components/PostPage';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const url = process.env.NEXT_API_URL
  const response = await fetch(`${url}/fetchPost?id=${params.id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch post data');
  }

  const post = await response.json();

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: post.link,
      type: 'article',
      images: [post.thumbnail?.url],
    },
  };
}

export default function Page() {
  return <PostPage />;
}
