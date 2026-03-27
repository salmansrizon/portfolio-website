import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { BlogPost } from '@/types/blog';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import defaultFeaturedImage from "@/assets/default-blog-featured.webp";

const BLOG_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'data-analytics', label: 'Data Analytics' },
  { id: 'data-engineering', label: 'Data Engineering' },
  { id: 'machine-learning', label: 'Machine Learning' },
  { id: 'tutorials', label: 'Tutorials' },
  { id: 'updates', label: 'Updates' },
];

interface BlogCarouselProps {
  blogs: BlogPost[];
  title?: string;
  maxItems?: number;
}

export function BlogCarousel({ blogs, title = 'Latest Blogs', maxItems = 6 }: BlogCarouselProps) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter blogs by selected category
  const filteredBlogs = blogs.filter(blog => 
    selectedCategory === 'all' || blog.categories?.includes(selectedCategory)
  ).slice(0, maxItems);

  // Group blogs by category for the tabs
  const categories = [
    { id: 'all', label: 'All', count: blogs.length },
    ...BLOG_CATEGORIES.filter(cat => cat.id !== 'all').map(cat => ({
      ...cat,
      count: blogs.filter(blog => blog.categories?.includes(cat.id)).length
    })).filter(cat => cat.count > 0)
  ];

  if (blogs.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">{title}</h2>
          <p className="text-xl text-muted-foreground text-primary font-semibold">
            Discover my latest articles and tutorials
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <Tabs 
            value={selectedCategory} 
            onValueChange={setSelectedCategory}
            className="w-full"
          >
            <div className="flex justify-center w-full">
              <TabsList className="mb-8 flex-wrap justify-center h-auto bg-transparent border-none gap-2">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="relative px-6 py-2.5 text-sm rounded-full border border-border/50 bg-background/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all shadow-sm"
                  >
                    {category.label}
                    <span className="ml-2 text-[10px] bg-muted/50 rounded-full px-2 py-0.5 font-bold">
                      {category.count}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>


          {filteredBlogs.length > 0 ? (
            <Carousel
              opts={{
                align: "start",
                loop: false,
                slidesToScroll: 1,
                breakpoints: {
                  '(min-width: 768px)': { slidesToScroll: 2 },
                  '(min-width: 1024px)': { slidesToScroll: 3 }
                }
              }}
              className="w-full"
            >
               <CarouselContent className="-ml-2 md:-ml-4">
                 {filteredBlogs.map((blog, index) => (
                   <CarouselItem key={blog.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 flex">
                     <div className="p-0.5 h-full w-full flex flex-col">
                       <Card className="flex-1 h-[480px] overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-2 hover:scale-[1.02] flex flex-col animate-slide-up group"
                        style={{ animationDelay: `${index * 150}ms` }}>
                        <div className="aspect-video overflow-hidden flex-shrink-0 relative">
                          <img
                            src={blog.featured_image || defaultFeaturedImage}
                            alt={blog.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <CardContent className="p-4 flex flex-col flex-1 relative">
                          <div className="absolute inset-x-0 inset-t-0 bottom-[10px] bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                          <div className="relative z-10 flex flex-wrap gap-2 mb-3 min-h-[32px]">
                            {blog.categories?.slice(0, 2).map((category) => (
                              <Badge key={category} variant="outline" className="text-xs">
                                {BLOG_CATEGORIES.find(c => c.id === category)?.label || category}
                              </Badge>
                            ))}
                            {blog.categories && blog.categories.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{blog.categories.length - 2} more
                              </Badge>
                            )}
                          </div>
                          <h3 className="relative z-10 text-lg font-bold mb-2 line-clamp-2 min-h-[56px] flex items-start transition-colors group-hover:text-primary">
                            {blog.title}
                          </h3>
                          <p className="relative z-10 text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 flex-1 min-h-[40px]">
                            {blog.excerpt}
                          </p>
                          <div className="relative z-10 flex items-center justify-between mt-auto pt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {format(new Date(blog.created_at), 'MMM d, yyyy')}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="group/btn relative overflow-hidden mb-2 sm:mb-0"
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
                                  <span className="relative z-10">
                                    View on {blog.source_type.charAt(0).toUpperCase() + blog.source_type.slice(1)}
                                  </span>
                                  <ExternalLink className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                </>
                              ) : (
                                <>
                                  <span className="relative z-10">Read more</span>
                                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="mt-6 flex justify-center gap-4">
                <CarouselPrevious className="relative left-0 top-0 -translate-y-0" />
                <CarouselNext className="relative right-0 top-0 -translate-y-0" />
              </div>
            </Carousel>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No blogs found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default BlogCarousel;
