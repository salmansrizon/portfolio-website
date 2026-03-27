import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle2, XCircle, Trash2, Eye, EyeOff, MessageSquare, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseReview {
  id: string;
  course_id: string;
  student_name: string;
  student_email: string;
  rating: number;
  review_text: string | null;
  is_approved: boolean;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
}

const CourseReviewManager = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all reviews (admin can see all)
      const { data: reviewsData, error: reviewsError } = await (supabase
        .from("course_reviews" as any)
        .select("*")
        .order("created_at", { ascending: false }) as any);

      if (reviewsError) throw reviewsError;
      setReviews((reviewsData || []) as CourseReview[]);

      // Fetch courses for filter & display
      const { data: coursesData } = await supabase
        .from("courses")
        .select("id, title")
        .order("title");
      setCourses((coursesData || []) as Course[]);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to load reviews.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      const { error } = await (supabase
        .from("course_reviews" as any)
        .update({ is_approved: true })
        .eq("id", reviewId) as any);
      if (error) throw error;
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_approved: true } : r));
      toast({ title: "✅ Review Approved", description: "This review is now publicly visible." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      const { error } = await (supabase
        .from("course_reviews" as any)
        .update({ is_approved: false })
        .eq("id", reviewId) as any);
      if (error) throw error;
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_approved: false } : r));
      toast({ title: "Review Hidden", description: "This review is now hidden from public." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    setActionLoading(reviewId);
    try {
      const { error } = await (supabase
        .from("course_reviews" as any)
        .delete()
        .eq("id", reviewId) as any);
      if (error) throw error;
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      toast({ title: "Review Deleted", description: "The review has been permanently removed." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const getCourseName = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.title || "Unknown Course";
  };

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "approved" && review.is_approved) ||
      (filterStatus === "pending" && !review.is_approved);
    const matchesCourse = filterCourse === "all" || review.course_id === filterCourse;
    const matchesSearch =
      !searchQuery ||
      review.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.student_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.review_text || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCourse && matchesSearch;
  });

  const approvedCount = reviews.filter(r => r.is_approved).length;
  const pendingCount = reviews.filter(r => !r.is_approved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-primary" />
          Course Reviews
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Approve, hide, or delete student reviews across all courses.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Total Reviews</p>
                <p className="text-3xl font-extrabold text-foreground mt-1">{reviews.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Approved</p>
                <p className="text-3xl font-extrabold text-green-600 mt-1">{approvedCount}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Pending</p>
                <p className="text-3xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
              </div>
              <EyeOff className="w-8 h-8 text-amber-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[160px] bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-full sm:w-[200px] bg-background">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No reviews found matching your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <Card key={review.id} className={`bg-card/60 backdrop-blur-sm border-border/50 transition-all hover:shadow-md ${!review.is_approved ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-green-400'}`}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Avatar & Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {review.student_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{review.student_name}</span>
                        <Badge variant={review.is_approved ? "default" : "secondary"} className={`text-[10px] px-1.5 py-0 ${review.is_approved ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 hover:bg-green-200' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 hover:bg-amber-200'}`}>
                          {review.is_approved ? "Approved" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{review.student_email}</p>
                      
                      {/* Course Badge */}
                      <Badge variant="outline" className="mt-2 text-[10px] font-medium">
                        {getCourseName(review.course_id)}
                      </Badge>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 mt-2">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/20'}`} />
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">{review.rating}/5</span>
                      </div>

                      {/* Review Text */}
                      {review.review_text && (
                        <p className="text-sm text-foreground/80 mt-3 leading-relaxed bg-muted/30 rounded-lg p-3 border border-border/30">
                          "{review.review_text}"
                        </p>
                      )}

                      <p className="text-[11px] text-muted-foreground/60 mt-2">
                        Submitted {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    {review.is_approved ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-500/10 gap-1.5"
                        onClick={() => handleReject(review.id)}
                        disabled={actionLoading === review.id}
                      >
                        {actionLoading === review.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <EyeOff className="w-3.5 h-3.5" />}
                        Hide
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                        onClick={() => handleApprove(review.id)}
                        disabled={actionLoading === review.id}
                      >
                        {actionLoading === review.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Approve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-500/10 gap-1.5"
                      onClick={() => handleDelete(review.id)}
                      disabled={actionLoading === review.id}
                    >
                      {actionLoading === review.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseReviewManager;
