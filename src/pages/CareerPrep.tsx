import * as React from 'react';
const { useState, useEffect, useMemo } = React;
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Navbar from '@/components/Navbar';
import { Search, Trophy, Loader2, CheckCircle2, Circle, ChevronRight, Lock, Sparkles } from 'lucide-react';
import { useQuestions, useCompletedMissions } from '@/hooks/useCareerPrep';
import { supabase } from '@/integrations/supabase/client';

const CATEGORIES = ['All', 'SQL', 'Management', 'System Design'];
const QUESTION_TYPES = ['All', 'MCQ', 'Coding Test', 'Case Study'] as const;
type QuestionTypeFilter = typeof QUESTION_TYPES[number];

// Shuffle array deterministically per page load
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const CareerPrep = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { questions, loading } = useQuestions();
  const { completedIds } = useCompletedMissions();

  const [activeTab, setActiveTab] = useState('All');
  const [activeType, setActiveType] = useState<QuestionTypeFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Guest Modal State
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [targetSlug, setTargetSlug] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestWhatsapp, setGuestWhatsapp] = useState('');

  const [courses, setCourses] = useState<any[]>([]);
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0);

  // Fetch courses for carousel
  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .limit(5);
      if (data) setCourses(data);
    };
    fetchCourses();
  }, []);

  // Carousel timer
  useEffect(() => {
    if (courses.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentCourseIndex((prev) => (prev + 1) % courses.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [courses.length]);

  // Shuffle questions once per page load
  const shuffledQuestions = useMemo(() => shuffleArray(questions), [questions]);

  // Derived filtered questions
  const filteredQuestions = useMemo(() => {
    return shuffledQuestions.filter((q) => {
      // 1. Only show top-level questions (no parent)
      if (q.parent_id) return false;

      // 2. Logic for filtering based on industry-to-category mapping
      const isSqlRelated = q.industry === 'SQL' || q.industry === 'Fintech (MFS)' || q.industry === 'Logistics' || q.industry === 'E-commerce';
      
      const matchesCategory = activeTab === 'All' || 
        (activeTab === 'SQL' && isSqlRelated) ||
        (activeTab === 'Management' && q.industry === 'Management') ||
        (activeTab === 'System Design' && q.industry === 'System Design') ||
        q.industry === activeTab;

      // 3. Filter by question type
      const typeMap: Record<QuestionTypeFilter, string | null> = {
        'All': null,
        'MCQ': 'mcq',
        'Coding Test': 'code',
        'Case Study': 'case_study',
      };
      const targetType = typeMap[activeType];
      const matchesType = !targetType || q.question_type === targetType;
      
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        q.title.toLowerCase().includes(searchLower) || 
        q.content_md.toLowerCase().includes(searchLower);
      return matchesCategory && matchesType && matchesSearch;
    });
  }, [shuffledQuestions, activeTab, activeType, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const topLevel = questions.filter(q => !q.parent_id);
    const total = topLevel.length;
    let solved = 0;
    let easy = 0, medium = 0, hard = 0;
    
    topLevel.forEach(q => {
      if (completedIds.has(q.id)) solved++;
      
      if (q.difficulty === 'Easy') easy++;
      else if (q.difficulty === 'Medium') medium++;
      else if (q.difficulty === 'Hard') hard++;
    });
    return { total, solved, easy, medium, hard };
  }, [questions, completedIds]);

  const handleRowClick = (slug: string) => {
    if (session?.user) {
      navigate(`/career-prep/solve/${slug}`);
      return;
    }

    const isGuest = localStorage.getItem('careerprep_guest') === 'true';
    if (isGuest) {
      navigate(`/career-prep/solve/${slug}`);
      return;
    }

    setTargetSlug(slug);
    setShowGuestModal(true);
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail || !guestWhatsapp) return;
    
    localStorage.setItem('careerprep_guest', 'true');
    localStorage.setItem('careerprep_guest_email', guestEmail);
    localStorage.setItem('careerprep_guest_whatsapp', guestWhatsapp);

    // Upsert guest into careerprep_guests table
    try {
      const { error } = await supabase
        .from('careerprep_guests')
        .upsert(
          { email: guestEmail, whatsapp: guestWhatsapp, last_active_at: new Date().toISOString() },
          { onConflict: 'email' }
        );
      if (error) console.error('Error saving guest:', error);
    } catch (err) {
      console.error('Guest upsert error:', err);
    }
    
    setShowGuestModal(false);
    if (targetSlug) {
      navigate(`/career-prep/solve/${targetSlug}`);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500 bg-green-500/10 hover:bg-green-500/20';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20';
      case 'Hard': return 'text-red-500 bg-red-500/10 hover:bg-red-500/20';
      default: return 'bg-secondary';
    }
  };

  const currentCourse = courses[currentCourseIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/30 flex flex-col">
      <Navbar />
      
      {/* Hero Section Aligned with Home/Courses */}
      <div className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-xl animate-float"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/30 pointer-events-none"></div>

        <main className="container max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col gap-4 mb-6">
            <Badge className="bg-primary/10 text-primary border-primary/20 w-fit px-4 py-1.5 font-semibold">
              Mission Command
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-blue-500 to-blue-400 bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient-move">
                Career Missions
              </span>
              <br />
              <span className="text-foreground">Master your skills with Sequential Challenges</span>
            </h1>
            
            {/* Hero text section - tabs removed from here */}
          </div>
        </main>
      </div>

      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content - Left Side */}
          <div className="lg:col-span-3 space-y-6">
            
           {/* Relocated Categories Tabs */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 border-b border-border/50 mb-6">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`pb-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${
                    activeTab === category 
                      ? 'text-primary' 
                      : 'text-muted-foreground/60 hover:text-foreground'
                  }`}
                >
                  {category}
                  {activeTab === category && (
                    <motion.span 
                      layoutId="tab-underline"
                      className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-primary rounded-t-full z-10 shadow-[0_0_10px_rgba(var(--primary),0.3)]" 
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Stats & Search row */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <div className="flex items-center gap-4 text-sm whitespace-nowrap overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                <span className="font-bold text-muted-foreground mr-2 uppercase tracking-tighter">
                  {stats.solved}/{stats.total} TRANSMISSIONS SOLVED
                </span>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-0 font-bold uppercase text-[10px]">
                  Easy {stats.easy}
                </Badge>
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-0 font-bold uppercase text-[10px]">
                  Medium {stats.medium}
                </Badge>
                <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-0 font-bold uppercase text-[10px]">
                  Hard {stats.hard}
                </Badge>
              </div>

              <div className="relative w-full sm:w-72 flex-shrink-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter missions..."
                  className="pl-9 bg-background/50 backdrop-blur-sm border-border/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Questions Table */}
            <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[50px] text-center font-bold uppercase text-[10px]">Status</TableHead>
                    <TableHead className="font-bold uppercase text-[10px]">Mission Title</TableHead>
                    <TableHead className="font-bold uppercase text-[10px]">Focus Area</TableHead>
                    <TableHead className="text-right font-bold uppercase text-[10px]">Success</TableHead>
                    <TableHead className="w-[100px] font-bold uppercase text-[10px]">Complexity</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                        <span className="text-muted-foreground text-xs uppercase font-bold">Warming up engines...</span>
                      </TableCell>
                    </TableRow>
                  ) : filteredQuestions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-xs font-bold uppercase">
                        No missions matching your signature scan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQuestions.map((q) => (
                      <TableRow 
                        key={q.id} 
                        className="cursor-pointer hover:bg-accent/30 group transition-colors"
                        onClick={() => handleRowClick(q.slug)}
                      >
                        <TableCell className="text-center">
                          {completedIds.has(q.id) ? (
                            <CheckCircle2 className="w-5 h-5 mx-auto text-green-500 animate-in fade-in zoom-in duration-500" />
                          ) : (
                            <Circle className="w-5 h-5 mx-auto text-muted-foreground/20 group-hover:text-primary/40 transition-colors" />
                          )}
                        </TableCell>
                        <TableCell className="font-bold text-sm">
                          {q.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-[11px] font-black uppercase tracking-widest text-primary/80">
                          {q.industry === 'SQL' || q.industry === 'Fintech (MFS)' || q.industry === 'Logistics' || q.industry === 'E-commerce' ? 'SQL' : q.industry}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {q.success_rate}%
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${getDifficultyColor(q.difficulty)}`}>
                            {q.difficulty}
                          </span>
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
             {/* Auto Carousel for Courses */}
             <div className="group relative rounded-2xl overflow-hidden border border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-500 min-h-[220px] flex flex-col">
               <AnimatePresence mode="wait">
                 {currentCourse ? (
                   <motion.div 
                     key={currentCourse.id} 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     transition={{ duration: 0.4, ease: "easeInOut" }}
                     className="flex-1 flex flex-col"
                   >
                     <div className="relative bg-gradient-to-br from-primary via-blue-600 to-blue-500 p-6 text-white text-center pb-8 shrink-0">
                       <h3 className="text-xs font-bold mb-1 uppercase tracking-[0.2em] opacity-80 flex items-center justify-center gap-1.5">
                         <Sparkles className="w-3 h-3" /> Featured Course
                       </h3>
                       <h2 className="text-xl font-bold mb-4 line-clamp-1">{currentCourse.title}</h2>
                       <div 
                         className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-md shadow-lg group-hover:scale-110 transition-transform cursor-pointer"
                         onClick={() => navigate(`/course/${currentCourse.id}`)}
                       >
                         <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                       </div>
                       
                       {/* Carousel Dots */}
                       <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                          {courses.map((_, idx) => (
                            <div 
                              key={idx} 
                              className={`h-1 rounded-full transition-all duration-300 ${idx === currentCourseIndex ? 'w-4 bg-white' : 'w-1 bg-white/30'}`} 
                            />
                          ))}
                       </div>
                     </div>
                     <div className="p-4 flex flex-col gap-4">
                       <div className="flex justify-between items-center px-2">
                         <div className="text-center">
                           <div className="text-base font-bold">{Math.floor(Math.random() * 5) + 5}</div>
                           <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Chapters</div>
                         </div>
                         <div className="w-px h-6 bg-border" />
                         <div className="text-center">
                           <div className="text-base font-bold">{currentCourse.duration_hours || '12'}h</div>
                           <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Duration</div>
                         </div>
                         <div className="w-px h-6 bg-border" />
                         <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-[10px] font-bold">
                           {currentCourse.difficulty_level || 'Expert'}
                         </Badge>
                       </div>
                       
                       <Button 
                         onClick={() => navigate(`/course/${currentCourse.id}`)}
                         className="w-full bg-primary hover:bg-primary-hover text-white font-bold h-10 shadow-lg shadow-primary/20 rounded-xl"
                       >
                         Enroll Now
                       </Button>
                     </div>
                   </motion.div>
                 ) : (
                   <motion.div 
                     key="loader"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground"
                   >
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <span className="text-xs font-bold uppercase tracking-widest">Warming up catalog...</span>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>

            {/* Progress Card */}
            <Card className="shadow-sm border-border/50 overflow-hidden group">
              <CardHeader className="pb-2 border-b bg-muted/20">
                <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center">
                  {/* Circular progress bar */}
                  <div className="relative w-28 h-28 mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-muted/10"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 48}
                        strokeDashoffset={2 * Math.PI * 48 * (1 - (stats.solved / (stats.total || 1)))}
                        className="text-primary transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-foreground">{stats.solved}/{stats.total}</span>
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">SOLVED</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 w-full gap-3">
                    <div className="flex items-center gap-2 text-xs justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-500/20" />
                        <span className="text-muted-foreground font-bold uppercase tracking-tighter">Easy Challenges</span>
                      </div>
                      <span className="font-black text-foreground">{stats.easy}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/20" />
                        <span className="text-muted-foreground font-bold uppercase tracking-tighter">Medium Level</span>
                      </div>
                      <span className="font-black text-foreground">{stats.medium}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/20" />
                        <span className="text-muted-foreground font-bold uppercase tracking-tighter">Hard Core SQL</span>
                      </div>
                      <span className="font-black text-foreground">{stats.hard}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Your XP</p>
                    <p className="text-2xl font-bold text-primary flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      {session ? '250' : '0'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Streak</p>
                    <p className="text-2xl font-bold text-orange-500">🔥 {session ? '3' : '0'}</p>
                  </div>
                </div>
                {!session && (
                  <p className="text-[10px] text-muted-foreground mt-4 text-center font-medium">
                    Sign in to save your progress and earn XP.
                  </p>
                )}
              </CardContent>
            </Card>

            <div>
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full"></div>
                Top Hits
              </h3>
              <ul className="space-y-3">
                {[
                  'Top 100 Liked Questions',
                  'Top e-Commerce Questions',
                  'Top Fintech Questions',
                  'Top Interview Questions'
                ].map((hit, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors group">
                    <span className="flex flex-col gap-0.5 opacity-30 group-hover:opacity-100 transition-opacity">
                      <span className="w-3 h-[1.5px] bg-primary" />
                      <span className="w-3 h-[1.5px] bg-primary" />
                      <span className="w-3 h-[1.5px] bg-primary" />
                    </span>
                    <span className="font-medium">{hit}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </main>

      <Dialog open={showGuestModal} onOpenChange={setShowGuestModal}>
        <DialogContent className="sm:max-w-md border-primary/20 bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center font-bold relative">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              Unlock Challenge
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              You're about to dive into a real-world business case.
              Continue as a guest or sign in to track your progress!
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleGuestSubmit} className="space-y-4 py-4">
            <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-primary/10">
              <h4 className="font-semibold text-sm text-foreground/80 uppercase tracking-wider text-center">Quick Access (Guest)</h4>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="bg-background"
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="tel"
                  placeholder="WhatsApp Number (e.g. +880...)"
                  value={guestWhatsapp}
                  onChange={(e) => setGuestWhatsapp(e.target.value)}
                  className="bg-background"
                  required
                />
              </div>
                <Button 
                  type="submit" 
                  className="w-full font-bold h-11 shadow-md hover:shadow-lg transition-all animate-pulse hover:animate-none"
                  style={{ animationDuration: '5s' }}
                >
                  Continue to Challenge
                </Button>
            </div>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-medium">Or</span>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full h-11" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button variant="secondary" className="w-full h-11 border bg-secondary/50" onClick={() => navigate('/auth')}>
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CareerPrep;
