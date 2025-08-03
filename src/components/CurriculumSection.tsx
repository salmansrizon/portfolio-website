import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Folder, Play, Lock, Video, HelpCircle, Code, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Module {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  is_visible: boolean;
}

interface SubModule {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  module_id: string;
  is_visible: boolean;
}

interface Content {
  id: string;
  title: string;
  description?: string;
  content_category: 'lesson' | 'quiz' | 'project' | 'assignment' | 'text' | 'video';
  order_index: number;
  module_id?: string;
  submodule_id?: string;
  is_free: boolean;
  duration_minutes?: number;
}

interface CurriculumSectionProps {
  courseId: string;
}

const getContentIcon = (type: string) => {
  switch (type) {
    case 'lesson':
    case 'video':
      return <Video className="w-4 h-4" />;
    case 'quiz':
      return <HelpCircle className="w-4 h-4" />;
    case 'project':
      return <Code className="w-4 h-4" />;
    case 'assignment':
    case 'text':
      return <FileText className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

export default function CurriculumSection({ courseId }: CurriculumSectionProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [subModules, setSubModules] = useState<SubModule[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [openModules, setOpenModules] = useState<string[]>([]);
  const [openSubModules, setOpenSubModules] = useState<string[]>([]);

  useEffect(() => {
    if (courseId) {
      fetchCurriculumData();
    }
  }, [courseId]);

  const fetchCurriculumData = async () => {
    try {
      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_visible", true)
        .order("order_index");

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      // Fetch all submodules for this course
      const { data: subModulesData, error: subModulesError } = await supabase
        .from("course_submodules")
        .select(`
          *,
          course_modules!inner(course_id)
        `)
        .eq("course_modules.course_id", courseId)
        .eq("is_visible", true)
        .order("order_index");

      if (subModulesError) throw subModulesError;
      setSubModules(subModulesData || []);

      // Fetch all contents for this course
      const { data: contentsData, error: contentsError } = await supabase
        .from("course_content")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (contentsError) throw contentsError;
      setContents(contentsData || []);

    } catch (error) {
      console.error("Error fetching curriculum data:", error);
    }
  };

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const toggleSubModule = (subModuleId: string) => {
    setOpenSubModules(prev => 
      prev.includes(subModuleId) 
        ? prev.filter(id => id !== subModuleId)
        : [...prev, subModuleId]
    );
  };

  const getModuleContents = (moduleId: string) => {
    return contents.filter(content => content.module_id === moduleId && !content.submodule_id);
  };

  const getSubModuleContents = (subModuleId: string) => {
    return contents.filter(content => content.submodule_id === subModuleId);
  };

  const getModuleSubModules = (moduleId: string) => {
    return subModules.filter(subModule => subModule.module_id === moduleId);
  };

  const getTotalModuleItems = (moduleId: string) => {
    const moduleContents = getModuleContents(moduleId);
    const moduleSubModules = getModuleSubModules(moduleId);
    const subModuleContents = moduleSubModules.reduce((acc, subModule) => {
      return acc + getSubModuleContents(subModule.id).length;
    }, 0);
    
    return moduleContents.length + subModuleContents;
  };

  return (
    <div className="space-y-4">
      {modules.map((module) => {
        const moduleContents = getModuleContents(module.id);
        const moduleSubModules = getModuleSubModules(module.id);
        const totalItems = getTotalModuleItems(module.id);
        
        return (
          <Collapsible key={module.id} open={openModules.includes(module.id)} onOpenChange={() => toggleModule(module.id)}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border rounded-lg hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  {module.order_index + 1}
                </div>
                <div className="text-left">
                  <span className="font-medium">{module.title}</span>
                  {module.description && (
                    <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {totalItems} items
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openModules.includes(module.id) ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-2 ml-11 space-y-2">
              {/* Direct module contents */}
              {moduleContents.map((content, index) => (
                <div key={content.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/20">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getContentIcon(content.content_category)}
                      <span className="font-medium">{content.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {content.content_category}
                      </Badge>
                      {content.is_free ? (
                        <Badge variant="secondary" className="text-xs">Free</Badge>
                      ) : (
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      )}
                      {content.duration_minutes && (
                        <span className="ml-auto text-sm text-muted-foreground">{content.duration_minutes} min</span>
                      )}
                    </div>
                    {content.description && (
                      <p className="text-sm text-muted-foreground mt-1 ml-6">{content.description}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* SubModules */}
              {moduleSubModules.map((subModule) => {
                const subModuleContents = getSubModuleContents(subModule.id);
                
                return (
                  <div key={subModule.id} className="ml-4">
                    <Collapsible open={openSubModules.includes(subModule.id)} onOpenChange={() => toggleSubModule(subModule.id)}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 border border-dashed rounded-lg hover:bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Folder className="w-5 h-5 text-primary" />
                          <div className="text-left">
                            <span className="font-medium text-sm">{subModule.title}</span>
                            {subModule.description && (
                              <p className="text-xs text-muted-foreground mt-1">{subModule.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {subModuleContents.length} items
                          </span>
                          <ChevronDown className={`w-3 h-3 transition-transform ${openSubModules.includes(subModule.id) ? 'rotate-180' : ''}`} />
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="mt-2 ml-6 space-y-2">
                        {subModuleContents.map((content, index) => (
                          <div key={content.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/20">
                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-xs font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {getContentIcon(content.content_category)}
                                <span className="font-medium text-sm">{content.title}</span>
                                <Badge variant="outline" className="text-xs">
                                  {content.content_category}
                                </Badge>
                                {content.is_free ? (
                                  <Badge variant="secondary" className="text-xs">Free</Badge>
                                ) : (
                                  <Lock className="w-3 h-3 text-muted-foreground" />
                                )}
                                {content.duration_minutes && (
                                  <span className="ml-auto text-xs text-muted-foreground">{content.duration_minutes} min</span>
                                )}
                              </div>
                              {content.description && (
                                <p className="text-xs text-muted-foreground mt-1 ml-5">{content.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        );
      })}

      {modules.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No curriculum modules available for this course
        </div>
      )}
    </div>
  );
}