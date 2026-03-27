import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Github, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import Navbar from "@/components/Navbar";
import { usePageView } from "@/hooks/usePageView";

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
        <div className="min-h-screen pt-16 bg-background">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
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
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-4 text-primary">Portfolio</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A showcase of my projects and technical implementations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => {
              const isExpanded = expandedIds.has(project.id);
              const isLong = project.description.length > DESC_LIMIT;

              return (
                <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
                  {project.image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover"
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
