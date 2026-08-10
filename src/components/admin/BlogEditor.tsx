import { useState, useEffect } from 'react';

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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Image as ImageIcon, Code, Link as LinkIcon, Type, Plus, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';
import { uploadCompressedImage } from '@/integrations/supabase/imageUpload';
import { useToast } from "@/components/ui/use-toast";
import { BlogContent, BlogPost } from '@/types/blog';
import { parseBlogContent, BlogContentRenderer } from '@/components/BlogContentRenderer';
import CodeEditor from '@/components/ui/code-editor';

const BLOG_CATEGORIES = [
  'data-analytics',
  'data-engineering',
  'machine-learning',
  'tutorials',
  'updates',
];

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
  // Normalize content from Supabase (may be string or array)
  const initialContent = parseBlogContent(initialData?.content);
  const [content, setContent] = useState<BlogContent[]>(initialContent);
  const [categories, setCategories] = useState<string[]>(initialData?.categories || []);
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState(false);

  // Sync state with incoming initialData when editing a blog post
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setExcerpt(initialData.excerpt || '');
      setFeaturedImage(initialData.featured_image || '');
      setPublished(initialData.published || false);
      setSourceType(initialData.source_type || 'local');
      setSourceUrl(initialData.source_url || '');
      // Normalize content from Supabase
      const parsedContent = parseBlogContent(initialData.content);
      setContent(parsedContent);
      setCategories(initialData.categories || []);
    } else {
      // Reset to defaults for creating a new blog post
      setTitle('');
      setExcerpt('');
      setFeaturedImage('');
      setPublished(false);
      setSourceType('local');
      setSourceUrl('');
      setContent([]);
      setCategories([]);
    }
  }, [initialData]);

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
    return uploadCompressedImage(file, 'blog-images');
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

      let slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const blogData: any = {
        title,
        excerpt,
        featured_image: featuredImage,
        published,
        content,
        source_type: sourceType,
        source_url: sourceUrl,
      };

      // Only add categories if the column exists in the database
      // You may need to add this column to your Supabase blogs table
      if (categories.length > 0) {
        blogData.categories = categories;
      }

      // For new posts, ensure slug is unique
      if (!initialData?.id) {
        let uniqueSlug = slug;
        let counter = 1;

        while (true) {
          const { data: existing, error: checkError } = await supabase
            .from('blogs')
            .select('id')
            .eq('slug', uniqueSlug)
            .single();

          if (checkError?.code === 'PGRST116') {
            // No row found - slug is unique
            slug = uniqueSlug;
            break;
          } else if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
          } else if (existing) {
            // Slug exists, try next number
            uniqueSlug = `${slug}-${counter}`;
            counter++;
          }
        }
      }

      blogData.slug = slug;

      console.log('Attempting to save blog data:', blogData);

      if (initialData?.id) {
        const { data, error } = await supabase
          .from('blogs')
          .update(blogData)
          .eq('id', initialData.id)
          .select();

        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }
        console.log('Blog updated successfully:', data);
      } else {
        const { data, error } = await supabase
          .from('blogs')
          .insert(blogData)
          .select();

        if (error) {
          console.error('Supabase insert error:', error);
          throw error;
        }
        console.log('Blog created successfully:', data);
      }

      toast({
        title: "Success",
        description: "Blog post saved successfully",
      });

      if (onSave) {
        onSave(blogData as BlogPost);
      }
    } catch (error: any) {
      console.error('Error saving blog:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save blog post",
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
            <TabsTrigger value="preview">Preview</TabsTrigger>
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

                <div className="space-y-2">
                  <Label>Categories</Label>
                  <Popover open={openCategoryDropdown} onOpenChange={setOpenCategoryDropdown}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCategoryDropdown}
                        className="w-full justify-between"
                      >
                        {categories.length > 0 
                          ? `${categories.length} categories selected`
                          : "Select categories..."
                        }
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search categories..." />
                        <CommandList>
                          <CommandEmpty>No category found.</CommandEmpty>
                          <CommandGroup className="max-h-[200px] overflow-y-auto">
                          {BLOG_CATEGORIES.map((category) => (
                            <CommandItem
                              key={category}
                              value={category}
                              onSelect={() => {
                                setCategories(prev => 
                                  prev.includes(category)
                                    ? prev.filter(c => c !== category)
                                    : [...prev, category]
                                );
                                // Don't close the dropdown when selecting an item
                                return false;
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  categories.includes(category) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {category}
                            </CommandItem>
                          ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {categories.map((category) => (
                        <div
                          key={category}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                        >
                          {category}
                          <button
                            type="button"
                            className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary/20 text-primary hover:bg-primary/30"
                            onClick={() => {
                              setCategories(prev => prev.filter(c => c !== category));
                            }}
                          >
                            <span className="sr-only">Remove category</span>
                            <svg className="h-2 w-2" fill="currentColor" viewBox="0 0 8 8">
                              <path d="M8 0.8L7.2 0 4 3.2 0.8 0 0 0.8 3.2 4 0 7.2 0.8 8 4 4.8 7.2 8 8 7.2 4.8 4 8 0.8z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                  className="flex items-center gap-2"
                >
                  <Type className="h-4 w-4" />
                  Add Text
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAddContent('image')}
                  className="flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  Add Image
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAddContent('code')}
                  className="flex items-center gap-2"
                >
                  <Code className="h-4 w-4" />
                  Add Code
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">{title || 'Untitled Post'}</h2>
                {excerpt && <p className="text-muted-foreground mb-6">{excerpt}</p>}
                <BlogContentRenderer content={content} />
              </CardContent>
            </Card>
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
                        <LinkIcon className="h-4 w-4 mr-2" />
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
