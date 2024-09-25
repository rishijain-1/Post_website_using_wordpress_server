"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface RSSItem {
  excerpt: string;
  date: string;
  title: string;
  link: string;
  description: string;
  creator?: string; 
  thumbnail?: { url: string }; 
  slug?: string;
  jetpack_featured_media_url?: string; 
}

interface Post {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  author: string;
  thumbnail: string | null;
  slug: string;
  excerpt: string,
  jetpack_featured_media_url: string | null; 
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
        console.log(data);
        const items: RSSItem[] = data.items || [];

        console.log(items);
        const formattedPosts: Post[] = items.map((item: RSSItem) => {
          // Remove <p> tags and [&hellip;] from the excerpt
          const cleanedExcerpt = item.excerpt
            .replace(/<p>/g, '')
            .replace(/<\/p>/g, '')
            .replace(/\[\&hellip;\]/g, '')
            .trim();
        
          return {
            title: item.title,
            link: item.link,
            excerpt: cleanedExcerpt,
            pubDate: item.date,
            author: item.creator || 'Unknown author',
            thumbnail: item.thumbnail?.url || null,
            slug: item.slug ?? '', // Provide a default value if slug is undefined
            jetpack_featured_media_url: item.jetpack_featured_media_url || null,
            description: item.description,
          };
        });

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
            <Link href={`/post/${post.slug}`} passHref>
              <div className="block p-6 text-blue-600">
                {post.jetpack_featured_media_url && (
                  <Image
                    src={post.jetpack_featured_media_url}
                    alt={`Thumbnail for ${post.title}`}
                    width={700} 
                    height={450} 
                    className="object-cover h-48 w-full"
                  />
                )}
                <h2 className="text-xl font-bold">{post.title}</h2>
                <p className="text-sm text-gray-600">{post.pubDate}</p>
                
              </div>
            </Link>
            <p className="mt-1 p-6 text-black">{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogPosts;
