import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Database, GraduationCap, ArrowRight } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: BarChart3,
      title: "Power BI Consulting",
      description: "Transform your data into powerful visual insights with custom Power BI solutions that drive business decisions.",
      features: [
        "Dashboard Development",
        "Report Optimization", 
        "Custom Solutions",
        "Performance Tuning",
        "Data Modeling"
      ]
    },
    {
      icon: Database,
      title: "Data Engineering",
      description: "Build robust data infrastructure and pipelines that scale with your business needs using modern cloud technologies.",
      features: [
        "ETL Pipeline Development",
        "Database Optimization",
        "Microsoft Fabric Implementation", 
        "Data Lake Architecture",
        "Real-time Analytics"
      ]
    },
    {
      icon: GraduationCap,
      title: "Training & Mentoring",
      description: "Empower your team with data analytics skills through comprehensive training programs and personalized mentoring.",
      features: [
        "Corporate Training",
        "One-on-one Mentoring",
        "Workshop Facilitation",
        "Certification Prep",
        "Custom Curriculum"
      ]
    }
  ];

  return (
    <section id="services" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Services</h2>
          <p className="text-xl text-muted-foreground">
            Comprehensive data analytics solutions tailored to your business needs
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="shadow-card hover:shadow-hover transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">What's Included:</h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-muted-foreground">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    className="w-full bg-primary hover:bg-primary-hover text-primary-foreground group-hover:shadow-hover transition-all"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Custom Solution CTA */}
        <Card className="bg-gradient-hero text-white shadow-hover">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Need a custom solution?</h3>
            <p className="text-lg mb-6 opacity-90">
              Let's discuss your specific requirements and create a tailored solution for your business.
            </p>
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 font-semibold"
            >
              Schedule a Consultation
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Services;