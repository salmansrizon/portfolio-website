import { useState } from "react";
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
import { createRepository } from "@/integrations/supabase/repository";
import { courseReviewConfig, courseConfig } from "@/adapters/entityConfigs";
import ListPager from './ListPager';
import { useEntityManager } from "@/hooks/useEntityManager";

const reviewRepository = createRepository(courseReviewConfig);
const courseRepository = createRepository(courseConfig);

const CourseReviewManager = () => {
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCourse, setFilterCourse] = useState<string>("all");

  const { data: courses = [] } = courseRepository.useFindAll();
  // Stats need the full (unfiltered) count regardless of search/status/course
  // filters — shares the same query cache as useEntityManager's own
  // useFindAll(), so this isn't a second network request.
  const { data: reviews = [], isLoading: loading } = reviewRepository.useFindAll();
  const { mutate: updateReview } = reviewRepository.useUpdate();

  // Only the free-text axis (name/email/review text) goes through the hook —
  // status and course are separate, locally-owned filters composed on top,
  // same as before this migration.
  const {
    items: searchedReviews, pageItems, pagination,
    search: searchQuery,
    setSearch: setSearchQuery,
    remove,
  } = useEntityManager(courseReviewConfig, {
    searchPredicate: (review, query) => {
      const q = query.toLowerCase();
      return (
        review.student_name.toLowerCase().includes(q) ||
        review.student_email.toLowerCase().includes(q) ||
        (review.review_text || "").toLowerCase().includes(q)
      );
    },
  });

  const handleApprove = (reviewId: string) => {
    setActionLoading(reviewId);
    updateReview(
      { id: reviewId, item: { is_approved: true } },
      {
        onSuccess: () => { toast({ title: "✅ Review Approved", description: "This review is now publicly visible." }); setActionLoading(null); },
        onError: (err: any) => { toast({ title: "Error", description: err.message, variant: "destructive" }); setActionLoading(null); },
      }
    );
  };

  const handleReject = (reviewId: string) => {
    setActionLoading(reviewId);
    updateReview(
      { id: reviewId, item: { is_approved: false } },
      {
        onSuccess: () => { toast({ title: "Review Hidden", description: "This review is now hidden from public." }); setActionLoading(null); },
        onError: (err: any) => { toast({ title: "Error", description: err.message, variant: "destructive" }); setActionLoading(null); },
      }
    );
  };

  const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.title || "Unknown Course";

  // Status/course filters apply on top of the hook's already search-filtered list.
  const filteredReviews = searchedReviews.filter(review => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "approved" && review.is_approved) ||
      (filterStatus === "pending" && !review.is_approved);
    const matchesCourse = filterCourse === "all" || review.course_id === filterCourse;
    return matchesStatus && matchesCourse;
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
    <div className="space-y-4">
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
                <p className="text-3xl font-extrabold text-success mt-1">{approvedCount}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Pending</p>
                <p className="text-3xl font-extrabold text-warning mt-1">{pendingCount}</p>
              </div>
              <EyeOff className="w-8 h-8 text-warning/30" />
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
                        <Badge variant={review.is_approved ? "default" : "secondary"} className={`text-[10px] px-1.5 py-0 ${review.is_approved ? 'bg-success-strong text-success-strong-foreground hover:bg-success-strong/90' : 'bg-warning-soft text-warning-foreground hover:bg-warning-soft/80'}`}>
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
                          <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-warning fill-warning' : 'text-muted-foreground/20'}`} />
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
                        className="text-warning border-warning/30 hover:bg-warning-soft gap-1.5"
                        onClick={() => handleReject(review.id)}
                        disabled={actionLoading === review.id}
                      >
                        {actionLoading === review.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <EyeOff className="w-3.5 h-3.5" />}
                        Hide
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/90 text-success-foreground gap-1.5"
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
                      className="text-destructive border-destructive/30 hover:bg-danger-soft gap-1.5"
                      onClick={() => remove(review)}
                      disabled={actionLoading === review.id}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <ListPager pagination={pagination} label="reviews" />
    </div>
  );
};

export default CourseReviewManager;
