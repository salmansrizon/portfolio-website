import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const BlogManager = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchBlogs();
    
    let blogsSubscription: RealtimeChannel;

    const setupRealtimeSubscription = async () => {
      blogsSubscription = supabase
        .channel('blogs-admin-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'blogs'
          },
          () => {
            fetchBlogs();
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    return () => {
      if (blogsSubscription) {
        supabase.removeChannel(blogsSubscription);
      }
    };
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch blogs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const onSubmit = async (formData: any) => {
    setSaving(true);
    try {
      const slug = generateSlug(formData.title);
      const blogData = {
        ...formData,
        slug,
        published: formData.published || false,
        updated_at: new Date().toISOString()
      };

      if (editingBlog) {
        const { error } = await supabase
          .from('blogs')
          .update(blogData)
          .eq('id', editingBlog.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Blog updated successfully!",
        });
      } else {
        const { error } = await supabase
          .from('blogs')
          .insert([blogData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Blog created successfully!",
        });
      }

      // Fetch updated blog posts
      await fetchBlogs();
      setIsDialogOpen(false);
      setEditingBlog(null);
      reset();
      fetchBlogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save blog",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setValue('title', blog.title);
    setValue('excerpt', blog.excerpt);
    setValue('content', blog.content);
    setValue('featured_image', blog.featured_image);
    setValue('published', blog.published);
    setIsDialogOpen(true);
  };

  const handleDelete = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blogId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Blog deleted successfully!",
      });
      await fetchBlogs();  // Ensure we await the fetch
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive",
      });
    }
  };

  const handleNewBlog = () => {
    setEditingBlog(null);
    reset();
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Blog Posts</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewBlog}>
              <Plus className="h-4 w-4 mr-2" />
              New Blog Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register('title', { required: true })}
                  placeholder="Enter blog title"
                />
              </div>
              
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  {...register('excerpt')}
                  placeholder="Brief description of the blog post"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="featured_image">Featured Image URL</Label>
                <Input
                  id="featured_image"
                  {...register('featured_image')}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  {...register('content', { required: true })}
                  placeholder="Write your blog content here..."
                  rows={10}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  {...register('published')}
                />
                <Label htmlFor="published">Published</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingBlog ? 'Update' : 'Create'} Blog
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{blog.title}</p>
                      <p className="text-sm text-muted-foreground">{blog.excerpt}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      blog.published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(blog.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(blog)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(blog.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogManager;