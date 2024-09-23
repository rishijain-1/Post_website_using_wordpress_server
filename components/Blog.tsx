"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  creator?: string; 
  thumbnail?: { url: string }; 
}

interface Post {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  author: string;
  thumbnail: string | null;
}

const BlogPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]); 
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/fetchRSsFeed');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

   
        const items: RSSItem[] = data.items || [];

        const formattedPosts: Post[] = items.map((item: RSSItem) => ({
          title: item.title,
          link: item.link,
          description: item.description,
          pubDate: item.pubDate,
          author: item.creator || 'Unknown author',
          thumbnail: item.thumbnail?.url || null,
        }));

        setPosts(formattedPosts); 
      } catch (error) {
        setError('Failed to fetch posts: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setLoading(false); 
      }
    };

    fetchData(); 
  }, []);

  if (loading) return <p className="text-center text-lg text-gray-500">Loading...</p>; 
  if (error) return <p className="text-center text-lg text-red-500">{error}</p>;

  return (
    <div className="w-full mx-auto items-center flex flex-col justify-center p-6 bg-gray-700 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-black">Blog Posts</h1>
      <ul className="space-y-6 max-w-4xl">
        {posts.map((post, index) => (
          <li
            key={index}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <Link href={`/post/${index}`} passHref>
              <div className="block p-6 text-blue-600">
                {post.thumbnail && (
                  <Image
                    src={post.thumbnail}
                    alt={`Thumbnail for ${post.title}`}
                    width={700} 
                    height={450}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
                <p className="text-gray-600 text-sm mb-2">
                  {new Date(post.pubDate).toLocaleDateString()} • By {post.author}
                </p>
                <div
                  className="description text-gray-800 overflow-hidden line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: post.description }}
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogPosts;
