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

interface HeroContent {
  title: {
    main: string;
    highlight: string;
  };
  subtitle: string;
  name: string;
  description: string;
  cta: {
    primary: {
      text: string;
      link: string;
    };
    secondary: {
      text: string;
      link: string;
    };
  };
}

interface AboutContent {
  title: string;
  subtitle: string;
  professionalJourney: {
    title: string;
    description: string;
  };
  stats: Array<{
    number: string;
    label: string;
  }>;
  skills: Array<{
    name: string;
    percentage: number;
  }>;
  expertise: string[];
}

interface ContactContent {
  title: string;
  description: string;
  email: string;
  phone: string;
  location: string;
}

type SectionContent = HeroContent | AboutContent | ContactContent;

interface SectionData {
  id: string;
  section_name: 'hero' | 'about' | 'contact';
  content: SectionContent;
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
      
      // Type assertion for the data
      const typedSections = (data || []).map(section => {
        const sectionName = section.section_name as 'hero' | 'about' | 'contact';
        let content: SectionContent;
        
        // First cast to unknown, then to the specific type
        const rawContent = section.content as unknown;
        if (sectionName === 'hero') {
          content = rawContent as HeroContent;
        } else if (sectionName === 'about') {
          content = rawContent as AboutContent;
        } else {
          content = rawContent as ContactContent;
        }

        const typedSection: SectionData = {
          id: section.id,
          section_name: sectionName,
          content
        };
        return typedSection;
      });

      setSections(typedSections);
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

      let updatedContent;
      const existingContent = section.content as any;

      if (sectionName === 'hero') {
        const heroContent: HeroContent = {
          title: {
            main: formData.title?.main || existingContent.title?.main || '',
            highlight: formData.title?.highlight || existingContent.title?.highlight || ''
          },
          subtitle: formData.subtitle || existingContent.subtitle || '',
          name: formData.name || existingContent.name || '',
          description: formData.description || existingContent.description || '',
          cta: {
            primary: {
              text: formData.cta?.primary?.text || existingContent.cta?.primary?.text || '',
              link: formData.cta?.primary?.link || existingContent.cta?.primary?.link || ''
            },
            secondary: {
              text: formData.cta?.secondary?.text || existingContent.cta?.secondary?.text || '',
              link: formData.cta?.secondary?.link || existingContent.cta?.secondary?.link || ''
            }
          }
        };
        updatedContent = heroContent;
      } else if (sectionName === 'about') {
        const aboutContent: AboutContent = {
          title: formData.title || existingContent.title || '',
          subtitle: formData.subtitle || existingContent.subtitle || '',
          professionalJourney: {
            title: formData.professionalJourney?.title || existingContent.professionalJourney?.title || '',
            description: formData.professionalJourney?.description || existingContent.professionalJourney?.description || ''
          },
          stats: formData.stats || existingContent.stats || [],
          skills: formData.skills || existingContent.skills || [],
          expertise: formData.expertise || existingContent.expertise || []
        };
        updatedContent = aboutContent;
      } else if (sectionName === 'contact') {
        const contactContent: ContactContent = {
          title: formData.title || existingContent.title || '',
          description: formData.description || existingContent.description || '',
          email: formData.email || existingContent.email || '',
          phone: formData.phone || existingContent.phone || '',
          location: formData.location || existingContent.location || ''
        };
        updatedContent = contactContent;
      }

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
  const heroContent = heroSection?.content as HeroContent;
  
  const aboutSection = sections.find(s => s.section_name === 'about');
  const aboutContent = aboutSection?.content as AboutContent;
  
  const contactSection = sections.find(s => s.section_name === 'contact');
  const contactContent = contactSection?.content as ContactContent;

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
              <form onSubmit={handleSubmit((data) => onSubmit(data, 'hero'))} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Main Title</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Input
                          {...register('title.main')}
                          defaultValue={heroContent?.title?.main}
                          placeholder="Main title text"
                        />
                      </div>
                      <div>
                        <Input
                          {...register('title.highlight')}
                          defaultValue={heroContent?.title?.highlight}
                          placeholder="Highlighted word"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      {...register('subtitle')}
                      defaultValue={heroContent?.subtitle}
                      placeholder="Your professional title or credential"
                    />
                  </div>

                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      defaultValue={heroContent?.name}
                      placeholder="Your full name"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    defaultValue={heroContent?.description}
                    rows={4}
                    placeholder="Brief description of your expertise and experience"
                  />
                </div>
                
                <div className="space-y-4">
                  <Label>Call to Action Buttons</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cta_primary_text">Primary Button Text</Label>
                      <Input
                        id="cta_primary_text"
                        {...register('cta.primary.text')}
                        defaultValue={heroContent?.cta?.primary?.text}
                        placeholder="e.g., View Portfolio"
                      />
                      <Input
                        {...register('cta.primary.link')}
                        defaultValue={heroContent?.cta?.primary?.link}
                        placeholder="e.g., /portfolio"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cta_secondary_text">Secondary Button Text</Label>
                      <Input
                        id="cta_secondary_text"
                        {...register('cta.secondary.text')}
                        defaultValue={heroContent?.cta?.secondary?.text}
                        placeholder="e.g., Contact Me"
                      />
                      <Input
                        {...register('cta.secondary.link')}
                        defaultValue={heroContent?.cta?.secondary?.link}
                        placeholder="e.g., #contact"
                      />
                    </div>
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
              <form onSubmit={handleSubmit((data) => onSubmit(data, 'about'))} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="about_title">Title</Label>
                    <Input
                      id="about_title"
                      {...register('title')}
                      defaultValue={aboutContent?.title}
                      placeholder="About Me"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="about_subtitle">Subtitle</Label>
                    <Input
                      id="about_subtitle"
                      {...register('subtitle')}
                      defaultValue={aboutContent?.subtitle}
                      placeholder="A brief tagline about your work"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="journey_title">Professional Journey Title</Label>
                    <Input
                      id="journey_title"
                      {...register('professionalJourney.title')}
                      defaultValue={aboutContent?.professionalJourney?.title}
                      placeholder="Professional Journey"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="journey_description">Professional Journey Description</Label>
                    <Textarea
                      id="journey_description"
                      {...register('professionalJourney.description')}
                      defaultValue={aboutContent?.professionalJourney?.description}
                      rows={6}
                      placeholder="Describe your professional journey and current role..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Stats</Label>
                  {aboutContent?.stats?.map((stat, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4">
                      <div>
                        <Input
                          {...register(`stats.${index}.number`)}
                          defaultValue={stat.number}
                          placeholder="Number (e.g. 4+)"
                        />
                      </div>
                      <div>
                        <Input
                          {...register(`stats.${index}.label`)}
                          defaultValue={stat.label}
                          placeholder="Label (e.g. Microsoft Certifications)"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <Label>Skills</Label>
                  {aboutContent?.skills?.map((skill, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4">
                      <div>
                        <Input
                          {...register(`skills.${index}.name`)}
                          defaultValue={skill.name}
                          placeholder="Skill name"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          {...register(`skills.${index}.percentage`)}
                          defaultValue={skill.percentage}
                          placeholder="Percentage"
                          min={0}
                          max={100}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <Label>Expertise Areas</Label>
                  {aboutContent?.expertise?.map((expertise, index) => (
                    <div key={index}>
                      <Input
                        {...register(`expertise.${index}`)}
                        defaultValue={expertise}
                        placeholder={`Expertise ${index + 1}`}
                      />
                    </div>
                  ))}
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
                    defaultValue={contactContent?.title}
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_description">Description</Label>
                  <Textarea
                    id="contact_description"
                    {...register('description')}
                    defaultValue={contactContent?.description}
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
                      defaultValue={contactContent?.email}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      defaultValue={contactContent?.phone}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...register('location')}
                    defaultValue={contactContent?.location}
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