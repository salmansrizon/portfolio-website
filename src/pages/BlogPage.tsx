import Navbar from "@/components/Navbar";
import Blogs from "@/components/Blogs";
import { usePageView } from "@/hooks/usePageView";

const BlogPage = () => {
  usePageView("/blog");
  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />
      <Blogs />
    </div>
  );
};

export default BlogPage;
