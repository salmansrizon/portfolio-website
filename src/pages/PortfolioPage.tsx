import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Github, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import Navbar from "@/components/Navbar";
import { usePageView } from "@/hooks/usePageView";
import { Skeleton } from "@/components/ui/skeleton";
import { useSectionContent } from "@/hooks/useSectionContent";
import { motion } from "framer-motion";

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image_url?: string;
  demo_url?: string;
  github_url?: string;
  created_at: string;
}

const DESC_LIMIT = 120;

const PortfolioPage = () => {
  const { content: sectionContent } = useSectionContent("portfolio");
  usePageView("/portfolio");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-32 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
              <Skeleton className="h-14 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden border border-border/50">
                  <Skeleton className="aspect-video w-full" />
                  <CardHeader className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <div className="flex gap-2">
                       <Skeleton className="h-5 w-16" />
                       <Skeleton className="h-5 w-20" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-6" />
                    <div className="flex gap-3">
                       <Skeleton className="h-10 flex-1" />
                       <Skeleton className="h-10 flex-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section className="min-h-screen pt-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-foreground mb-4">{sectionContent.title}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {sectionContent.description}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, i) => {
              const isExpanded = expandedIds.has(project.id);
              const isLong = project.description.length > DESC_LIMIT;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: (i % 3) * 0.08, ease: "easeOut" }}
                  className="h-full"
                >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
                  {project.image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  <CardHeader className="flex-none">
                    <CardTitle className="text-xl font-bold mb-2 text-primary">{project.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.technologies.map((tech, index) => (
                        <Badge key={index} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <div className="flex-1">
                      <p className="text-muted-foreground mb-2">
                        {isLong && !isExpanded
                          ? `${project.description.slice(0, DESC_LIMIT)}...`
                          : project.description}
                      </p>
                      {isLong && (
                        <button
                          onClick={() => toggleExpand(project.id)}
                          className="text-primary text-sm font-medium flex items-center gap-1 mb-4 hover:underline"
                        >
                          {isExpanded ? 'Show less' : 'Read more'}
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      )}
                      {!isLong && <div className="mb-4" />}
                    </div>
                    <div className="flex gap-3 mt-auto">
                      {project.demo_url && (
                        <Button variant="outline" className="flex-1" asChild>
                          <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Live Demo
                          </a>
                        </Button>
                      )}
                      {project.github_url && (
                        <Button variant="outline" className="flex-1" asChild>
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-2" />
                            Source Code
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                </motion.div>
              );
            })}
          </div>

          {projects.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <p>No projects available yet.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default PortfolioPage;
