import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Eye, Map, Upload, Loader2, X, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Roadmap {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  markdown_content: string;
  icon: string | null;
  banner_image: string | null;
  status: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

const RoadmapManager = () => {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    markdown_content: '',
    icon: '',
    banner_image: '',
    status: 'draft',
    order_index: 0,
  });

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .order('order_index');
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setRoadmaps((data || []) as Roadmap[]);
    }
    setLoading(false);
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openCreate = () => {
    setEditingRoadmap(null);
    setForm({ title: '', slug: '', description: '', markdown_content: '', icon: '', banner_image: '', status: 'draft', order_index: 0 });
    setIsDialogOpen(true);
  };

  const openEdit = (r: Roadmap) => {
    setEditingRoadmap(r);
    setForm({
      title: r.title,
      slug: r.slug,
      description: r.description || '',
      markdown_content: r.markdown_content,
      icon: r.icon || '',
      banner_image: r.banner_image || '',
      status: r.status,
      order_index: r.order_index,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      title: form.title,
      slug: form.slug || generateSlug(form.title),
      description: form.description || null,
      markdown_content: form.markdown_content,
      icon: form.icon || null,
      banner_image: form.banner_image || null,
      status: form.status,
      order_index: form.order_index,
    };

    let error;
    if (editingRoadmap) {
      ({ error } = await supabase.from('roadmaps').update(payload).eq('id', editingRoadmap.id));
    } else {
      ({ error } = await supabase.from('roadmaps').insert(payload));
    }

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: editingRoadmap ? 'Updated' : 'Created', description: 'Roadmap saved successfully.' });
      setIsDialogOpen(false);
      fetchRoadmaps();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this roadmap?')) return;
    const { error } = await supabase.from('roadmaps').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted' });
      fetchRoadmaps();
    }
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Career Roadmaps</h2>
          <p className="text-muted-foreground">Manage career roadmaps with markdown content</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Roadmap</Button>
      </div>

      <div className="grid gap-2">
        {roadmaps.map((r) => {
          const isExpanded = expandedId === r.id;
          return (
            <Card key={r.id}>
              <CardContent className="p-0">
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-3 p-4 text-left"
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Map className="h-5 w-5 text-primary shrink-0" />
                    <h3 className="font-semibold truncate">{r.title}</h3>
                    <Badge variant={r.status === 'published' ? 'default' : 'secondary'}>{r.status}</Badge>
                  </div>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isExpanded && (
                  <div className="border-t px-4 py-4 space-y-3">
                    <div className="grid gap-2 text-sm">
                      <p><span className="font-medium text-muted-foreground">Description: </span>{r.description || 'No description'}</p>
                      <p><span className="font-medium text-muted-foreground">Slug: </span><code className="text-xs bg-muted px-1.5 py-0.5 rounded">/roadmaps/{r.slug}</code></p>
                      <p><span className="font-medium text-muted-foreground">Status: </span>{r.status}</p>
                    </div>
                    {r.markdown_content && (
                      <pre className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3 max-h-40 overflow-auto whitespace-pre-wrap">
                        {r.markdown_content.slice(0, 600)}{r.markdown_content.length > 600 ? '…' : ''}
                      </pre>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/roadmaps/${r.slug}`} target="_blank"><Eye className="h-4 w-4 mr-1.5" /> View</a>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEdit(r)}><Pencil className="h-4 w-4 mr-1.5" /> Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 mr-1.5" /> Delete</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {roadmaps.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No roadmaps yet. Create one to get started.</p>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoadmap ? 'Edit Roadmap' : 'Create Roadmap'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || generateSlug(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium">Slug</label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description (supports markdown)</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={6}
                placeholder={`Brief intro paragraph.\n\n## Section heading\n\n- Bullet one\n- Bullet two\n\n**Bold text** and [links](https://example.com).`}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Icon</label>
                <IconUploader value={form.icon} onChange={(url) => setForm({ ...form, icon: url })} />
              </div>
              <div>
                <label className="text-sm font-medium">Order</label>
                <Input type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Banner Image URL (optional)</label>
              <Input value={form.banner_image} onChange={(e) => setForm({ ...form, banner_image: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Markdown Content</label>
              <p className="text-xs text-muted-foreground mb-1">
                Use H1 for roadmap title, H2 for main sections, H3 for sub-topics, and lists for details. Each heading becomes a node in the tree view.
              </p>
              <Textarea
                value={form.markdown_content}
                onChange={(e) => setForm({ ...form, markdown_content: e.target.value })}
                rows={20}
                className="font-mono text-sm"
                placeholder={`# AI Engineer Roadmap\n\n## 1. Mathematics & Statistics\n### Linear Algebra\n- Vectors & Matrices\n- Eigenvalues\n\n### Probability\n- Bayes Theorem\n- Distributions\n\n## 2. Programming\n### Python\n- NumPy\n- Pandas\n\n### SQL\n- Joins\n- Window Functions`}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Roadmap</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const IconUploader = ({ value, onChange }: { value: string; onChange: (url: string) => void }) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload an image.', variant: 'destructive' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Too large', description: 'Max 2MB.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop() || 'png';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('roadmap-icons').upload(path, file, { upsert: false });
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } else {
      const { data } = supabase.storage.from('roadmap-icons').getPublicUrl(path);
      onChange(data.publicUrl);
      toast({ title: 'Icon uploaded' });
    }
    setUploading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {value ? (
        <div className="relative group">
          <img src={value} alt="icon" className="h-10 w-10 rounded-md border object-cover bg-white" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="h-10 w-10 rounded-md border border-dashed flex items-center justify-center bg-muted/30">
          <Map className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
        {value ? 'Replace' : 'Upload'}
      </Button>
    </div>
  );
};

export default RoadmapManager;
