import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

interface BrandLogo {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  hover_text: string | null;
  order_index: number;
}

const BrandLogos = () => {
  const [logos, setLogos] = useState<BrandLogo[]>([]);

  useEffect(() => {
    const fetchLogos = async () => {
      const { data } = await supabase
        .from("brand_logos")
        .select("*")
        .order("order_index", { ascending: true });
      if (data) setLogos(data as BrandLogo[]);
    };
    fetchLogos();
  }, []);

  if (logos.length === 0) return null;

  return (
    <div className="py-4">
      <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
          {logos.map((logo, i) => (
            <motion.div
              key={logo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              {logo.website_url ? (
                <a
                  href={logo.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2"
                  title={logo.hover_text || logo.name}
                >
                  <img
                    src={logo.logo_url}
                    alt={logo.name}
                    className="h-14 md:h-16 w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  />
                  {logo.hover_text && (
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      {logo.hover_text} <ExternalLink className="h-3 w-3" />
                    </span>
                  )}
                </a>
              ) : (
                <div className="flex flex-col items-center gap-2" title={logo.hover_text || logo.name}>
                  <img
                    src={logo.logo_url}
                    alt={logo.name}
                    className="h-14 md:h-16 w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  />
                  {logo.hover_text && (
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      {logo.hover_text}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export default BrandLogos;
