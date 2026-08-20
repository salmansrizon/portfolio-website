import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Settings, FileText, Award, Briefcase, MessageSquare, User, FolderKanban, GraduationCap, CalendarCheck, LayoutDashboard, Menu, Image, UserCheck, Users, Star, Database, Calendar, Map, CalendarX, BookOpen, Route, ListChecks, BookDown, TrendingUp, Lightbulb
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { shouldRejectFromAdmin } from '@/lib/authRouting';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Managers
import DashboardOverview from '@/components/admin/DashboardOverview';
import SectionEditor from '@/components/admin/SectionEditor';
import BlogManager from '@/components/admin/BlogManager';
import ServicesManager from '@/components/admin/ServicesManager';
import CertificationsManager from '@/components/admin/CertificationsManager';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import ProjectManager from '@/components/admin/ProjectManager';
import CourseManager from '@/components/admin/CourseManager';
import CourseCategoryManager from '@/components/admin/CourseCategoryManager';
import SessionBookingManager from '@/components/admin/SessionBookingManager';
import BrandLogosManager from '@/components/admin/BrandLogosManager';
import InstructorManager from '@/components/admin/InstructorManager';
import StudentManager from '@/components/admin/StudentManager';
import CourseReviewManager from '@/components/admin/CourseReviewManager';
import CareerPrepManager from '@/components/admin/CareerPrepManager';
import WebinarManager from '@/components/admin/WebinarManager';
import RoadmapManager from '@/components/admin/RoadmapManager';
import JourneyManager from '@/components/admin/JourneyManager';
import EbookManager from '@/components/admin/EbookManager';
import TopicManager from '@/components/admin/TopicManager';
import FunnelDashboard from '@/components/admin/FunnelDashboard';
import UnavailableSlotsManager from '@/components/admin/UnavailableSlotsManager';
import CourseContentManager from '@/components/admin/CourseContentManager';

const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'webinars', label: 'Webinars', icon: Calendar },
  { id: 'sections', label: 'Sections', icon: Settings },
  { id: 'blogs', label: 'Blogs', icon: FileText },
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { id: 'courses', label: 'Courses', icon: GraduationCap },
  { id: 'instructors', label: 'Instructors', icon: UserCheck },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'sessions', label: 'Sessions', icon: CalendarCheck },
  { id: 'unavailable-slots', label: 'Unavailable Slots', icon: CalendarX },
  { id: 'course-content', label: 'Course Content', icon: BookOpen },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'brand-logos', label: 'Brand Logos', icon: Image },
  { id: 'career-prep', label: 'Career Prep', icon: Database },
  { id: 'roadmaps', label: 'Roadmaps', icon: Map },
  { id: 'journeys', label: 'Journeys', icon: Route },
  { id: 'topics', label: 'Topics', icon: Lightbulb },
  { id: 'ebooks', label: 'Ebooks', icon: BookDown },
  { id: 'funnel', label: 'Funnel', icon: TrendingUp },
  { id: 'profile', label: 'Profile', icon: User },
];

const Admin = () => {
  const { user, isAdmin, adminChecked, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  // Every visitor is signed in — anonymously, if they have no account — so
  // "is there a user" is no longer a guard. The panel requires the admin role,
  // checked against the same is_admin() the RLS policies use.
  React.useEffect(() => {
    if (shouldRejectFromAdmin({ hasUser: !!user, isAnonymous: false, adminChecked, isAdmin })) {
      navigate('/auth');
    }
  }, [user, adminChecked, isAdmin, navigate]);

  if (!adminChecked) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Checking permissions…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'journeys':
        return <JourneyManager />;
      case 'topics':
        return <TopicManager />;
      case 'ebooks':
        return <EbookManager />;
      case 'funnel':
        return <FunnelDashboard />;
      case 'webinars':
        return <WebinarManager />;
      case 'sections':
        return <SectionEditor />;
      case 'blogs':
        return <BlogManager />;
      case 'services':
        return <ServicesManager />;
      case 'certifications':
        return <CertificationsManager />;
      case 'projects':
        return <ProjectManager />;
      case 'testimonials':
        return <TestimonialsManager />;
      case 'courses':
        return <CourseManager />;
      case 'instructors':
        return <InstructorManager />;
      case 'students':
        return <StudentManager />;
      case 'sessions':
        return <SessionBookingManager />;
      case 'unavailable-slots':
        return <UnavailableSlotsManager />;
      case 'course-content':
        return <CourseContentManager />;
      case 'reviews':
        return <CourseReviewManager />;
      case 'brand-logos':
        return <BrandLogosManager />;
      case 'career-prep':
        return <CareerPrepManager />;
      case 'roadmaps':
        return <RoadmapManager />;
      case 'profile':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Account Created</label>
                  <p className="text-sm text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return <DashboardOverview />;
    }
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col gap-2 p-4">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (onClick) onClick();
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              isActive 
                ? 'bg-primary text-primary-foreground font-medium shadow-sm' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen relative flex flex-col bg-background overflow-hidden">
      {/* Background Blur Elements (From Hero) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      </div>
      
      {/* Gradient overlay for depth */}

      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b/50 bg-background/60 backdrop-blur-xl px-4 md:px-6 shadow-sm">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b">
                <span className="font-semibold text-lg tracking-tight text-primary">Admin Panel</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <NavLinks onClick={() => setIsMobileMenuOpen(false)} />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex-1">
          <h1 className="text-xl font-bold text-primary hidden md:block">Admin Panel</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={() => navigate('/')} className="hidden sm:flex">
            View Site
          </Button>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r/50 bg-background/40 backdrop-blur-md overflow-y-auto">
          <div className="p-4 border-b/50">
            <p className="text-sm text-muted-foreground truncate" title={user.email}>{user.email}</p>
          </div>
          <NavLinks />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-transparent">
          <div className="container p-4 md:p-8 max-w-7xl mx-auto">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;