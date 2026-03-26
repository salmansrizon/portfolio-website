import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePageView } from "@/hooks/usePageView";
import Navbar from "@/components/Navbar";
import BrandLogos from "@/components/BrandLogos";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Certifications from "@/components/Certifications";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Blogs from "@/components/Blogs";
import { BlogCarousel } from "@/components/BlogCarousel";
import Contact from "@/components/Contact";
import Courses from "@/components/Courses";
import { useState, useEffect as useFetch } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/types/blog";

const Index = () => {
  const location = useLocation();
  usePageView("/");
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useFetch(() => {
    const fetchFeaturedBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setFeaturedBlogs((data || []) as BlogPost[]);
      } catch (error) {
        console.error('Error fetching featured blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBlogs();
  }, []);

  useEffect(() => {
    // Handle hash-based navigation on initial page load
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        // Small timeout to ensure all elements are rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <BrandLogos />
      {/* <Certifications /> */}
      <Services />
      <BlogCarousel 
        blogs={featuredBlogs} 
        title="Featured Articles"
        maxItems={6}
      />
      <Testimonials />
      <Courses />
      <Contact />
    </div>
  );
};

export default Index;
