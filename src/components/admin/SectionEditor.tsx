import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface SectionData {
  id: string;
  section_name: string;
  content: any;
}

const SectionEditor = () => {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_sections')
        .select('*')
        .order('section_name');

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData: any, sectionName: string) => {
    setSaving(true);
    try {
      const section = sections.find(s => s.section_name === sectionName);
      if (!section) return;

      const updatedContent = { ...section.content, ...formData };

      const { error } = await supabase
        .from('portfolio_sections')
        .update({ content: updatedContent })
        .eq('id', section.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Section updated successfully!",
      });

      fetchSections();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const heroSection = sections.find(s => s.section_name === 'hero');
  const aboutSection = sections.find(s => s.section_name === 'about');
  const contactSection = sections.find(s => s.section_name === 'contact');

  return (
    <Tabs defaultValue="hero" className="space-y-6">
      <TabsList>
        <TabsTrigger value="hero">Hero Section</TabsTrigger>
        <TabsTrigger value="about">About Section</TabsTrigger>
        <TabsTrigger value="contact">Contact Section</TabsTrigger>
      </TabsList>

      <TabsContent value="hero">
        {heroSection && (
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((data) => onSubmit(data, 'hero'))} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    defaultValue={heroSection.content.title}
                  />
                </div>
                
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    {...register('subtitle')}
                    defaultValue={heroSection.content.subtitle}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    defaultValue={heroSection.content.description}
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cta_primary">Primary CTA</Label>
                    <Input
                      id="cta_primary"
                      {...register('cta_primary')}
                      defaultValue={heroSection.content.cta_primary}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cta_secondary">Secondary CTA</Label>
                    <Input
                      id="cta_secondary"
                      {...register('cta_secondary')}
                      defaultValue={heroSection.content.cta_secondary}
                    />
                  </div>
                </div>
                
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="about">
        {aboutSection && (
          <Card>
            <CardHeader>
              <CardTitle>About Section</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((data) => onSubmit(data, 'about'))} className="space-y-4">
                <div>
                  <Label htmlFor="about_title">Title</Label>
                  <Input
                    id="about_title"
                    {...register('title')}
                    defaultValue={aboutSection.content.title}
                  />
                </div>
                
                <div>
                  <Label htmlFor="about_description">Description</Label>
                  <Textarea
                    id="about_description"
                    {...register('description')}
                    defaultValue={aboutSection.content.description}
                    rows={6}
                  />
                </div>
                
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="contact">
        {contactSection && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Section</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((data) => onSubmit(data, 'contact'))} className="space-y-4">
                <div>
                  <Label htmlFor="contact_title">Title</Label>
                  <Input
                    id="contact_title"
                    {...register('title')}
                    defaultValue={contactSection.content.title}
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_description">Description</Label>
                  <Textarea
                    id="contact_description"
                    {...register('description')}
                    defaultValue={contactSection.content.description}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      defaultValue={contactSection.content.email}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      defaultValue={contactSection.content.phone}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...register('location')}
                    defaultValue={contactSection.content.location}
                  />
                </div>
                
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default SectionEditor;