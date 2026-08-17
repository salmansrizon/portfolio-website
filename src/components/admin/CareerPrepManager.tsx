import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createRepository } from '@/integrations/supabase/repository';
import { careerPrepQuestionConfig } from '@/adapters/entityConfigs';
import {
  Loader2, Plus, Edit, Trash2, Database, Users, Download,
  GraduationCap, CircleUser, Code2, ListChecks, BookOpen,
  FolderTree, Clock, Tags, X, ChevronRight, ChevronDown, Sparkles
} from 'lucide-react';
import type { CareerPrepQuestion, QuestionType } from '@/hooks/useCareerPrep';

const careerPrepRepository = createRepository(careerPrepQuestionConfig);

// ─── helper maps ──────────────────────────────────────────────────────────────
const Q_TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  root:       { label: 'Root Case Study',    icon: <FolderTree className="w-3.5 h-3.5" />, color: 'bg-series-webinar/10 text-series-webinar' },
  code:       { label: 'Code Challenge',     icon: <Code2 className="w-3.5 h-3.5" />,      color: 'bg-series-web/10 text-series-web'   },
  mcq:        { label: 'Multiple Choice',    icon: <ListChecks className="w-3.5 h-3.5" />, color: 'bg-series-data/10 text-series-data' },
  case_study: { label: 'Case Study Essay',   icon: <BookOpen className="w-3.5 h-3.5" />,   color: 'bg-series-career/10 text-series-career' },
  default:    { label: 'Standard Mission',   icon: <Database className="w-3.5 h-3.5" />,   color: 'bg-muted text-muted-foreground' },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy:   'bg-success/10 text-success',
  Medium: 'bg-warning/10 text-warning',
  Hard:   'bg-danger/10 text-danger',
  default: 'bg-muted text-muted-foreground',
};

// ─── component ────────────────────────────────────────────────────────────────
const CareerPrepManager = () => {
  const [appUsers, setAppUsers]         = React.useState<any[]>([]);
  const [saving, setSaving]             = React.useState(false);
  const [editingQ, setEditingQ]         = React.useState<CareerPrepQuestion | null>(null);
  const [dialogOpen, setDialogOpen]     = React.useState(false);
  const [expandedRoots, setExpandedRoots] = React.useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data: questions = [], isLoading: loading } = careerPrepRepository.useFindAll();
  const { mutate: deleteQuestion } = careerPrepRepository.useDelete();
  const { mutate: createQuestion } = careerPrepRepository.useCreate();
  const { mutate: updateQuestion } = careerPrepRepository.useUpdate();

  const { register, handleSubmit, reset, watch, control, setValue } = useForm<any>({
    defaultValues: {
      question_type: 'code',
      options: [
        { label: 'A', text: '' },
        { label: 'B', text: '' },
        { label: 'C', text: '' },
        { label: 'D', text: '' },
      ],
    },
  });

  const { fields: optionFields } = useFieldArray({ control, name: 'options' });
  const questionType: any = watch('question_type');
  const isRoot = questionType === 'root';
  const isMCQ  = questionType === 'mcq';
  const isCode = questionType === 'code';

  // ── fetch users (for seed data) ──────────────────────────────────────────
  React.useEffect(() => {
    (supabase as any).from('students').select('id,full_name,email,created_at').then(({ data }: any) => setAppUsers(data || []));
  }, []);

  const fetchUsers = async () => {
    const [{ data: students }, { data: guests }] = await Promise.all([
      (supabase as any).from('students').select('id,full_name,email,created_at'),
      (supabase as any).from('careerprep_guests').select('*').order('created_at', { ascending: false }),
    ]);

    const registered = (students || []).map((s: any) => ({
      id: s.id, name: s.full_name || 'Student', email: s.email,
      phone: 'N/A', type: 'Student', joined: s.created_at,
    }));

    const guestUsers = (guests || []).map((g: any) => ({
      id: g.id, name: 'Guest', email: g.email,
      phone: g.whatsapp || 'N/A', type: 'Guest', joined: g.created_at,
      lastActive: g.last_active_at,
    }));

    setAppUsers([...registered, ...guestUsers]);
  };

  // ── CSV export ────────────────────────────────────────────────────────────
  const downloadCSV = () => {
    const headers  = ['Name','Email','Phone/WhatsApp','Type','Joined'];
    const rows     = appUsers.map(u => [
      `"${u.name}"`, `"${u.email}"`, `"${u.phone}"`, u.type,
      new Date(u.joined).toLocaleDateString(),
    ].join(','));
    const csv  = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const link = Object.assign(document.createElement('a'), {
      href: encodeURI(csv),
      download: `career_prep_users_${new Date().toISOString().split('T')[0]}.csv`,
    });
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    toast({ title: 'Downloaded', description: 'User list saved as CSV.' });
  };

  // ── Seeding Samples ───────────────────────────────────────────────────────
  const seedSamples = async () => {
    setSaving(true);
    try {
      const rootId = crypto.randomUUID();
      const samples = [
        // ═══════════════════════════════════════════════════════════════════
        // 1. STANDALONE CODE QUESTION (no parent, directly solvable)
        // ═══════════════════════════════════════════════════════════════════
        {
          title: "Top Revenue Products",
          slug: `top-revenue-products-${Date.now()}`,
          difficulty: "Easy",
          industry: "SQL",
          category: "Aggregation",
          question_type: "code",
          content_md: "### Problem\n\nGiven a `products` table and an `orders` table, find the **top 3 products** by total revenue.\n\nReturn `product_name` and `total_revenue`, ordered by revenue descending.",
          schema_sql: `CREATE TABLE IF NOT EXISTS products_demo (id SERIAL PRIMARY KEY, product_name VARCHAR(100), price DECIMAL(10,2));
CREATE TABLE IF NOT EXISTS orders_demo (id SERIAL PRIMARY KEY, product_id INT, quantity INT);
INSERT INTO products_demo (id, product_name, price) VALUES (1, 'Laptop', 999.99), (2, 'Mouse', 29.99), (3, 'Keyboard', 79.99), (4, 'Monitor', 449.99);
INSERT INTO orders_demo (product_id, quantity) VALUES (1, 5), (2, 50), (3, 30), (4, 10), (1, 3), (2, 20);`,
          solution_sql: "SELECT p.product_name, SUM(p.price * o.quantity) AS total_revenue FROM products_demo p JOIN orders_demo o ON p.id = o.product_id GROUP BY p.product_name ORDER BY total_revenue DESC LIMIT 3;",
          success_rate: 72
        },

        // ═══════════════════════════════════════════════════════════════════
        // 2. STANDALONE MCQ QUESTION (no parent, choice-based)
        // ═══════════════════════════════════════════════════════════════════
        {
          title: "SQL JOIN Concepts",
          slug: `sql-join-concepts-${Date.now()}`,
          difficulty: "Easy",
          industry: "SQL",
          category: "Fundamentals",
          question_type: "mcq",
          content_md: "### SQL Knowledge Check\n\nWhich type of JOIN returns **all rows from both tables**, with NULLs where there is no match?",
          options: [
            { label: 'A', text: 'INNER JOIN' },
            { label: 'B', text: 'LEFT JOIN' },
            { label: 'C', text: 'FULL OUTER JOIN' },
            { label: 'D', text: 'CROSS JOIN' }
          ],
          correct_option: 'C',
          success_rate: 65
        },

        // ═══════════════════════════════════════════════════════════════════
        // 3. ROOT MISSION (multi-step with timer)
        // ═══════════════════════════════════════════════════════════════════
        {
          id: rootId,
          title: "E-commerce Analytics Assessment",
          slug: `ecom-assessment-${Date.now()}`,
          difficulty: "Hard",
          industry: "SQL",
          category: "Assessment",
          question_type: "root",
          time_limit_secs: 600,
          content_md: "### Mission Briefing\n\nYou are a Senior Data Analyst at **ShopBD**, a major e-commerce platform.\n\nComplete the following 2-step assessment within **10 minutes**.\n\nStep 1: Answer a strategic question\nStep 2: Write an analytical query"
        },

        // ── Child 1: MCQ ─────────────────────────────────────────────────
        {
          title: "Customer Segmentation Strategy",
          slug: `ecom-step1-mcq-${Date.now()}`,
          difficulty: "Medium",
          industry: "SQL",
          question_type: "mcq",
          parent_id: rootId,
          order_index: 0,
          content_md: "### Strategic Decision\n\nWhen segmenting customers by their **Recency, Frequency, Monetary (RFM)** value, which SQL approach is most scalable for millions of rows?",
          options: [
            { label: 'A', text: 'Use multiple self-joins on the orders table' },
            { label: 'B', text: 'Use window functions with NTILE() for percentile buckets' },
            { label: 'C', text: 'Create a materialized view with subqueries' },
            { label: 'D', text: 'Use CASE statements with hardcoded thresholds' }
          ],
          correct_option: 'B'
        },

        // ── Child 2: Code ────────────────────────────────────────────────
        {
          title: "Monthly Active Buyers Report",
          slug: `ecom-step2-code-${Date.now()}`,
          difficulty: "Hard",
          industry: "SQL",
          question_type: "code",
          parent_id: rootId,
          order_index: 1,
          content_md: "### Query Challenge\n\nWrite a query to find the **top 5 customers** who spent the most in the last 30 days.\n\nReturn `customer_name`, `total_spent`, and `order_count`.\n\nOrder by `total_spent` DESC.",
          schema_sql: `CREATE TABLE IF NOT EXISTS ecom_customers (id SERIAL PRIMARY KEY, customer_name VARCHAR(100), email VARCHAR(100));
CREATE TABLE IF NOT EXISTS ecom_orders (id SERIAL PRIMARY KEY, customer_id INT, amount DECIMAL(10,2), order_date DATE);
INSERT INTO ecom_customers (id, customer_name, email) VALUES (1, 'Rahim Khan', 'rahim@email.com'), (2, 'Fatima Ali', 'fatima@email.com'), (3, 'Karim Shah', 'karim@email.com'), (4, 'Nadia Begum', 'nadia@email.com'), (5, 'Saiful Islam', 'saiful@email.com');
INSERT INTO ecom_orders (customer_id, amount, order_date) VALUES (1, 5000, CURRENT_DATE - 5), (1, 3000, CURRENT_DATE - 10), (2, 12000, CURRENT_DATE - 3), (3, 2000, CURRENT_DATE - 7), (3, 8000, CURRENT_DATE - 1), (4, 15000, CURRENT_DATE - 2), (5, 1000, CURRENT_DATE - 20), (2, 4000, CURRENT_DATE - 15);`,
          solution_sql: "SELECT c.customer_name, SUM(o.amount) AS total_spent, COUNT(o.id) AS order_count FROM ecom_customers c JOIN ecom_orders o ON c.id = o.customer_id WHERE o.order_date >= CURRENT_DATE - 30 GROUP BY c.customer_name ORDER BY total_spent DESC LIMIT 5;"
        }
      ];

      const { error } = await (supabase as any).from('careerprep_questions').insert(samples);
      if (error) throw error;
      toast({ title: '✅ Seeded Successfully', description: `${samples.length} sample questions added (1 standalone code, 1 standalone MCQ, 1 root mission with 2 steps).` });
      await fetchQuestions();
    } catch (err: any) {
      toast({ title: 'Seed Failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ── form helpers ──────────────────────────────────────────────────────────
  const openNew = () => {
    setEditingQ(null);
    reset({
      question_type: 'code', difficulty: 'Easy', success_rate: 50,
      options: [{ label:'A',text:'' },{ label:'B',text:'' },{ label:'C',text:'' },{ label:'D',text:'' }],
    });
    setDialogOpen(true);
  };

  const openEdit = (q: CareerPrepQuestion) => {
    setEditingQ(q);
    
    // Determine options: use existing or default if empty
    const opts = q.options?.length 
      ? q.options 
      : [{ label:'A',text:'' },{ label:'B',text:'' },{ label:'C',text:'' },{ label:'D',text:'' }];

    reset({
      ...q,
      hints:   Array.isArray(q.hints) ? q.hints.join('\n') : (typeof q.hints === 'string' ? q.hints : ''),
      tags:    Array.isArray(q.tags) ? q.tags.join(', ') : '',
      options: opts,
      question_type: q.question_type || 'code',
      parent_id: q.parent_id || 'none',
    });

    // Explicitly set values that might have issues with reset and Select components
    setValue('question_type', q.question_type || 'code');
    setValue('parent_id', q.parent_id || 'none');
    setValue('difficulty', q.difficulty || 'Easy');
    
    setDialogOpen(true);
  };

  const onSubmit = async (raw: any) => {
    setSaving(true);
    console.log("Submitting form with raw data:", raw);
    
    try {
      const payload: any = {
        title:            raw.title,
        slug:             raw.slug,
        difficulty:       raw.difficulty || 'Easy',
        industry:         raw.industry,
        category:         raw.category || null,
        tags:             raw.tags ? (typeof raw.tags === 'string' ? raw.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : raw.tags) : [],
        content_md:       raw.content_md || '',
        question_type:    raw.question_type,
        parent_id:        raw.parent_id && raw.parent_id !== 'none' ? raw.parent_id : null,
        time_limit_secs:  raw.time_limit_secs ? Number(raw.time_limit_secs) : null,
        order_index:      raw.order_index ? Number(raw.order_index) : 0,
        success_rate:     Number(raw.success_rate) || 0,
        hints:            raw.hints ? (typeof raw.hints === 'string' ? raw.hints.split('\n').filter((h: string) => h.trim()) : raw.hints) : [],
        schema_sql:       raw.schema_sql  || '',
        initial_sql:      raw.initial_sql || '',
        solution_sql:     raw.solution_sql|| '',
        options:          raw.question_type === 'mcq' ? raw.options : [],
        correct_option:   raw.question_type === 'mcq' ? raw.correct_option : null,
      };

      console.log("Prepared payload:", payload);

      if (editingQ) {
        updateQuestion(
          { id: editingQ.id, item: payload },
          {
            onSuccess: () => {
              toast({ title: 'Saved ✓', description: 'Question updated.' });
              setDialogOpen(false);
              setEditingQ(null);
              reset();
            },
            onError: (err: any) => {
              toast({ title: 'Error', description: err.message, variant: 'destructive' });
            },
          }
        );
      } else {
        createQuestion(payload, {
          onSuccess: () => {
            toast({ title: 'Saved ✓', description: 'Question created.' });
            setDialogOpen(false);
            reset();
          },
          onError: (err: any) => {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
          },
        });
      }
    } catch (err: any) {
      console.error("Form submission catch error:", err);
      toast({ 
        title: 'Error', 
        description: err.message || 'Could not save question.', 
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question and all its children?')) return;
    await (supabase as any).from('careerprep_questions').delete().eq('id', id);
    toast({ title: 'Deleted' });
    await fetchQuestions();
  };

  // ── tree helpers ──────────────────────────────────────────────────────────
  const roots    = questions.filter(q => !q.parent_id);
  const children = (parentId: string) => questions.filter(q => q.parent_id === parentId);
  const toggleRoot = (id: string) =>
    setExpandedRoots(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  // ── root question options for parent selector ─────────────────────────────
  const rootOptions = questions.filter(q => q.question_type === 'root');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Career Prep Admin</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-0.5">
            Manage learning scenarios · user directory · analytics
          </p>
        </div>
      </div>

      <Tabs defaultValue="questions">
        <TabsList className="grid grid-cols-2 max-w-xs mb-6">
          <TabsTrigger value="questions" className="gap-1.5"><Database className="w-3.5 h-3.5" />Questions</TabsTrigger>
          <TabsTrigger value="users"     className="gap-1.5"><Users    className="w-3.5 h-3.5" />Users</TabsTrigger>
        </TabsList>

        {/* ══ QUESTIONS TAB ══════════════════════════════════════════════════ */}
        <TabsContent value="questions" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{questions.length} total · {roots.length} root scenarios</p>
            <div className="flex items-center gap-3">
              <Button onClick={seedSamples} variant="outline" size="sm" className="hidden sm:flex border-primary/20 text-primary hover:bg-primary/5 gap-1.5 h-9">
                <Sparkles className="h-3.5 w-3.5" /> Seed Samples
              </Button>
              <Button onClick={openNew} className="shadow-lg shadow-primary/20 gap-1.5 h-9 px-4">
                <Plus className="h-4 w-4" /> New Question
              </Button>
            </div>
          </div>

          {/* Tree View */}
          <div className="space-y-3">
            {roots.map(root => {
              const kids = children(root.id);
              const expanded = expandedRoots.has(root.id);
              const meta = Q_TYPE_META[root.question_type] || Q_TYPE_META.default;
              return (
                <Card key={root.id} className="border-primary/10 hover:border-primary/30 transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {kids.length > 0 && (
                          <button onClick={() => toggleRoot(root.id)} className="shrink-0 text-primary hover:text-primary/70 transition-colors">
                            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        )}
                        <div className={`shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${meta.color}`}>
                          {meta.icon} {meta.label}
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-sm font-bold truncate">{root.title}</CardTitle>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {root.category && (
                              <Badge variant="outline" className="text-[9px] uppercase font-bold border-primary/20 text-primary">
                                {root.category}
                              </Badge>
                            )}
                            {(root.tags||[]).map(t => (
                              <Badge key={t} variant="secondary" className="text-[9px]">{t}</Badge>
                            ))}
                            {root.time_limit_secs && (
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                                <Clock className="w-3 h-3" /> {Math.floor(root.time_limit_secs/60)}m
                              </span>
                            )}
                            {kids.length > 0 && (
                              <span className="text-[10px] text-muted-foreground font-bold">{kids.length} sub-questions</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(root)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(root.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Children */}
                  {expanded && kids.length > 0 && (
                    <CardContent className="pt-0 pb-4">
                      <div className="ml-8 space-y-2 border-l-2 border-primary/10 pl-4">
                        {kids.sort((a,b) => (a.order_index||0)-(b.order_index||0)).map(child => {
                          const cm = Q_TYPE_META[child.question_type] || Q_TYPE_META.default;
                          return (
                            <div key={child.id} className="flex items-center justify-between gap-2 bg-muted/30 rounded-lg px-4 py-2 hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${cm.color}`}>
                                  {cm.icon} {cm.label}
                                </div>
                                <span className="text-sm font-medium truncate">{child.title}</span>
                                <Badge variant="secondary" className={`text-[9px] shrink-0 border-0 ${DIFFICULTY_COLORS[child.difficulty] || DIFFICULTY_COLORS.default}`}>
                                  {child.difficulty}
                                </Badge>
                                {child.time_limit_secs && (
                                  <span className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold shrink-0">
                                    <Clock className="w-2.5 h-2.5" /> {Math.floor(child.time_limit_secs/60)}m {child.time_limit_secs%60}s
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(child)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(child.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
            {roots.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                <Database className="w-12 h-12 opacity-20" />
                <p className="text-sm font-medium">No questions yet. Create a Root Case Study to get started.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ══ USERS TAB ══════════════════════════════════════════════════════ */}
        <TabsContent value="users" className="space-y-4">
          <Card className="border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-primary" />User Directory</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest mt-1">
                  {appUsers.length} total participants
                </CardDescription>
              </div>
              <Button onClick={downloadCSV} variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      {['User','Contact','Tier','Joined'].map(h => (
                        <TableHead key={h} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appUsers.length === 0
                      ? <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-sm italic">No users yet.</TableCell></TableRow>
                      : appUsers.map(u => (
                        <TableRow key={u.id} className="hover:bg-primary/5 group transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                {u.type === 'Student' ? <GraduationCap className="h-4 w-4 text-primary" /> : <CircleUser className="h-4 w-4 text-primary" />}
                              </div>
                              <span className="font-semibold text-sm group-hover:text-primary transition-colors">{u.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-xs gap-0.5">
                              <span className="font-medium">{u.email}</span>
                              <span className="text-muted-foreground">{u.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-[9px] font-bold border-0 ${u.type==='Student'?'bg-series-web/10 text-series-web':'bg-muted text-muted-foreground'}`}>
                              {u.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">{new Date(u.joined).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ══ QUESTION FORM DIALOG ════════════════════════════════════════════ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto border-primary/20 bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingQ ? `Edit: ${editingQ.title}` : 'Create New Question'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">

            {/* ── 1. Question Type ─────────────────────────────────────────── */}
            <section>
              <SectionLabel>Question Type</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(Object.entries(Q_TYPE_META) as [QuestionType, typeof Q_TYPE_META[QuestionType]][]).map(([key, meta]) => (
                  <label key={key} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-center
                    ${questionType === key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                    <input type="radio" className="hidden" value={key} {...register('question_type')} />
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.color}`}>{meta.icon}</div>
                    <span className="text-[11px] font-bold">{meta.label}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* ── 2. Parent Question (for non-root) ────────────────────────── */}
            {!isRoot && (
              <section>
                <SectionLabel>Parent Root Question <span className="font-normal text-muted-foreground">(optional)</span></SectionLabel>
                <Controller
                  control={control}
                  name="parent_id"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="— Standalone question —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— Standalone question —</SelectItem>
                        {rootOptions.map(r => (
                          <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </section>
            )}

            {/* ── 3. Core Meta ─────────────────────────────────────────────── */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Title" required>
                <Input {...register('title',{required:true})} placeholder="e.g. Top 5 Merchants by Volume" className="bg-background/50" />
              </Field>
              <Field label="Slug" required>
                <Input {...register('slug',{required:true})} placeholder="e.g. top-merchants-volume" className="bg-background/50" />
              </Field>
            </section>

            {/* ── 3.5 Child Questions (for roots) ────────────────────────── */}
            {isRoot && editingQ && (
              <section className="bg-muted/30 p-6 rounded-2xl border border-primary/20 space-y-4">
                <div className="flex items-center justify-between">
                  <SectionLabel className="mb-0">Sub-Questions / Mission Steps</SectionLabel>
                  <Button type="button" size="sm" variant="outline" className="h-8 gap-1 text-[10px] font-bold border-primary/20 text-primary hover:bg-primary/5" onClick={() => {
                    const parentId = editingQ.id;
                    setEditingQ(null);
                    reset({
                      question_type: 'code',
                      parent_id: parentId,
                      difficulty: 'Medium',
                      order_index: (children(parentId).length || 0),
                      options: [{label:'A',text:''},{label:'B',text:''},{label:'C',text:''},{label:'D',text:''}]
                    });
                  }}>
                    <Plus className="w-3 h-3" /> Add Step
                  </Button>
                </div>
                <div className="space-y-2">
                  {children(editingQ.id).sort((a,b) => (a.order_index||0)-(b.order_index||0)).map(child => {
                     const cm = Q_TYPE_META[child.question_type] || Q_TYPE_META.default;
                     return (
                       <div key={child.id} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border group hover:border-primary/30 transition-all">
                         <div className="flex items-center gap-3">
                            <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${cm.color}`}>{cm.label}</div>
                            <span className="text-sm font-bold">{child.title}</span>
                            <Badge variant="secondary" className="text-[9px] h-4 border-0 opacity-50">{child.difficulty}</Badge>
                         </div>
                         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(child)}>
                               <Edit className="w-3 h-3" />
                            </Button>
                            <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(child.id)}>
                               <Trash2 className="w-3 h-3" />
                            </Button>
                         </div>
                       </div>
                     );
                  })}
                  {children(editingQ.id).length === 0 && <p className="text-center py-4 text-[11px] text-muted-foreground font-medium italic">No sub-questions added yet.</p>}
                </div>
              </section>
            )}

            <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Difficulty" required>
                <Controller control={control} name="difficulty" render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-background/50"><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      {['Easy','Medium','Hard'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </Field>
              <Field label="Language / Skill">
                <Input {...register('industry')} placeholder="e.g. SQL, Python" className="bg-background/50" />
              </Field>
              <Field label="Category">
                <Input {...register('category')} placeholder="e.g. Analytics, Finance, Logistics" className="bg-background/50" />
              </Field>
              <Field label="Tags (comma-separated)">
                <Input {...register('tags')} placeholder="e.g. joins, aggregation, window-functions" className="bg-background/50" />
              </Field>
              {!isRoot && (
                <Field label="Time Limit (seconds)">
                  <Input type="number" min="0" {...register('time_limit_secs')} placeholder="e.g. 300 for 5 min, blank = unlimited" className="bg-background/50" />
                </Field>
              )}
              {isRoot && (
                <Field label="Total Mock Test Duration (seconds)">
                  <Input type="number" min="0" {...register('time_limit_secs')} placeholder="e.g. 3600 for 1hr, blank = unlimited" className="bg-background/50" />
                </Field>
              )}
              {!isRoot && (
                <>
                  <Field label="Order Index (within parent)">
                    <Input type="number" min="0" {...register('order_index')} placeholder="0, 1, 2 …" className="bg-background/50" />
                  </Field>
                  <Field label="Step Weight (Importance)">
                    <Input type="number" min="1" {...register('weight')} placeholder="1, 2, 5 … default 1" className="bg-background/50" />
                  </Field>
                </>
              )}
              <Field label="Global Success Rate (%)">
                <Input type="number" min="0" max="100" {...register('success_rate')} placeholder="e.g. 64" className="bg-background/50" />
              </Field>
            </section>

            {/* ── 4. Problem Description ────────────────────────────────────── */}
            <Field label="Problem Description (Markdown)" required={!isRoot}>
              <Textarea {...register('content_md')} placeholder="### Context&#10;&#10;You are analysing...&#10;&#10;**Task:** Write a query..." rows={6} className="bg-background/50" />
            </Field>

            {/* ── 5. MCQ Options ───────────────────────────────────────────── */}
            {isMCQ && (
              <section>
                <SectionLabel>Multiple Choice Options</SectionLabel>
                <div className="space-y-3">
                  {optionFields.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold shrink-0">
                        {String.fromCharCode(65+idx)}
                      </span>
                      <Input
                        {...register(`options.${idx}.text`)}
                        placeholder={`Option ${String.fromCharCode(65+idx)}`}
                        className="bg-background/50 flex-1"
                      />
                      <input type="hidden" {...register(`options.${idx}.label`)} value={String.fromCharCode(65+idx)} />
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <SectionLabel>Correct Answer</SectionLabel>
                  <Controller control={control} name="correct_option" render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-40 bg-background/50"><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        {['A','B','C','D'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
              </section>
            )}

            {/* ── 6. SQL fields (code & case_study) ────────────────────────── */}
            {(isCode || questionType === 'case_study') && (
              <>
                <Field label="Schema SQL Definition">
                  <Textarea {...register('schema_sql')} placeholder="CREATE TABLE orders..." className="font-mono text-[11px] bg-background/50" rows={4} />
                </Field>
                <div>
                  <Field label="Setup & Seed SQL">
                    <div className="bg-warning/10 text-warning text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg mb-2 border border-warning/20">
                      ⚠ Include BOTH CREATE TABLE and INSERT INTO statements here
                    </div>
                    <Textarea {...register('initial_sql')} placeholder="CREATE TABLE IF NOT EXISTS orders...&#10;INSERT INTO orders ..." className="font-mono text-[11px] bg-background/50" rows={8} />
                  </Field>
                </div>
                <Field label="Validation Solution SQL">
                  <Textarea {...register('solution_sql')} placeholder="SELECT rider_id, COUNT(*) AS deliveries..." className="font-mono text-[11px] bg-background/50" rows={3} />
                </Field>
              </>
            )}

            {/* ── 7. Hints ─────────────────────────────────────────────────── */}
            <Field label="Knowledge Sparks / Hints (one per line)">
              <Textarea {...register('hints')} placeholder="Hint 1: Use GROUP BY + ORDER BY DESC&#10;Hint 2: Filter status = 'Delivered'" rows={3} className="bg-background/50" />
            </Field>

            {/* ── Actions ──────────────────────────────────────────────────── */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="min-w-[130px]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingQ ? 'Save Changes' : 'Create Question'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── tiny helpers ──────────────────────────────────────────────────────────────
const SectionLabel = ({ children, className = "mb-3" }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-[10px] font-bold uppercase tracking-widest text-muted-foreground ${className}`}>{children}</p>
);

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      {label}{required && <span className="text-primary ml-0.5">*</span>}
    </Label>
    {children}
  </div>
);

export default CareerPrepManager;
