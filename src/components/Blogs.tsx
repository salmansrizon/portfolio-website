import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowRight, ExternalLink, Search } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { BlogPost } from '@/types/blog';
import defaultFeaturedImage from "@/assets/default-blog-featured.webp";

const BLOG_CATEGORIES = [
  { id: 'all', label: 'All Posts' },
  { id: 'data-analytics', label: 'Data Analytics' },
  { id: 'data-engineering', label: 'Data Engineering' },
  { id: 'machine-learning', label: 'Machine Learning' },
  { id: 'tutorials', label: 'Tutorials' },
  { id: 'updates', label: 'Updates' },
];

const Blogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
                            (blog.categories && blog.categories.includes(selectedCategory));
      
      return matchesSearch && matchesCategory;
    });
  }, [blogs, searchQuery, selectedCategory]);

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
          <h1 className="text-5xl font-bold text-foreground mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-primary font-semibold">
            Insights and thoughts on data analytics, engineering, and the latest trends in technology
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search blog posts..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="overflow-x-auto pb-2">
            <Tabs 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
              className="w-full"
            >
              <TabsList className="flex justify-start md:justify-center w-full bg-transparent">
                {BLOG_CATEGORIES.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap"
                  >
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col hover:scale-[1.02] hover:border-primary/30">
              <div className="aspect-video overflow-hidden">
                <img
                  src={blog.featured_image || defaultFeaturedImage}
                  alt={blog.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl font-bold line-clamp-2 text-primary">
                      {blog.title}
                    </CardTitle>
                    {blog.source_type !== 'local' && (
                      <Badge variant="outline" className="ml-2 flex-shrink-0">
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
                  {blog.categories && blog.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {blog.categories.slice(0, 2).map((category) => (
                        <Badge 
                          key={category} 
                          variant="secondary" 
                          className="text-xs"
                        >
                          {category}
                        </Badge>
                      ))}
                      {blog.categories.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{blog.categories.length - 2} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-muted-foreground line-clamp-3 mb-4 flex-1">
                    {blog.excerpt}
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full group text-primary hover:text-primary-hover mt-auto"
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
              </div>
            </Card>
          ))}
        </div>

        {filteredBlogs.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-foreground mb-2">No blog posts found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Check back later for new posts!'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Blogs;
