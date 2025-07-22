import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/30 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary leading-tight">
              Transforming Data into Strategic{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Insights
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-primary font-semibold">
              Google Certified Data Analytics Professional
            </p>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Salman Sakib
            </h2>
          </div>

          {/* Description */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            4x Microsoft Certified Analytics Engineer with 5+ years of experience transforming 
            complex data into actionable insights. Specializing in Power BI, Microsoft Fabric, 
            and data engineering solutions that drive business growth.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild
              size="lg" 
              className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-3 text-lg font-semibold shadow-card hover:shadow-hover transition-all"
            >
              <Link to="/portfolio">
                <ExternalLink className="mr-2 h-5 w-5" />
                View Portfolio
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-lg font-semibold"
              onClick={() => {
                const contactSection = document.getElementById('contact');
                contactSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Mail className="mr-2 h-5 w-5" />
              Get in Touch
            </Button>
          </div>

          {/* Location */}
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-lg">
              Dhaka, Bangladesh • Available for global remote projects
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;