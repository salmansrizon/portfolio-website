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
import { Loader2, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

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

interface ServicesContent {
  title: string;
  subtitle: string;
  description: string;
}

interface PortfolioContent {
  title: string;
  subtitle: string;
  description: string;
}

interface TestimonialsContent {
  title: string;
  subtitle: string;
  description: string;
}

interface CertificationsContent {
  title: string;
  subtitle: string;
  description: string;
}

// New section for Teaching, Mentoring and Technical Expertise
interface TeachingContent {
  title: string;
  subtitle: string;
  description: string;
}

// New section for Teaching, Mentoring and Technical Expertise
interface TeachingContent {
  title: string;
  subtitle: string;
  description: string;
}

type SectionContent = HeroContent | AboutContent | ContactContent | ServicesContent | PortfolioContent | TestimonialsContent | CertificationsContent | TeachingContent;

interface SectionData {
  id: string;
  section_name: 'hero' | 'about' | 'contact' | 'services' | 'portfolio' | 'testimonials' | 'certifications' | 'teaching';
  content: SectionContent;
  status?: string;
  section_type?: string;
  custom_fields?: any;
  order_index?: number;
  updated_at?: string;
}

const SectionEditor = () => {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createSectionName, setCreateSectionName] = useState('');
  const [createSectionType, setCreateSectionType] = useState<'predefined' | 'custom'>('predefined');
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm();

  const predefinedSections = ['hero', 'about', 'contact', 'services', 'portfolio', 'testimonials', 'certifications', 'teaching'];

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_sections')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;

      const typedSections = (data || []).map(section => {
        const sectionName = section.section_name as 'hero' | 'about' | 'contact' | 'services' | 'portfolio' | 'testimonials' | 'certifications' | 'teaching';
        let content: SectionContent;

        const rawContent = section.content as unknown;
        if (sectionName === 'hero') {
          content = rawContent as HeroContent;
        } else if (sectionName === 'about') {
          content = rawContent as AboutContent;
        } else if (sectionName === 'contact') {
          content = rawContent as ContactContent;
        } else {
          content = rawContent as ServicesContent | PortfolioContent | TestimonialsContent | CertificationsContent;
        }

        return {
          id: section.id,
          section_name: sectionName,
          content,
          status: section.status || 'published',
          section_type: section.section_type || 'predefined',
          custom_fields: section.custom_fields || null,
          order_index: section.order_index || 0,
          updated_at: section.updated_at,
        };
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

  const createNewSection = async () => {
    if (!createSectionName.trim()) {
      toast({
        title: "Error",
        description: "Section name is required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      let initialContent: SectionContent;

      if (createSectionType === 'predefined') {
        const sectionKey = createSectionName.toLowerCase();
        if (sectionKey === 'hero') {
          initialContent = {
            title: { main: '', highlight: '' },
            subtitle: '',
            name: '',
            description: '',
            cta: {
              primary: { text: '', link: '' },
              secondary: { text: '', link: '' }
            }
          } as HeroContent;
        } else if (sectionKey === 'about') {
          initialContent = {
            title: '',
            subtitle: '',
            professionalJourney: { title: '', description: '' },
            stats: [],
            skills: [],
            expertise: []
          } as AboutContent;
        } else if (sectionKey === 'contact') {
          initialContent = {
            title: '',
            description: '',
            email: '',
            phone: '',
            location: ''
          } as ContactContent;
        } else {
          initialContent = {
            title: '',
            subtitle: '',
            description: ''
          };
        }
      } else {
        initialContent = {
          title: '',
          subtitle: '',
          description: ''
        } as ServicesContent;
      }

      const { data, error } = await supabase
        .from('portfolio_sections')
        .insert({
          section_name: createSectionName.toLowerCase(),
          content: initialContent as any,
          status: 'published',
          section_type: createSectionType,
          order_index: sections.length,
        } as any)
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Section created successfully!",
      });

      setCreateSectionName('');
      setCreateSectionType('predefined');
      setShowCreateDialog(false);
      fetchSections();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create section",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
      } else if (sectionName === 'teaching') {
        const teachingContent: TeachingContent = {
          title: formData.title || existingContent.title || '',
          subtitle: formData.subtitle || existingContent.subtitle || '',
          description: formData.description || existingContent.description || ''
        };
        updatedContent = teachingContent;
      } else {
        updatedContent = {
          title: formData.title || existingContent.title || '',
          subtitle: formData.subtitle || existingContent.subtitle || '',
          description: formData.description || existingContent.description || ''
        };
      }

      // Handle custom fields
      const customFields = formData.customFields || [];
      const cleanedCustomFields = customFields.filter((field: any) => field.key && field.value);

      const { error } = await supabase
        .from('portfolio_sections')
        .update({
          content: updatedContent,
          status: formData.status || 'published',
          custom_fields: cleanedCustomFields.length > 0 ? cleanedCustomFields : null,
        })
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

  const getStatusBadge = (status?: string) => {
    const isPublished = status === 'published' || !status;
    return isPublished ? '✓ Published' : '✗ Draft';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Section Management</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="section-type">Section Type</Label>
                <select
                  id="section-type"
                  value={createSectionType}
                  onChange={(e) => setCreateSectionType(e.target.value as 'predefined' | 'custom')}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="predefined">Predefined</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {createSectionType === 'predefined' && (
                <div>
                  <Label htmlFor="section-name">Section Name</Label>
                  <select
                    id="section-name"
                    value={createSectionName}
                    onChange={(e) => setCreateSectionName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select a section</option>
                    {predefinedSections
                      .filter(name => !sections.find(s => s.section_name === name))
                      .map(name => (
                        <option key={name} value={name}>
                          {name.charAt(0).toUpperCase() + name.slice(1)}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {createSectionType === 'custom' && (
                <div>
                  <Label htmlFor="custom-name">Custom Section Name</Label>
                  <Input
                    id="custom-name"
                    value={createSectionName}
                    onChange={(e) => setCreateSectionName(e.target.value)}
                    placeholder="e.g., Pricing, FAQ, Team"
                  />
                </div>
              )}

              <Button onClick={createNewSection} disabled={saving} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Section
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {sections.map((section) => (
            <TabsTrigger key={section.id} value={section.section_name}>
              <div className="text-xs">
                {section.section_name.charAt(0).toUpperCase() + section.section_name.slice(1)}
                <div className="text-[10px] text-muted-foreground">
                  {getStatusBadge(section.status)}
                </div>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

      <TabsContent value="hero">
        {heroSection && (
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((data) => onSubmit(data, 'hero'))} className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hero-status"
                    checked={heroSection.status === 'published'}
                    onCheckedChange={(checked) => {
                      setValue('status', checked ? 'published' : 'draft');
                    }}
                    defaultChecked={heroSection.status === 'published'}
                  />
                  <Label htmlFor="hero-status">
                    {heroSection.status === 'published' ? 'Published' : 'Draft'}
                  </Label>
                </div>

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

                <div className="space-y-4 border-t pt-4">
                  <Label>Additional Custom Fields</Label>
                  {(heroSection.custom_fields as any)?.map((field: any, index: number) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                      <Input
                        {...register(`customFields.${index}.key`)}
                        defaultValue={field.key}
                        placeholder="Field name"
                      />
                      <div className="flex gap-2">
                        <Input
                          {...register(`customFields.${index}.value`)}
                          defaultValue={field.value}
                          placeholder="Field value"
                        />
                      </div>
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

      <TabsContent value="about">
        {aboutSection && (
          <Card>
            <CardHeader>
              <CardTitle>About Section</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((data) => onSubmit(data, 'about'))} className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="about-status"
                    checked={aboutSection.status === 'published'}
                    onCheckedChange={(checked) => {
                      setValue('status', checked ? 'published' : 'draft');
                    }}
                    defaultChecked={aboutSection.status === 'published'}
                  />
                  <Label htmlFor="about-status">
                    {aboutSection.status === 'published' ? 'Published' : 'Draft'}
                  </Label>
                </div>

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

                <div className="space-y-4 border-t pt-4">
                  <Label>Additional Custom Fields</Label>
                  {(aboutSection.custom_fields as any)?.map((field: any, index: number) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                      <Input
                        {...register(`customFields.${index}.key`)}
                        defaultValue={field.key}
                        placeholder="Field name"
                      />
                      <Input
                        {...register(`customFields.${index}.value`)}
                        defaultValue={field.value}
                        placeholder="Field value"
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
                <div className="flex items-center space-x-2">
                  <Switch
                    id="contact-status"
                    checked={contactSection.status === 'published'}
                    onCheckedChange={(checked) => {
                      setValue('status', checked ? 'published' : 'draft');
                    }}
                    defaultChecked={contactSection.status === 'published'}
                  />
                  <Label htmlFor="contact-status">
                    {contactSection.status === 'published' ? 'Published' : 'Draft'}
                  </Label>
                </div>

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

                <div className="space-y-4 border-t pt-4">
                  <Label>Additional Custom Fields</Label>
                  {(contactSection.custom_fields as any)?.map((field: any, index: number) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                      <Input
                        {...register(`customFields.${index}.key`)}
                        defaultValue={field.key}
                        placeholder="Field name"
                      />
                      <Input
                        {...register(`customFields.${index}.value`)}
                        defaultValue={field.value}
                        placeholder="Field value"
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

      {/* Services Section */}
      <TabsContent value="services">
        {sections.find(s => s.section_name === 'services') && (
          <Card>
            <CardHeader>
              <CardTitle>Services Section</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((data) => onSubmit(data, 'services'))} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="services-status"
                    checked={sections.find(s => s.section_name === 'services')?.status === 'published'}
                    onCheckedChange={(checked) => {
                      setValue('status', checked ? 'published' : 'draft');
                    }}
                    defaultChecked={sections.find(s => s.section_name === 'services')?.status === 'published'}
                  />
                  <Label htmlFor="services-status">
                    {sections.find(s => s.section_name === 'services')?.status === 'published' ? 'Published' : 'Draft'}
                  </Label>
                </div>

                <div>
                  <Label htmlFor="services_title">Title</Label>
                  <Input
                    id="services_title"
                    {...register('title')}
                    defaultValue={(sections.find(s => s.section_name === 'services')?.content as any)?.title || ''}
                    placeholder="Services section title"
                  />
                </div>

                <div>
                  <Label htmlFor="services_subtitle">Subtitle</Label>
                  <Input
                    id="services_subtitle"
                    {...register('subtitle')}
                    defaultValue={(sections.find(s => s.section_name === 'services')?.content as any)?.subtitle || ''}
                    placeholder="Services section subtitle"
                  />
                </div>

                <div>
                  <Label htmlFor="services_description">Description</Label>
                  <Textarea
                    id="services_description"
                    {...register('description')}
                    defaultValue={(sections.find(s => s.section_name === 'services')?.content as any)?.description || ''}
                    rows={3}
                    placeholder="Services section description"
                  />
                </div>

                <div className="space-y-4 border-t pt-4">
                  <Label>Additional Custom Fields</Label>
                  {(sections.find(s => s.section_name === 'services')?.custom_fields as any)?.map((field: any, index: number) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                      <Input
                        {...register(`customFields.${index}.key`)}
                        defaultValue={field.key}
                        placeholder="Field name"
                      />
                      <Input
                        {...register(`customFields.${index}.value`)}
                        defaultValue={field.value}
                        placeholder="Field value"
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

      {/* Portfolio Section */}
      <TabsContent value="portfolio">
        {sections.find(s => s.section_name === 'portfolio') && (
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Section</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((data) => onSubmit(data, 'portfolio'))} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="portfolio-status"
                    checked={sections.find(s => s.section_name === 'portfolio')?.status === 'published'}
                    onCheckedChange={(checked) => {
                      setValue('status', checked ? 'published' : 'draft');
                    }}
                    defaultChecked={sections.find(s => s.section_name === 'portfolio')?.status === 'published'}
                  />
                  <Label htmlFor="portfolio-status">
                    {sections.find(s => s.section_name === 'portfolio')?.status === 'published' ? 'Published' : 'Draft'}
                  </Label>
                </div>

                <div>
                  <Label htmlFor="portfolio_title">Title</Label>
                  <Input
                    id="portfolio_title"
                    {...register('title')}
                    defaultValue={(sections.find(s => s.section_name === 'portfolio')?.content as any)?.title || ''}
                    placeholder="Portfolio section title"
                  />
                </div>

                <div>
                  <Label htmlFor="portfolio_subtitle">Subtitle</Label>
                  <Input
                    id="portfolio_subtitle"
                    {...register('subtitle')}
                    defaultValue={(sections.find(s => s.section_name === 'portfolio')?.content as any)?.subtitle || ''}
                    placeholder="Portfolio section subtitle"
                  />
                </div>

                <div>
                  <Label htmlFor="portfolio_description">Description</Label>
                  <Textarea
                    id="portfolio_description"
                    {...register('description')}
                    defaultValue={(sections.find(s => s.section_name === 'portfolio')?.content as any)?.description || ''}
                    rows={3}
                    placeholder="Portfolio section description"
                  />
                </div>

                <div className="space-y-4 border-t pt-4">
                  <Label>Additional Custom Fields</Label>
                  {(sections.find(s => s.section_name === 'portfolio')?.custom_fields as any)?.map((field: any, index: number) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                      <Input
                        {...register(`customFields.${index}.key`)}
                        defaultValue={field.key}
                        placeholder="Field name"
                      />
                      <Input
                        {...register(`customFields.${index}.value`)}
                        defaultValue={field.value}
                        placeholder="Field value"
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

      {/* Testimonials Section */}
      <TabsContent value="testimonials">
        {sections.find(s => s.section_name === 'testimonials') && (
          <Card>
            <CardHeader>
              <CardTitle>Testimonials Section</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((data) => onSubmit(data, 'testimonials'))} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="testimonials-status"
                    checked={sections.find(s => s.section_name === 'testimonials')?.status === 'published'}
                    onCheckedChange={(checked) => {
                      setValue('status', checked ? 'published' : 'draft');
                    }}
                    defaultChecked={sections.find(s => s.section_name === 'testimonials')?.status === 'published'}
                  />
                  <Label htmlFor="testimonials-status">
                    {sections.find(s => s.section_name === 'testimonials')?.status === 'published' ? 'Published' : 'Draft'}
                  </Label>
                </div>

                <div>
                  <Label htmlFor="testimonials_title">Title</Label>
                  <Input
                    id="testimonials_title"
                    {...register('title')}
                    defaultValue={(sections.find(s => s.section_name === 'testimonials')?.content as any)?.title || ''}
                    placeholder="Testimonials section title"
                  />
                </div>

                <div>
                  <Label htmlFor="testimonials_subtitle">Subtitle</Label>
                  <Input
                    id="testimonials_subtitle"
                    {...register('subtitle')}
                    defaultValue={(sections.find(s => s.section_name === 'testimonials')?.content as any)?.subtitle || ''}
                    placeholder="Testimonials section subtitle"
                  />
                </div>

                <div>
                  <Label htmlFor="testimonials_description">Description</Label>
                  <Textarea
                    id="testimonials_description"
                    {...register('description')}
                    defaultValue={(sections.find(s => s.section_name === 'testimonials')?.content as any)?.description || ''}
                    rows={3}
                    placeholder="Testimonials section description"
                  />
                </div>

                <div className="space-y-4 border-t pt-4">
                  <Label>Additional Custom Fields</Label>
                  {(sections.find(s => s.section_name === 'testimonials')?.custom_fields as any)?.map((field: any, index: number) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                      <Input
                        {...register(`customFields.${index}.key`)}
                        defaultValue={field.key}
                        placeholder="Field name"
                      />
                      <Input
                        {...register(`customFields.${index}.value`)}
                        defaultValue={field.value}
                        placeholder="Field value"
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

      {/* Certifications Section */}
      <TabsContent value="certifications">
        {sections.find(s => s.section_name === 'certifications') && (
          <Card>
            <CardHeader>
              <CardTitle>Certifications Section</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((data) => onSubmit(data, 'certifications'))} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="certifications-status"
                    checked={sections.find(s => s.section_name === 'certifications')?.status === 'published'}
                    onCheckedChange={(checked) => {
                      setValue('status', checked ? 'published' : 'draft');
                    }}
                    defaultChecked={sections.find(s => s.section_name === 'certifications')?.status === 'published'}
                  />
                  <Label htmlFor="certifications-status">
                    {sections.find(s => s.section_name === 'certifications')?.status === 'published' ? 'Published' : 'Draft'}
                  </Label>
                </div>

                <div>
                  <Label htmlFor="certifications_title">Title</Label>
                  <Input
                    id="certifications_title"
                    {...register('title')}
                    defaultValue={(sections.find(s => s.section_name === 'certifications')?.content as any)?.title || ''}
                    placeholder="Certifications section title"
                  />
                </div>

                <div>
                  <Label htmlFor="certifications_subtitle">Subtitle</Label>
                  <Input
                    id="certifications_subtitle"
                    {...register('subtitle')}
                    defaultValue={(sections.find(s => s.section_name === 'certifications')?.content as any)?.subtitle || ''}
                    placeholder="Certifications section subtitle"
                  />
                </div>

                <div>
                  <Label htmlFor="certifications_description">Description</Label>
                  <Textarea
                    id="certifications_description"
                    {...register('description')}
                    defaultValue={(sections.find(s => s.section_name === 'certifications')?.content as any)?.description || ''}
                    rows={3}
                    placeholder="Certifications section description"
                  />
                </div>

                <div className="space-y-4 border-t pt-4">
                  <Label>Additional Custom Fields</Label>
                  {(sections.find(s => s.section_name === 'certifications')?.custom_fields as any)?.map((field: any, index: number) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                      <Input
                        {...register(`customFields.${index}.key`)}
                        defaultValue={field.key}
                        placeholder="Field name"
                      />
                      <Input
                        {...register(`customFields.${index}.value`)}
                        defaultValue={field.value}
                        placeholder="Field value"
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

      {/* Teaching & Mentoring Section */}
      <TabsContent value="teaching">
        {sections.find(s => s.section_name === 'teaching') && (
          <Card>
            <CardHeader>
              <CardTitle>Teaching & Mentoring Section</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((data) => onSubmit(data, 'teaching'))} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="teaching-status"
                    checked={sections.find(s => s.section_name === 'teaching')?.status === 'published'}
                    onCheckedChange={(checked) => {
                      setValue('status', checked ? 'published' : 'draft');
                    }}
                    defaultChecked={sections.find(s => s.section_name === 'teaching')?.status === 'published'}
                  />
                  <Label htmlFor="teaching-status">
                    {sections.find(s => s.section_name === 'teaching')?.status === 'published' ? 'Published' : 'Draft'}
                  </Label>
                </div>

                <div>
                  <Label htmlFor="teaching_title">Title</Label>
                  <Input
                    id="teaching_title"
                    {...register('title')}
                    defaultValue={(sections.find(s => s.section_name === 'teaching')?.content as any)?.title || ''}
                    placeholder="Teaching & Mentoring section title"
                  />
                </div>

                <div>
                  <Label htmlFor="teaching_subtitle">Subtitle</Label>
                  <Input
                    id="teaching_subtitle"
                    {...register('subtitle')}
                    defaultValue={(sections.find(s => s.section_name === 'teaching')?.content as any)?.subtitle || ''}
                    placeholder="Teaching & Mentoring section subtitle"
                  />
                </div>

                <div>
                  <Label htmlFor="teaching_description">Description</Label>
                  <Textarea
                    id="teaching_description"
                    {...register('description')}
                    defaultValue={(sections.find(s => s.section_name === 'teaching')?.content as any)?.description || ''}
                    rows={5}
                    placeholder="Describe your teaching and mentoring experience, technical expertise, and how you help others grow."
                  />
                </div>

                <div className="space-y-4 border-t pt-4">
                  <Label>Additional Custom Fields</Label>
                  {(sections.find(s => s.section_name === 'teaching')?.custom_fields as any)?.map((field: any, index: number) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                      <Input
                        {...register(`customFields.${index}.key`)}
                        defaultValue={field.key}
                        placeholder="Field name"
                      />
                      <Input
                        {...register(`customFields.${index}.value`)}
                        defaultValue={field.value}
                        placeholder="Field value"
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
    </Tabs>
    </div>
  );
};

export default SectionEditor;