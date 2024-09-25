'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Post {
  jetpack_featured_media_url: string;
  title: string; // Changed to string as per the data structure
  link: string;
  description: string; // Changed to string as per the data structure
  pubDate: string;
  author: string;
  category: string[]; // Changed to string[] to match the provided data structure
  guid: string;
}

const PostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      const fetchPost = async () => {
        try {
          const response = await fetch(`/api/fetchPost?slug=${slug}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setPost(data);
        } catch (error) {
          setError('Failed to fetch post');
          console.error(error); // Log the error for debugging
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [slug]);

  if (loading) return <p className="text-center text-lg text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-lg text-red-500">{error}</p>;

  // Ensure the title is defined before using replace
  const sanitizedTitle = post?.title?.replace(/&nbsp;/g, ' ').trim() || 'No Title';

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white shadow-md rounded-lg min-h-screen">
      {post && (
        <>
          <div className="flex justify-center">
            {post.jetpack_featured_media_url && (
              <Image
                src={post.jetpack_featured_media_url}
                alt={sanitizedTitle}
                className="rounded-lg mb-4"
                width={300}
                height={300}
              />
            )}
          </div>
          <h1 className="text-5xl font-bold mb-6 text-gray-800">{sanitizedTitle}</h1>
          <p className="text-gray-600 text-lg mb-2">
            {post.pubDate ? new Date(post.pubDate).toLocaleDateString() : ''}
          </p>
          <div
            className="description text-gray-800 text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.description }}
          />
          <p className="text-gray-600 text-base mt-4">Author: {post.author || 'Unknown author'}</p>
        </>
      )}
    </div>
  );
};

export default PostPage;
