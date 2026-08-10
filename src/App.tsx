import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import { SQLProvider } from "@/contexts/SQLContext";
import Index from "./pages/Index";
import FloatingContact from "@/components/FloatingContact";
import WebinarFloatingButton from "@/components/WebinarFloatingButton";

// Index is the landing page most first-time visitors hit, so it stays eager.
// Every other route is a lazy adapter — its code only loads when a visitor
// actually navigates there, keeping heavy per-route deps (Admin's Manager
// components, SQLChallenge's Monaco/PGlite) out of the initial bundle.
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const CourseDetails = lazy(() => import("./pages/CourseDetails"));
const BookSession = lazy(() => import("./pages/BookSession"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CareerPrep = lazy(() => import("./pages/CareerPrep"));
const SQLChallenge = lazy(() => import("./pages/SQLChallenge"));
const WebinarLanding = lazy(() => import("./pages/WebinarLanding"));
const RoadmapsPage = lazy(() => import("./pages/RoadmapsPage"));
const RoadmapDetailPage = lazy(() => import("./pages/RoadmapDetailPage"));

const RouteFallback = () => (
  <div className="h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary opacity-40" />
  </div>
);

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
            <Suspense fallback={<RouteFallback />}>
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
                <Route path="/roadmaps" element={<RoadmapsPage />} />
                <Route path="/roadmaps/:slug" element={<RoadmapDetailPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
