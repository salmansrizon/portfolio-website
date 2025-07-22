import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Certifications from "@/components/Certifications";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Blogs from "@/components/Blogs";
import Contact from "@/components/Contact";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Certifications />
      <Services />
      <Blogs />
      <Testimonials />
      <Contact />
    </div>
  );
};

export default Index;
