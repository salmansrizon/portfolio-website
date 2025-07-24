import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  MapPin, 
  Clock, 
  Linkedin, 
  Github, 
  Download,
  ExternalLink,
  Shield,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

const Contact = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [isBusinessHours, setIsBusinessHours] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    message: ''
  });
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const subject = `New Contact from ${formData.name}`;
    const body = `
Name: ${formData.name}
Email: ${formData.email}
Service: ${formData.service || 'Not specified'}

Message:
${formData.message}
    `.trim();

    const mailtoUrl = `mailto:salmansrizon2016@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoUrl;

    // Reset form after small delay to ensure mailto opens
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        service: '',
        message: ''
      });
      
      toast({
        title: "Success",
        description: "Email client opened with your message. Please send the email to complete.",
      });
    }, 1000);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Convert to GMT+6
      const gmt6Time = new Date(now.getTime() + (6 * 60 * 60 * 1000));
      
      // Format time as HH:MM AM/PM
      const timeString = gmt6Time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
      });

      setCurrentTime(timeString);

      // Check if current time is within business hours (9 AM - 6 PM)
      const hour = gmt6Time.getUTCHours();
      setIsBusinessHours(hour >= 9 && hour < 18);
    };

    // Update immediately
    updateTime();

    // Update every minute
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Let's Work Together</h2>
          <p className="text-xl text-muted-foreground text-primary font-semibold">
            Ready to transform your data into strategic insights?
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center">
                <Mail className="mr-3 h-6 w-6 text-primary" />
                Send a Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input 
                    id="name" 
                    placeholder="Your name" 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="service">Service Needed</Label>
                <Select value={formData.service} onValueChange={(value) => setFormData(prev => ({ ...prev, service: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="power-bi">Power BI Consulting</SelectItem>
                    <SelectItem value="data-engineering">Data Engineering</SelectItem>
                    <SelectItem value="fabric">Microsoft Fabric Implementation</SelectItem>
                    <SelectItem value="training">Training & Mentoring</SelectItem>
                    <SelectItem value="custom">Custom Analytics Solutions</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea 
                  id="message" 
                  placeholder="Describe your project or requirements..."
                  className="min-h-[120px]"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                />
                <div className="text-right text-sm text-muted-foreground">
                  {formData.message.length}/2000
                </div>
              </div>

              <Button 
                className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
                onClick={handleSubmit}
                disabled={!formData.name || !formData.email || !formData.message}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Message
              </Button>

              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Shield className="mr-2 h-4 w-4" />
                Protected by spam detection and rate limiting
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Availability */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground flex items-center">
                  <Clock className="mr-3 h-5 w-5 text-primary" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">Dhaka, Bangladesh</span>
                  </div>
                  <Badge 
                    className={isBusinessHours 
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-yellow-100 text-yellow-800 border-yellow-200"
                    }
                  >
                    {isBusinessHours ? "Available" : "Away"}
                  </Badge>
                </div>
                
                <div className="text-2xl font-bold text-primary">{currentTime}</div>
                <div className="text-muted-foreground">
                  Current Local Time (GMT+6)
                </div>
                <div className="text-sm text-muted-foreground">
                  Business Hours: 9:00 AM - 6:00 PM (Bangladesh Time)
                </div>
              </CardContent>
            </Card>

            {/* Connect Links */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">
                  Connect With Me
                </CardTitle>
                <p className="text-muted-foreground">
                  Prefer a direct approach? Connect with me on your favorite platform.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="https://www.linkedin.com/in/salman-srizon-252b79125/" target="_blank" rel="noopener noreferrer">
                      <Linkedin className="mr-2 h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                  
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="https://github.com/salmansrizon" target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                  
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="https://www.fiverr.com/sellers/salmansrizon/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Fiverr
                    </a>
                  </Button>
                  
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="https://docs.google.com/document/d/1lz3Qg-D93YhwzuOiWphFjvIs744osRia/edit" target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Resume
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Response */}
            <Card className="shadow-card bg-gradient-hero text-white">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Zap className="h-8 w-8 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Quick Response Guarantee</h3>
                    <p className="opacity-90 mb-4 leading-relaxed">
                      I typically respond to all inquiries within <strong>24 hours</strong>. 
                      For urgent projects, LinkedIn is the fastest way to reach me.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
