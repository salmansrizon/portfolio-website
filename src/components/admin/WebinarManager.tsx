import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Calendar, Users, ChevronDown, ChevronUp, LayoutGrid, X, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createRepository } from "@/integrations/supabase/repository";
import { webinarConfig, instructorConfig } from "@/adapters/entityConfigs";
import { useEntityManager } from "@/hooks/useEntityManager";

const instructorRepository = createRepository(instructorConfig);

interface WebinarContentBlock {
    id: string;
    type: 'hero' | 'benefits' | 'host' | 'success_story' | 'pricing' | 'faq' | 'cta';
    title: string;
    content: any;
    order_index: number;
}

const defaultDraft = { is_free: true, content_blocks: [] as WebinarContentBlock[], status: 'draft', price: 0, booked_count: 0 };

export default function WebinarManager() {
    // Bookings tab is a separate, unrelated read-only display feature (not
    // part of the create/edit dialog this migration covers) — left as-is,
    // pre-existing and out of scope here, same as before this migration.
    const [bookings] = useState<any[]>([]);
    const [currentWebinar, setCurrentWebinar] = useState<any>(defaultDraft);
    const { toast } = useToast();

    const { data: instructors = [] } = instructorRepository.useFindAll();
    const { items: webinars, openCreate, openEdit, remove, dialog } = useEntityManager(webinarConfig);

    // The content-block builder isn't react-hook-form-driven, so it keeps its
    // own local draft state — re-synced from the hook's initialData whenever
    // the dialog is about to show a (possibly different) item.
    useEffect(() => {
        if (dialog.open) setCurrentWebinar(dialog.initialData ?? defaultDraft);
    }, [dialog.open, dialog.initialData]);

    const handleSaveWebinar = () => {
        if (!currentWebinar?.title || !currentWebinar?.webinar_date) {
            toast({ title: "Missing fields", description: "Please enter title and date", variant: "destructive" });
            return;
        }

        dialog.onSubmit({
            title: currentWebinar.title,
            description: currentWebinar.description,
            webinar_date: currentWebinar.webinar_date,
            price: currentWebinar.price || 0,
            is_free: currentWebinar.is_free ?? true,
            banner_url: currentWebinar.banner_url || '',
            content_blocks: currentWebinar.content_blocks || [],
            status: currentWebinar.status || 'draft',
            booked_count: currentWebinar.booked_count || 0,
        });
    };

    const addBlock = (type: WebinarContentBlock['type']) => {
        const newBlock: WebinarContentBlock = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            title: type.charAt(0).toUpperCase() + type.slice(1),
            content: getDefaultBlockContent(type),
            order_index: (currentWebinar?.content_blocks?.length || 0)
        };
        setCurrentWebinar(prev => ({
            ...prev,
            content_blocks: [...(prev?.content_blocks || []), newBlock]
        }));
    };

    const getDefaultBlockContent = (type: WebinarContentBlock['type']) => {
        switch (type) {
            case 'hero': return { subtitle: '', video_url: '', button_text: 'Book Now' };
            case 'benefits': return { items: [{ title: '', description: '' }] };
            case 'host': return { instructor_ids: [] };
            case 'pricing': return { price: 0, currency: 'BDT', features: [] };
            case 'faq': return { questions: [{ q: '', a: '' }] };
            default: return {};
        }
    };

    const updateBlock = (index: number, content: any) => {
        const blocks = [...(currentWebinar?.content_blocks || [])];
        blocks[index].content = content;
        setCurrentWebinar({ ...currentWebinar, content_blocks: blocks });
    };

    const moveBlock = (index: number, direction: -1 | 1) => {
        const blocks = [...(currentWebinar?.content_blocks || [])];
        const target = index + direction;
        if (target < 0 || target >= blocks.length) return;
        [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
        setCurrentWebinar({ ...currentWebinar, content_blocks: blocks });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Webinar Management</h2>
                    <p className="text-muted-foreground text-sm">Create and manage your webinar landing pages and attendees.</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" /> New Webinar
                </Button>
            </div>

            <Tabs defaultValue="webinars">
                <TabsList className="mb-4">
                    <TabsTrigger value="webinars" className="gap-2"><LayoutGrid className="h-4 w-4" /> Webinars</TabsTrigger>
                    <TabsTrigger value="bookings" className="gap-2"><Users className="h-4 w-4" /> All Bookings</TabsTrigger>
                </TabsList>

                <TabsContent value="webinars">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {webinars.map(w => (
                            <Card key={w.id} className="overflow-hidden border-border/50 hover:border-primary/30 transition-all bg-card/50 backdrop-blur-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant={w.status === 'published' ? 'default' : 'secondary'}>
                                            {w.status.toUpperCase()}
                                        </Badge>
                                        <Badge variant="outline" className="text-primary border-primary/20">
                                            {w.is_free ? 'FREE' : `৳${w.price}`}
                                        </Badge>
                                    </div>
                                    <CardTitle className="mt-2 text-foreground">{w.title}</CardTitle>
                                    <CardDescription>{w.webinar_date ? format(new Date(w.webinar_date), 'PPP p') : 'Date not set'}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(w)}>
                                            <Edit className="mr-2 h-3 w-3" /> Edit
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(w)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {webinars.length === 0 && (
                            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl opacity-50">
                                <Calendar className="h-12 w-12 mx-auto mb-4" />
                                <p>No webinars created yet.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="bookings">
                    <Card className="bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Registered Participants</CardTitle>
                            <CardDescription>View all students who have registered for webinars.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border border-border/50 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="p-3 text-left">Student</th>
                                            <th className="p-3 text-left">Webinar</th>
                                            <th className="p-3 text-left">Contact</th>
                                            <th className="p-3 text-left">Payment Info</th>
                                            <th className="p-3 text-left">Status</th>
                                            <th className="p-3 text-left">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {bookings.map(b => (
                                            <tr key={b.id} className="hover:bg-muted/30">
                                                <td className="p-3 font-medium">{b.student_name}</td>
                                                <td className="p-3 text-muted-foreground">{webinars.find(w => w.id === b.webinar_id)?.title || 'Unknown'}</td>
                                                <td className="p-3">
                                                    <div className="flex flex-col">
                                                        <span>{b.student_email}</span>
                                                        <span className="text-xs text-muted-foreground">{b.student_whatsapp}</span>
                                                        <span className="text-[10px] uppercase font-bold text-primary/60">{b.student_role}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-[10px] h-5 bg-background uppercase">{b.payment_method || 'N/A'}</Badge>
                                                        </div>
                                                        <span className="text-xs font-mono font-bold text-foreground bg-accent/20 px-2 py-0.5 rounded border border-primary/5">{b.payment_transaction_id || '---'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <Badge className={cn(
                                                        "text-[10px] font-black uppercase tracking-wider h-6 px-3",
                                                        b.payment_status === 'confirmed' ? "bg-green-500 hover:bg-green-600 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"
                                                    )}>
                                                        {b.payment_status}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-xs font-medium">{b.booking_date ? format(new Date(b.booking_date), 'PP') : 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {bookings.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground">No bookings found.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Webinar Edit Dialog */}
            <Dialog open={dialog.open} onOpenChange={dialog.onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-background/95 backdrop-blur-xl border-primary/20">
                    <DialogHeader>
                        <DialogTitle>{dialog.initialData?.id ? 'Edit Webinar' : 'Add New Webinar'}</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label>Title</Label>
                                <Input value={currentWebinar?.title || ''} onChange={e => setCurrentWebinar({ ...currentWebinar, title: e.target.value })} placeholder="Webinar Title" />
                            </div>
                            <div className="space-y-2">
                                <Label>Date & Time</Label>
                                <Input type="datetime-local" value={currentWebinar?.webinar_date ? new Date(new Date(currentWebinar.webinar_date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} onChange={e => setCurrentWebinar({ ...currentWebinar, webinar_date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Price (৳)</Label>
                                <Input type="number" value={currentWebinar?.price || 0} onChange={e => setCurrentWebinar({ ...currentWebinar, price: parseFloat(e.target.value) })} disabled={currentWebinar?.is_free} />
                            </div>
                            <div className="flex items-center space-x-2 pt-8">
                                <Switch checked={currentWebinar?.is_free} onCheckedChange={checked => setCurrentWebinar({ ...currentWebinar, is_free: checked, price: checked ? 0 : (currentWebinar?.price || 0) })} />
                                <Label>Free Webinar</Label>
                            </div>
                            <div className="space-y-2">
                                <Label>Social Proof: Registered Count</Label>
                                <Input type="number" value={currentWebinar?.booked_count || 0} onChange={e => setCurrentWebinar({ ...currentWebinar, booked_count: parseInt(e.target.value) || 0 })} placeholder="E.G. 15" />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={currentWebinar?.status || 'draft'} onValueChange={val => setCurrentWebinar({ ...currentWebinar, status: val as any })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="border-t border-border/50 pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Content Blocks</h3>
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="outline" size="sm" onClick={() => addBlock('hero')} className="hover:bg-primary/10">Hero</Button>
                                    <Button variant="outline" size="sm" onClick={() => addBlock('benefits')} className="hover:bg-primary/10">Benefits</Button>
                                    <Button variant="outline" size="sm" onClick={() => addBlock('host')} className="hover:bg-primary/10">Host</Button>
                                    <Button variant="outline" size="sm" onClick={() => addBlock('pricing')} className="hover:bg-primary/10">Pricing</Button>
                                    <Button variant="outline" size="sm" onClick={() => addBlock('faq')} className="hover:bg-primary/10">FAQ</Button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {currentWebinar?.content_blocks?.map((block, idx) => (
                                    <Card key={block.id} className="relative border-border/40 bg-muted/20">
                                        <CardHeader className="py-2 px-4 bg-muted/40 flex flex-row justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-background text-[10px]">{idx + 1}</Badge>
                                                <span className="text-xs font-bold uppercase tracking-wider">{block.type}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveBlock(idx, -1)} disabled={idx === 0}><ChevronUp className="h-3 w-3" /></Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveBlock(idx, 1)} disabled={idx === (currentWebinar?.content_blocks?.length ?? 0) - 1}><ChevronDown className="h-3 w-3" /></Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => {
                                                    const blocks = [...(currentWebinar.content_blocks || [])];
                                                    blocks.splice(idx, 1);
                                                    setCurrentWebinar({ ...currentWebinar, content_blocks: blocks });
                                                }}><Trash2 className="h-3 w-3" /></Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-4">
                                            <div>
                                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Block Heading</Label>
                                                <Input placeholder="Enter heading..." value={block.title} onChange={e => {
                                                    const blocks = [...(currentWebinar.content_blocks || [])];
                                                    blocks[idx].title = e.target.value;
                                                    setCurrentWebinar({ ...currentWebinar, content_blocks: blocks });
                                                }} />
                                            </div>

                                            {block.type === 'hero' && (
                                                <div className="space-y-4">
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Subtitle / Description</Label>
                                                        <Textarea
                                                            value={block.content.subtitle}
                                                            onChange={e => updateBlock(idx, { ...block.content, subtitle: e.target.value })}
                                                            placeholder="Short intro text..."
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Hero Image URL</Label>
                                                            <Input
                                                                value={block.content.imageUrl || ''}
                                                                onChange={e => updateBlock(idx, { ...block.content, imageUrl: e.target.value })}
                                                                placeholder="https://path/to/image.jpg"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">YouTube Video URL</Label>
                                                            <Input
                                                                value={block.content.videoUrl || ''}
                                                                onChange={e => updateBlock(idx, { ...block.content, videoUrl: e.target.value })}
                                                                placeholder="https://youtube.com/watch?v=..."
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {block.type === 'benefits' && (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center bg-muted/40 p-2 rounded-lg mb-2">
                                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Benefits Items</Label>
                                                        <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] uppercase font-bold hover:bg-primary/20" onClick={() => {
                                                            const newItems = [...(block.content.items || []), { title: '', description: '' }];
                                                            updateBlock(idx, { ...block.content, items: newItems });
                                                        }}>
                                                            <Plus className="h-3 w-3 mr-1" /> Add Benefit
                                                        </Button>
                                                    </div>

                                                    {block.content.items?.map((item: any, itemIdx: number) => (
                                                        <div key={itemIdx} className="bg-accent/5 p-4 rounded-xl border border-border/50 relative group/benefit space-y-3">
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Title</Label>
                                                                <Input
                                                                    value={item.title || ''}
                                                                    onChange={e => {
                                                                        const newItems = [...block.content.items];
                                                                        newItems[itemIdx].title = e.target.value;
                                                                        updateBlock(idx, { ...block.content, items: newItems });
                                                                    }}
                                                                    placeholder="E.G. Automating Data Cleaning"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Description</Label>
                                                                <Textarea
                                                                    value={item.description || item.text || ''}
                                                                    onChange={e => {
                                                                        const newItems = [...block.content.items];
                                                                        newItems[itemIdx].description = e.target.value;
                                                                        updateBlock(idx, { ...block.content, items: newItems });
                                                                    }}
                                                                    placeholder="Detailed description..."
                                                                />
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="absolute top-2 right-2 h-6 w-6 text-destructive opacity-0 group-hover/benefit:opacity-100 transition-opacity"
                                                                onClick={() => {
                                                                    const newItems = block.content.items.filter((_: any, i: number) => i !== itemIdx);
                                                                    updateBlock(idx, { ...block.content, items: newItems });
                                                                }}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {block.type === 'host' && (
                                                <div className="space-y-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {(block.content.instructor_ids || []).map((id: string) => {
                                                            const inst = instructors.find(i => i.id === id);
                                                            return inst ? (
                                                                <Badge key={id} variant="secondary" className="pl-1 pr-1 py-1 gap-2 flex items-center">
                                                                    <div className="w-5 h-5 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center">
                                                                        {inst.avatar_url ? <img src={inst.avatar_url} className="w-full h-full object-cover" /> : <Users className="h-3 w-3 text-primary" />}
                                                                    </div>
                                                                    <span className="text-xs font-bold text-foreground">{inst.name}</span>
                                                                    <button
                                                                        onClick={() => {
                                                                            const newIds = block.content.instructor_ids.filter((hid: string) => hid !== id);
                                                                            updateBlock(idx, { ...block.content, instructor_ids: newIds });
                                                                        }}
                                                                        className="hover:bg-destructive/20 rounded-full p-0.5"
                                                                    >
                                                                        <X className="h-3 w-3 text-destructive" />
                                                                    </button>
                                                                </Badge>
                                                            ) : null;
                                                        })}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Add Host / Instructor</Label>
                                                        <Select onValueChange={(val) => {
                                                            const currentIds = block.content.instructor_ids || [];
                                                            if (!currentIds.includes(val)) {
                                                                updateBlock(idx, { ...block.content, instructor_ids: [...currentIds, val] });
                                                            }
                                                        }}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Search and add instructors..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {instructors.filter(i => !(block.content.instructor_ids || []).includes(i.id)).map(inst => (
                                                                    <SelectItem key={inst.id} value={inst.id}>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-6 h-6 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
                                                                                {inst.avatar_url ? <img src={inst.avatar_url} className="w-full h-full object-cover" /> : <Users className="h-4 w-4" />}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-bold text-sm leading-none">{inst.name}</p>
                                                                                <p className="text-[10px] text-muted-foreground">{inst.specialization}</p>
                                                                            </div>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                                {instructors.filter(i => !(block.content.instructor_ids || []).includes(i.id)).length === 0 && (
                                                                    <p className="text-xs text-center py-2 text-muted-foreground italic">No more instructors available</p>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            )}

                                            {block.type === 'faq' && (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center bg-muted/40 p-2 rounded-lg mb-2">
                                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">FAQ Items</Label>
                                                        <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] uppercase font-bold hover:bg-primary/20" onClick={() => {
                                                            const newQs = [...(block.content.questions || []), { q: '', a: '' }];
                                                            updateBlock(idx, { ...block.content, questions: newQs });
                                                        }}>
                                                            <Plus className="h-3 w-3 mr-1" /> Add FAQ Item
                                                        </Button>
                                                    </div>

                                                    {block.content.questions?.map((q: any, qIdx: number) => (
                                                        <div key={qIdx} className="bg-accent/5 p-4 rounded-xl border border-border/50 relative group/faq space-y-3">
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Question {qIdx + 1}</Label>
                                                                <Input
                                                                    value={q.q}
                                                                    onChange={e => {
                                                                        const newQs = [...block.content.questions];
                                                                        newQs[qIdx].q = e.target.value;
                                                                        updateBlock(idx, { ...block.content, questions: newQs });
                                                                    }}
                                                                    placeholder="E.G. What is included?"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Answer</Label>
                                                                <Textarea
                                                                    value={q.a}
                                                                    onChange={e => {
                                                                        const newQs = [...block.content.questions];
                                                                        newQs[qIdx].a = e.target.value;
                                                                        updateBlock(idx, { ...block.content, questions: newQs });
                                                                    }}
                                                                    placeholder="Enter detailed answer..."
                                                                />
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="absolute top-2 right-2 h-6 w-6 text-destructive opacity-0 group-hover/faq:opacity-100 transition-opacity"
                                                                onClick={() => {
                                                                    const newQs = block.content.questions.filter((_: any, i: number) => i !== qIdx);
                                                                    updateBlock(idx, { ...block.content, questions: newQs });
                                                                }}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                                {(!currentWebinar?.content_blocks || currentWebinar.content_blocks.length === 0) && (
                                    <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
                                        No content blocks added yet. Click above to add sections.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-border/50 pt-4 px-6 pb-6 bg-muted/20">
                        <Button variant="outline" onClick={() => dialog.onOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleSaveWebinar} className="bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20">
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Save Webinar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
