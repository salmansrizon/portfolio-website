import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import useEmblaCarousel from 'embla-carousel-react';
import ScrollReveal from "./ScrollReveal";
import { useSectionContent } from "@/hooks/useSectionContent";

interface Testimonial {
  id: string;
  client_name: string;
  company: string | null;
  content: string;
  rating: number;
  created_at: string;
}

interface ExpandedTestimonials {
  [key: string]: boolean;
}

const Testimonials = () => {
  const { content: sectionContent } = useSectionContent("testimonials");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<ExpandedTestimonials>({});

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const isContentOverflowing = (content: string) => {
    // Rough estimate of content height (average 50 characters per line, 5 lines max)
    return content.length > 250;
  };
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
    slidesToScroll: 1
  });

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTestimonials(data);
      }
      setIsLoading(false);
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (!emblaApi || !testimonials.length) return;

    const autoplay = () => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    };

    const intervalId = setInterval(autoplay, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [emblaApi, testimonials]);
  return (
    <section id="testimonials" className="py-12 md:py-20 bg-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">{sectionContent.title}</h2>
            <p className="text-xl text-muted-foreground text-primary font-semibold">
              {sectionContent.subtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-6xl mx-auto">
          <div className="relative">
            <div ref={emblaRef} className="overflow-hidden pb-12 px-4">
              <div className="flex space-x-4">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="flex-[0_0_calc(100%-2rem)] sm:flex-[0_0_calc(80%-1rem)] lg:flex-[0_0_calc(45%-1.5rem)] px-2">
                    <Card className="shadow-card h-[400px] sm:h-auto flex flex-col w-full max-w-2xl mx-auto hover:shadow-hover transition-all hover:border-primary/20">
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="flex-1">
                          <div className="flex items-start mb-4">
                            <Quote className="h-6 w-6 text-primary mr-4 flex-shrink-0 mt-1" />
                            <div className="relative flex-1">
                              <blockquote 
                                className={`text-base text-foreground leading-relaxed italic ${
                                  expanded[testimonial.id] ? '' : 'line-clamp-5'
                                }`}
                              >
                                "{testimonial.content}"
                              </blockquote>
                              {isContentOverflowing(testimonial.content) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(testimonial.id);
                                  }}
                                  className="text-sm text-primary hover:underline mt-2 focus:outline-none"
                                >
                                  {expanded[testimonial.id] ? 'Show less' : 'Read more'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-border">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-foreground">{testimonial.client_name}</div>
                              {testimonial.company && (
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {testimonial.company}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/20'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
              {/* Navigation Buttons - Desktop */}
              <div className="absolute -left-12 -right-12 top-1/2 -translate-y-1/2 hidden md:flex justify-between">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-background/80 backdrop-blur-sm hover:bg-accent shadow-lg"
                  onClick={() => emblaApi?.scrollPrev()}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-background/80 backdrop-blur-sm hover:bg-accent shadow-lg"
                  onClick={() => emblaApi?.scrollNext()}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>

              {/* Navigation Dots - Mobile */}
              <div className="flex justify-center gap-2 mt-6 md:hidden">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => emblaApi?.scrollTo(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === (emblaApi?.selectedScrollSnap() || 0)
                        ? 'bg-primary w-6'
                        : 'bg-muted-foreground/20'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Fiverr Stats
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">73</div>
                <div className="text-lg font-semibold text-foreground mb-2">Five-Star Reviews on Fiverr</div>
                <div className="flex items-center justify-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground">
                  Consistently delivering exceptional results
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">5+</div>
                <div className="text-lg font-semibold text-foreground mb-4">Years Experience</div>
                <p className="text-muted-foreground mb-4">
                  Delivering exceptional Power BI & data analytics solutions
                </p>
              </CardContent>
            </Card>
          </div> */}

          {/* Fiverr CTA */}
          <ScrollReveal direction="up" delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-3"
              asChild
            >
              <a
                href="https://upwork.com/freelancers/salmansakib"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Find me on Upwork
              </a>
            </Button>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-3"
              asChild
            >
              <a
                href="https://www.fiverr.com/salmansrizon"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Find me on Fiverr
              </a>
            </Button>
            {/* You can add a second button here if needed */}
          </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;