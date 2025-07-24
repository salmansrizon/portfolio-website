import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, ExternalLink } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { BlogPost } from '@/types/blog';

const Blogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs((data || []) as BlogPost[]);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let blogSubscription: RealtimeChannel;

    const setupRealtimeSubscription = async () => {
      // Subscribe to changes
      blogSubscription = supabase
        .channel('blogs-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'blogs'
          },
          () => {
            fetchBlogs();
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (blogSubscription) {
        supabase.removeChannel(blogSubscription);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4 ">Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-primary font-semibold" >
            Insights and thoughts on data analytics, engineering, and the latest trends in technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {blog.featured_image && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={blog.featured_image}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-bold line-clamp-2 text-primary">{blog.title}</CardTitle>
                  {blog.source_type !== 'local' && (
                    <Badge variant="outline" className="ml-2">
                      {blog.source_type.charAt(0).toUpperCase() + blog.source_type.slice(1)}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(blog.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3 mb-4">{blog.excerpt}</p>
                <Button 
                  variant="outline" 
                  className="w-full group text-primary hover:text-primary-hover"
                  onClick={() => {
                    if (blog.source_type !== 'local' && blog.source_url) {
                      window.open(blog.source_url, '_blank');
                    } else {
                      navigate(`/blog/${blog.slug}`);
                    }
                  }}
                >
                  {blog.source_type !== 'local' ? (
                    <>
                      View on {blog.source_type.charAt(0).toUpperCase() + blog.source_type.slice(1)}
                      <ExternalLink className="h-4 w-4 ml-2 text-primary transition-transform group-hover:translate-x-1" />
                    </>
                  ) : (
                    <>
                      Read More
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {blogs.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p>No blog posts available yet.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Blogs;
