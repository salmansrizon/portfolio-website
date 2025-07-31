import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Certifications from "@/components/Certifications";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Blogs from "@/components/Blogs";
import Contact from "@/components/Contact";
import Courses from "@/components/Courses";

const Index = () => {
  const location = useLocation();

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
      {/* <Certifications /> */}
      <Services />
      <Blogs />
      <Testimonials />
      <Courses />
      <Contact />
    </div>
  );
};

export default Index;
