'use client';

import { useParams } from 'next/navigation'; // Import useParams to access the dynamic route parameter
import { useEffect, useState } from 'react';

interface Post {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

const PostPage = () => {
  const { id } = useParams(); // Use 'id' instead of 'slug'

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const response = await fetch(`/api/fetchPost?id=${id}`); // Fetch post by 'id'
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setPost(data);
        } catch (error) {
          setError('Failed to fetch post');
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [id]);

  if (loading) return <p className="text-center text-lg text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-lg text-red-500">{error}</p>;

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white shadow-md rounded-lg min-h-screen">
      <h1 className="text-5xl font-bold mb-6 text-gray-800">{post?.title}</h1>
      <p className="text-gray-600 text-lg mb-6">
        {post?.pubDate ? new Date(post?.pubDate).toLocaleDateString() : ''}
      </p>
      <div
        className="description text-gray-800 text-base leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post?.description || '' }}
      />
      
    </div>
  );
};

export default PostPage;
