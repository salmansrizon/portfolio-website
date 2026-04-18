import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map, ArrowRight } from 'lucide-react';
import { usePageView } from '@/hooks/usePageView';
import { Skeleton } from '@/components/ui/skeleton';

interface Roadmap {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  banner_image: string | null;
  status: string;
}

const RoadmapsPage = () => {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  usePageView('/roadmaps');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('roadmaps')
        .select('id, title, slug, description, icon, banner_image, status')
        .eq('status', 'published')
        .order('order_index');
      setRoadmaps((data || []) as Roadmap[]);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">Career Roadmaps</h1>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Step-by-step learning paths to help you navigate your tech career journey.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : roadmaps.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No roadmaps available yet. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {roadmaps.map((r) => (
                <Link key={r.id} to={`/roadmaps/${r.slug}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full border-primary/10 hover:border-primary/30">
                    {r.banner_image && (
                      <div className="h-28 sm:h-32 overflow-hidden rounded-t-xl">
                        <img src={r.banner_image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/10 shrink-0 overflow-hidden">
                          {r.icon && /^https?:\/\//.test(r.icon) ? (
                            <img src={r.icon} alt="" className="h-5 w-5 object-contain" />
                          ) : (
                            <Map className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{r.title}</h3>
                        </div>
                      </div>
                      {r.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{r.description}</p>
                      )}
                      <div className="flex items-center text-sm text-primary font-medium">
                        Explore Roadmap <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapsPage;
