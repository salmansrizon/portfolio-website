import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import BlogEditor from './BlogEditor';
import { createRepository } from '@/integrations/supabase/repository';
import { blogPostConfig } from '@/adapters/entityConfigs';

// Create repository instance for blogs
const blogRepository = createRepository(blogPostConfig);

const BlogManager = () => {
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use repository hook for data fetching
  const { data: blogs = [], isLoading: loading } = blogRepository.useFindAll();
  const { mutate: deleteBlog, isPending: isDeleting } = blogRepository.useDelete();
  const { mutate: updateBlog } = blogRepository.useUpdate();

  useEffect(() => {
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
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
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
  }, [queryClient]);

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;

    deleteBlog(id, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Blog post deleted successfully",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete blog post",
          variant: "destructive",
        });
      },
    });
  };

  const handleTogglePublished = async (blog: BlogPost) => {
    if (!blog.id) return;

    updateBlog({ id: blog.id, item: { published: !blog.published } as any }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: `Blog post ${!blog.published ? 'published' : 'unpublished'} successfully`,
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update blog post",
          variant: "destructive",
        });
      },
    });
  };

  const handleSave = async (blogData: BlogPost) => {
    toast({
      title: "Success",
      description: "Blog post saved successfully",
    });
    
    setIsDialogOpen(false);
    setEditingBlog(null);
    queryClient.invalidateQueries({ queryKey: ['blogs'] });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Blog Posts</CardTitle>
        <Button onClick={() => {
          setEditingBlog(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Blog Post
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.map((blog) => (
              <TableRow key={blog.id}>
                <TableCell className="font-medium">{blog.title}</TableCell>
                <TableCell>
                  {blog.source_type === 'local' ? (
                    'Local'
                  ) : (
                    <div className="flex items-center">
                      {blog.source_type.charAt(0).toUpperCase() + blog.source_type.slice(1)}
                      {blog.source_url && (
                        <a
                          href={blog.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={blog.published}
                    onCheckedChange={() => handleTogglePublished(blog)}
                  />
                </TableCell>
                <TableCell>
                  {new Date(blog.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingBlog(blog);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteBlog(blog.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {blogs.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            No blog posts yet. Create your first one!
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* Updated modal dimensions for improved width/content ratio */}
        <DialogContent className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[80vh] overflow-y-auto">
          <BlogEditor
            initialData={editingBlog || undefined}
            onSave={(blogData) => {
              handleSave(blogData);
              setIsDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default BlogManager;