import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CalendarCheck, BookOpen, FileText, FolderKanban, Activity, Eye, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

interface PagePerformance {
  page_path: string;
  page_title: string;
  views: number;
  unique_visitors: number;
  avg_time_on_page: number;
  bounce_rate: number;
}

// Helper to get human-readable page titles from paths
function getPageTitle(path: string): string {
  const routeMap: Record<string, string> = {
    '/': 'Home',
    '/portfolio': 'Portfolio',
    '/blog': 'Blog',
    '/blog/': 'Blog Post',
    '/courses': 'Courses',
    '/roadmaps': 'Roadmaps',
    '/career-prep': 'Career Prep',
    '/book-session': 'Book Session',
    '/webinar': 'Webinar',
    '/sql-challenge': 'SQL Challenge',
  };

  // Check for exact match
  if (routeMap[path]) return routeMap[path];
  
  // Check for blog post pattern
  if (path.startsWith('/blog/')) return 'Blog Post';
  if (path.startsWith('/courses/')) return 'Course Details';
  if (path.startsWith('/roadmaps/')) return 'Roadmap Details';
  
  return path;
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
  const [dailyViews, setDailyViews] = useState<{ date: string; views: number; visitors: number }[]>([]);
  const [pagePerformance, setPagePerformance] = useState<PagePerformance[]>([]);
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
          { data: chartData },
          { data: pagePerformanceData },
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
          supabase.from('page_views').select('created_at, visitor_id').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('page_views').select('page_path, visitor_id').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        ]);

        const uniqueVisitors = new Set((visitorData || []).map((r: any) => r.visitor_id)).size;

        // Build daily chart data for last 30 days
        const dailyMap = new Map<string, { views: number; visitorSet: Set<string> }>();
        for (let i = 29; i >= 0; i--) {
          const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
          const key = d.toISOString().split('T')[0];
          dailyMap.set(key, { views: 0, visitorSet: new Set() });
        }
        (chartData || []).forEach((row: any) => {
          const key = new Date(row.created_at).toISOString().split('T')[0];
          const entry = dailyMap.get(key);
          if (entry) {
            entry.views++;
            entry.visitorSet.add(row.visitor_id);
          }
        });
        setDailyViews(
          Array.from(dailyMap.entries()).map(([date, { views, visitorSet }]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            views,
            visitors: visitorSet.size,
          }))
        );

        // Process page performance data (GA4-style)
        const pageMap = new Map<string, { views: number; visitorSet: Set<string> }>();
        (pagePerformanceData || []).forEach((row: any) => {
          const path = row.page_path;
          if (!pageMap.has(path)) {
            pageMap.set(path, { views: 0, visitorSet: new Set() });
          }
          const entry = pageMap.get(path)!;
          entry.views++;
          entry.visitorSet.add(row.visitor_id);
        });

        const pagePerfArray: PagePerformance[] = Array.from(pageMap.entries()).map(([page_path, data]) => ({
          page_path,
          page_title: getPageTitle(page_path),
          views: data.views,
          unique_visitors: data.visitorSet.size,
          avg_time_on_page: 0, // Would need additional tracking
          bounce_rate: 0, // Would need additional tracking
        })).sort((a, b) => b.views - a.views).slice(0, 10); // Top 10 pages

        setPagePerformance(pagePerfArray);

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

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Daily Page Views — Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyViews} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))',
                  }}
                />
                <Area type="monotone" dataKey="views" name="Page Views" stroke="hsl(var(--primary))" fill="url(#viewsGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="visitors" name="Unique Visitors" stroke="hsl(var(--accent-foreground))" fill="url(#visitorsGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* GA4-style Page Performance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Page Performance (Last 30 Days)</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            GA4-style insights for your top pages
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Page</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Views</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Unique Visitors</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Views per Visitor</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Performance</th>
                </tr>
              </thead>
              <tbody>
                {pagePerformance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      No page view data available yet
                    </td>
                  </tr>
                ) : (
                  pagePerformance.map((page, index) => (
                    <tr key={page.page_path} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-xs">{index + 1}</span>
                          <div>
                            <div className="font-medium">{page.page_title}</div>
                            <div className="text-xs text-muted-foreground">{page.page_path}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-3 px-2 font-mono">
                        {page.views.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-2 font-mono">
                        {page.unique_visitors.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-2 font-mono">
                        {(page.views / page.unique_visitors).toFixed(1)}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-primary h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((page.views / pagePerformance[0].views) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {((page.views / pagePerformance[0].views) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing top {pagePerformance.length} pages by views</span>
            <span>Data from last 30 days</span>
          </div>
        </CardContent>
      </Card>

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
