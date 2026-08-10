import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Database, Brain, ArrowRight, Loader2 ,ChartArea} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from '@supabase/supabase-js';
import ScrollReveal from "./ScrollReveal";

interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon?: string;
  created_at: string;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();

    let servicesSubscription: RealtimeChannel;

    const setupRealtimeSubscription = async () => {
      // Subscribe to changes
      servicesSubscription = supabase
        .channel('services-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'services'
          },
          () => {
            fetchServices();
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (servicesSubscription) {
        supabase.removeChannel(servicesSubscription);
      }
    };
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <section id="services" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Services</h2>
            <p className="text-xl text-muted-foreground text-primary font-semibold">
              Comprehensive data analytics solutions tailored to your business needs
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Map icon string to actual icon component */}
          {services.map((service, index) => {
            const iconMap: Record<string, React.ElementType> = {
              BarChart3,
              Brain,
              ChartArea
            };
            const IconComponent = service.icon ? iconMap[service.icon] : BarChart3;
            return (
              <ScrollReveal key={index} direction="up" delay={index * 0.1}>
                <Card className="h-full flex flex-col shadow-card hover:shadow-hover transition-all duration-300 group hover:scale-[1.02] hover:border-primary/30">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {IconComponent ? (
                      <IconComponent className="h-8 w-8 text-white" />
                    ) : null}
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-foreground break-words">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-6">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed break-words">
                    {service.description}
                  </p>

                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-3">What's Included:</h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-sm sm:text-base text-muted-foreground">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          <span className="break-words leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className="w-full mt-auto bg-primary hover:bg-primary-hover text-primary-foreground group-hover:shadow-hover transition-all"
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Custom Solution CTA */}
        <ScrollReveal direction="scale" delay={0.3}>
          <Card className="bg-gradient-hero text-white shadow-hover border-primary/20 backdrop-blur-md">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Need a custom solution?</h3>
            <p className="text-lg mb-6 opacity-90">
              Let's discuss your specific requirements and create a tailored solution for your business.
            </p>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 font-semibold"
            >
              <Link to="/book-session">Schedule a Consultation</Link>
            </Button>
          </CardContent>
        </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Services;