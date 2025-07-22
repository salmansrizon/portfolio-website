import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, Quote } from "lucide-react";

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Client Testimonials</h2>
          <p className="text-xl text-muted-foreground">
            What clients say about working with me
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main Testimonial */}
          <Card className="shadow-card mb-12">
            <CardContent className="p-8">
              <div className="flex items-start mb-6">
                <Quote className="h-8 w-8 text-primary mr-4 flex-shrink-0 mt-1" />
                <blockquote className="text-lg text-foreground leading-relaxed italic">
                  "Ahmed Sulaiman truly impressed with his exceptional professionalism and keen 
                  attention to detail in data visualization. His cooperative nature and quick 
                  responsiveness made working with him a seamless experience. I look forward to 
                  future collaborations as he consistently goes ABOVE AND BEYOND expectations! 🌟"
                </blockquote>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground">asainternet</div>
                  <div className="text-muted-foreground">Client • United States</div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fiverr Stats */}
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
          </div>

          {/* Fiverr CTA */}
          <div className="text-center">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-3"
              asChild
            >
              <a 
                href="https://www.fiverr.com/bi_with_ahmed" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                View Fiverr Profile
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;