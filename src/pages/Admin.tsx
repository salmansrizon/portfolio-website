import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Settings, FileText, Award, Briefcase, MessageSquare, User, FolderKanban, GraduationCap, CalendarCheck, LayoutDashboard, Menu, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import SessionBookingManager from '@/components/admin/SessionBookingManager';
import BrandLogosManager from '@/components/admin/BrandLogosManager';

const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'sections', label: 'Sections', icon: Settings },
  { id: 'blogs', label: 'Blogs', icon: FileText },
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { id: 'courses', label: 'Courses', icon: GraduationCap },
  { id: 'sessions', label: 'Sessions', icon: CalendarCheck },
  { id: 'brand-logos', label: 'Brand Logos', icon: Image },
  { id: 'profile', label: 'Profile', icon: User },
];

const Admin = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
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
      case 'sessions':
        return <SessionBookingManager />;
      case 'brand-logos':
        return <BrandLogosManager />;
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
    <div className="min-h-screen relative flex flex-col bg-gradient-to-br from-background to-accent/30 overflow-hidden">
      {/* Background Blur Elements (From Hero) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-1/3 left-1/3 w-56 h-56 bg-blue-300/8 rounded-full blur-xl animate-float-delayed"></div>
        <div className="absolute top-1/5 left-1/2 w-32 h-32 bg-primary/15 rounded-full blur-lg animate-bounce-slow"></div>
        <div className="absolute bottom-1/5 right-1/2 w-24 h-24 bg-accent/12 rounded-full blur-lg animate-bounce-slow delay-500"></div>
      </div>
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/30 pointer-events-none z-0"></div>

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