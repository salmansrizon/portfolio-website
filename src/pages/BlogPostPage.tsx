import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import Navbar from "@/components/Navbar";
import { BlogPost } from '@/types/blog';
import { CodeBlock, dracula } from 'react-code-blocks';
import { usePageView } from "@/hooks/usePageView";

const BlogPostPage = () => {
  const { slug } = useParams();
  usePageView(`/blog/${slug}`);
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single();

        if (error) throw error;
        setBlog(data as unknown as BlogPost);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        navigate('/blog'); // Redirect to blog list if post not found
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [slug, navigate]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-16 bg-background">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <>
      <Navbar />
      <article className="min-h-screen pt-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Button
            variant="ghost"
            className="mb-8 group"
            onClick={() => navigate('/blog')}
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Blog
          </Button>

          {blog.featured_image && (
            <div className="aspect-video overflow-hidden rounded-lg mb-8">
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h1 className="text-4xl font-bold text-foreground mb-4">{blog.title}</h1>
            <div className="flex items-center text-muted-foreground mb-8">
              <time dateTime={blog.created_at}>
                {new Date(blog.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>

            <div className="text-foreground leading-relaxed">
              {blog.content.map((item, index) => {
                switch (item.type) {
                  case 'text':
                    return (
                      <div key={index} className="mb-6 whitespace-pre-wrap">
                        {item.content}
                      </div>
                    );
                  case 'image':
                    return (
                      <figure key={index} className="my-8">
                        <img
                          src={item.url}
                          alt={item.alt}
                          className="rounded-lg w-full"
                          loading="lazy"
                          decoding="async"
                        />
                        {item.caption && (
                          <figcaption className="text-center text-muted-foreground mt-2">
                            {item.caption}
                          </figcaption>
                        )}
                      </figure>
                    );
                  case 'code':
                    return (
                      <div key={index} className="my-8">
                        <CodeBlock
                          text={item.code}
                          language={item.language}
                          theme={dracula}
                          showLineNumbers
                        />
                        {item.caption && (
                          <p className="text-center text-muted-foreground mt-2">
                            {item.caption}
                          </p>
                        )}
                      </div>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default BlogPostPage;
