import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { parseRoadmapMarkdown } from '@/utils/parseRoadmapMarkdown';
import RoadmapTreeView from '@/components/roadmap/RoadmapTreeView';
import RoadmapAccordionView from '@/components/roadmap/RoadmapAccordionView';
import { TreePine, List, ArrowLeft } from 'lucide-react';
import { usePageView } from '@/hooks/usePageView';
import { Skeleton } from '@/components/ui/skeleton';

interface Roadmap {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  markdown_content: string;
  banner_image: string | null;
}

const RoadmapDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'tree' | 'accordion'>('tree');
  usePageView(`/roadmaps/${slug}`);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      setRoadmap(data as Roadmap | null);
      setLoading(false);
    };
    if (slug) fetch();
  }, [slug]);

  const nodes = useMemo(() => {
    if (!roadmap?.markdown_content) return [];
    return parseRoadmapMarkdown(roadmap.markdown_content);
  }, [roadmap?.markdown_content]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Roadmap not found</h1>
          <Button asChild variant="outline"><Link to="/roadmaps"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Roadmaps</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Link to="/roadmaps" className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-primary mb-3 sm:mb-4 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" /> All Roadmaps
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1.5 sm:mb-2">{roadmap.title}</h1>
            {roadmap.description && (
              <p className="text-sm sm:text-lg text-muted-foreground">{roadmap.description}</p>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 sm:gap-2 mb-4 sm:mb-6 p-1 bg-muted rounded-lg w-fit">
            <Button
              variant={viewMode === 'tree' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('tree')}
              className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3"
            >
              <TreePine className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Tree
            </Button>
            <Button
              variant={viewMode === 'accordion' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('accordion')}
              className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3"
            >
              <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> List
            </Button>
          </div>

          {/* Content */}
          {nodes.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No content available for this roadmap yet.</p>
          ) : viewMode === 'tree' ? (
            <RoadmapTreeView nodes={nodes} />
          ) : (
            <RoadmapAccordionView nodes={nodes} />
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapDetailPage;
