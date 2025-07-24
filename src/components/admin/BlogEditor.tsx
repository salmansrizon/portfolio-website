import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { supabase } from '@/integrations/supabase/client';
import { Image, Code, Link, Type, Plus, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { BlogContent, BlogPost } from '@/types/blog';
import CodeEditor from '@/components/ui/code-editor';

interface BlogEditorProps {
  onSave?: (blog: BlogPost) => void;
  initialData?: Partial<BlogPost>;
}

const BlogEditor = ({ onSave, initialData }: BlogEditorProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(initialData?.title || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [featuredImage, setFeaturedImage] = useState(initialData?.featured_image || '');
  const [published, setPublished] = useState(initialData?.published || false);
  const [sourceType, setSourceType] = useState<BlogPost['source_type']>(initialData?.source_type || 'local');
  const [sourceUrl, setSourceUrl] = useState(initialData?.source_url || '');
  const [content, setContent] = useState<BlogContent[]>(initialData?.content || []);

  const handleAddContent = (type: BlogContent['type']) => {
    let newContent: BlogContent;
    
    switch (type) {
      case 'text':
        newContent = { type: 'text', content: '' };
        break;
      case 'image':
        newContent = { type: 'image', url: '', alt: '' };
        break;
      case 'code':
        newContent = { type: 'code', language: 'javascript', code: '', caption: '' };
        break;
      default:
        return;
    }

    setContent([...content, newContent]);
  };

  const handleContentChange = (index: number, updatedContent: BlogContent) => {
    const newContent = [...content];
    newContent[index] = updatedContent;
    setContent(newContent);
  };

  const handleRemoveContent = (index: number) => {
    setContent(content.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      if (!title) {
        toast({
          title: "Error",
          description: "Title is required",
          variant: "destructive",
        });
        return;
      }

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const blogData = {
        title,
        slug,
        excerpt,
        featured_image: featuredImage,
        published,
        content,
        source_type: sourceType,
        source_url: sourceUrl,
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from('blogs')
          .update(blogData as any)
          .eq('id', initialData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blogs')
          .insert(blogData as any);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Blog post saved successfully",
      });

      if (onSave) {
        onSave(blogData as BlogPost);
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      toast({
        title: "Error",
        description: "Failed to save blog post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {initialData?.id ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label htmlFor="published">Published</Label>
            </div>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter blog title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Enter a brief excerpt"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {content.map((item, index) => (
                <Card key={index}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveContent(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {item.type === 'text' && (
                      <Textarea
                        value={item.content}
                        onChange={(e) => handleContentChange(index, { ...item, content: e.target.value })}
                        rows={6}
                      />
                    )}

                    {item.type === 'image' && (
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const url = await handleImageUpload(file);
                                handleContentChange(index, { ...item, url });
                              } catch (error) {
                                console.error('Error uploading image:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to upload image",
                                  variant: "destructive",
                                });
                              }
                            }
                          }}
                        />
                        <Input
                          placeholder="Alt text"
                          value={item.alt}
                          onChange={(e) => handleContentChange(index, { ...item, alt: e.target.value })}
                        />
                        <Input
                          placeholder="Caption (optional)"
                          value={item.caption || ''}
                          onChange={(e) => handleContentChange(index, { ...item, caption: e.target.value })}
                        />
                      </div>
                    )}

                    {item.type === 'code' && (
                      <div className="space-y-2">
                        <Select
                          value={item.language}
                          onValueChange={(value) => handleContentChange(index, { ...item, language: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="typescript">TypeScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="csharp">C#</SelectItem>
                            <SelectItem value="sql">SQL</SelectItem>
                          </SelectContent>
                        </Select>
                        <CodeEditor
                          value={item.code}
                          onChange={(value) => handleContentChange(index, { ...item, code: value })}
                          language={item.language}
                        />
                        <Input
                          placeholder="Caption (optional)"
                          value={item.caption || ''}
                          onChange={(e) => handleContentChange(index, { ...item, caption: e.target.value })}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleAddContent('text')}
                >
                  <Type className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAddContent('image')}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAddContent('code')}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Add Code
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="featured-image">Featured Image</Label>
                  <div className="flex gap-4">
                    <Input
                      id="featured-image"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      placeholder="Enter image URL or upload"
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const url = await handleImageUpload(file);
                            setFeaturedImage(url);
                          } catch (error) {
                            console.error('Error uploading image:', error);
                            toast({
                              title: "Error",
                              description: "Failed to upload image",
                              variant: "destructive",
                            });
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source-type">Source Type</Label>
                  <Select
                    value={sourceType}
                    onValueChange={(value: BlogPost['source_type']) => setSourceType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {sourceType !== 'local' && (
                  <div className="space-y-2">
                    <Label htmlFor="source-url">Source URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="source-url"
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        placeholder="Enter source URL"
                      />
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (!sourceUrl) return;
                          try {
                            const response = await fetch(sourceUrl);
                            const html = await response.text();
                            const doc = new DOMParser().parseFromString(html, 'text/html');
                            
                            // Extract metadata
                            const metaTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                                            doc.querySelector('title')?.textContent;
                            const metaDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                                                  doc.querySelector('meta[name="description"]')?.getAttribute('content');
                            const metaImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');

                            if (metaTitle) setTitle(metaTitle);
                            if (metaDescription) setExcerpt(metaDescription);
                            if (metaImage) setFeaturedImage(metaImage);
                          } catch (error) {
                            console.error('Error fetching metadata:', error);
                            toast({
                              title: "Error",
                              description: "Failed to fetch URL metadata",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Fetch Metadata
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BlogEditor;
