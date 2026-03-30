import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import { SQLProvider } from "@/contexts/SQLContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import PortfolioPage from "./pages/PortfolioPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetails from "./pages/CourseDetails";
import BookSession from "./pages/BookSession";
import NotFound from "./pages/NotFound";
import CareerPrep from "./pages/CareerPrep";
import SQLChallenge from "./pages/SQLChallenge";
import WebinarLanding from "./pages/WebinarLanding";
import FloatingContact from "@/components/FloatingContact";
import WebinarFloatingButton from "@/components/WebinarFloatingButton";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <FloatingContact />
            <WebinarFloatingButton />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/course/:courseId" element={<CourseDetails />} />
              <Route path="/book-session" element={<BookSession />} />
              <Route path="/career-prep" element={<CareerPrep />} />
              <Route path="/career-prep/solve/:slug" element={<SQLProvider><SQLChallenge /></SQLProvider>} />
              <Route path="/webinar/:id" element={<WebinarLanding />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
