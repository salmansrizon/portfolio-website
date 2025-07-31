import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { BlogPost } from '@/types/blog';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";

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
    <section className="w-full py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">{title}</h2>
          <p className="text-xl text-muted-foreground text-primary font-semibold">
            Discover my latest articles and tutorials
          </p>
        </div>

        <div className="mt-8">
          <Tabs 
            value={selectedCategory} 
            onValueChange={setSelectedCategory}
            className="flex flex-col items-center"
          >
            <TabsList className="mb-8 flex-wrap h-auto">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="relative px-4 py-2 text-sm"
                >
                  {category.label}
                  <span className="ml-2 text-xs bg-muted rounded-full px-2 py-0.5">
                    {category.count}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {filteredBlogs.length > 0 ? (
            <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-1">
                {filteredBlogs.map((blog) => (
                  <CarouselItem key={blog.id} className="pl-1 md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
                        {blog.featured_image && (
                          <div className="aspect-video overflow-hidden">
                            <img
                              src={blog.featured_image}
                              alt={blog.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-6">
                          <div className="flex flex-wrap gap-2 mb-3">
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
                          <h3 className="text-xl font-bold mb-2 line-clamp-2">
                            {blog.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                            {blog.excerpt}
                          </p>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {format(new Date(blog.created_at), 'MMM d, yyyy')}
                            </span>
                            <Button variant="ghost" size="sm" className="group" asChild>
                              <a href={`/blog/${blog.slug}`}>
                                Read more
                                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </a>
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
