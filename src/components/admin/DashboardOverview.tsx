import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CalendarCheck, BookOpen, FileText, FolderKanban, Activity, Eye, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  activeCourses: number;
  publishedBlogs: number;
  totalProjects: number;
  totalPageViews: number;
  uniqueVisitors: number;
  todayViews: number;
}

interface ActivityItem {
  id: string;
  title: string;
  type: 'booking' | 'blog' | 'project';
  date: string;
  status?: string;
}

export default function DashboardOverview() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    activeCourses: 0,
    publishedBlogs: 0,
    totalProjects: 0,
    totalPageViews: 0,
    uniqueVisitors: 0,
    todayViews: 0
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          { count: bookingsCount, error: bookingsError },
          { count: pendingBookingsCount, error: pendingError },
          { count: coursesCount, error: coursesError },
          { count: blogsCount, error: blogsError },
          { count: projectsCount, error: projectsError },
          { data: recentBookings },
          { data: recentBlogs },
          { count: pageViewsCount },
          { data: visitorData },
          { count: todayViewsCount },
        ] = await Promise.all([
          supabase.from('session_bookings').select('*', { count: 'exact', head: true }),
          supabase.from('session_bookings').select('*', { count: 'exact', head: true }).eq('booking_status', 'pending'),
          supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'published'),
          supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('published', true),
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('session_bookings').select('id, user_name, created_at, booking_status').order('created_at', { ascending: false }).limit(3),
          supabase.from('blogs').select('id, title, created_at').order('created_at', { ascending: false }).limit(3),
          supabase.from('page_views').select('*', { count: 'exact', head: true }),
          supabase.from('page_views').select('visitor_id'),
          supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
        ]);

        const uniqueVisitors = new Set((visitorData || []).map((r: any) => r.visitor_id)).size;

        if (bookingsError) throw bookingsError;
        if (pendingError) throw pendingError;
        if (coursesError) throw coursesError;
        if (blogsError) throw blogsError;
        if (projectsError) throw projectsError;

        setStats({
          totalBookings: bookingsCount || 0,
          pendingBookings: pendingBookingsCount || 0,
          activeCourses: coursesCount || 0,
          publishedBlogs: blogsCount || 0,
          totalProjects: projectsCount || 0,
          totalPageViews: pageViewsCount || 0,
          uniqueVisitors,
          todayViews: todayViewsCount || 0,
        });

        // Map and sort recent activity
        const activities: ActivityItem[] = [];
        if (recentBookings) {
          activities.push(...recentBookings.map((b: any) => ({
            id: b.id,
            title: `New booking: ${b.user_name}`,
            type: 'booking' as const,
            date: b.created_at,
            status: b.booking_status
          })));
        }
        if (recentBlogs) {
          activities.push(...recentBlogs.map((b: any) => ({
            id: b.id,
            title: `Blog post: ${b.title}`,
            type: 'blog' as const,
            date: b.created_at
          })));
        }
        
        // Sort by date descending
        activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecentActivity(activities.slice(0, 5));

      } catch (error: any) {
        toast({
          title: "Error fetching stats",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-2">
          Here is a quick summary of your portfolio and platform activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingBookings} pending verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCourses}</div>
            <p className="text-xs text-muted-foreground">
              Published on platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Blogs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedBlogs}</div>
            <p className="text-xs text-muted-foreground">
              Live blog posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              In portfolio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPageViews}</div>
            <p className="text-xs text-muted-foreground">
              {stats.todayViews} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueVisitors}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity found.</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      {activity.type === 'booking' ? <CalendarCheck className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString()} {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {activity.status && (
                      <div className="ml-auto font-medium text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {activity.status}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
