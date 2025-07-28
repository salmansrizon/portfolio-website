import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  CalendarIcon, 
  Clock, 
  Plus, 
  Trash2, 
  CalendarX 
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UnavailableSlot {
  id: string;
  date: string;
  time_slot?: string;
  reason?: string;
  created_at: string;
}

const UnavailableSlotsManager = () => {
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: undefined as Date | undefined,
    time_slot: '',
    reason: '',
    isFullDay: false
  });
  const { toast } = useToast();

  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  useEffect(() => {
    fetchUnavailableSlots();
  }, []);

  const fetchUnavailableSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('unavailable_slots')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setUnavailableSlots(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch unavailable slots",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.date) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive"
      });
      return;
    }

    if (!formData.isFullDay && !formData.time_slot) {
      toast({
        title: "Error",
        description: "Please select a time slot or mark as full day",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('unavailable_slots')
        .insert({
          date: format(formData.date, 'yyyy-MM-dd'),
          time_slot: formData.isFullDay ? null : formData.time_slot,
          reason: formData.reason || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Unavailable slot added successfully"
      });

      // Reset form
      setFormData({
        date: undefined,
        time_slot: '',
        reason: '',
        isFullDay: false
      });

      fetchUnavailableSlots();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add unavailable slot",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('unavailable_slots')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Unavailable slot removed successfully"
      });

      fetchUnavailableSlots();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove unavailable slot",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Unavailable Slot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarX className="mr-2 h-5 w-5" />
            Add Unavailable Slot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select 
                value={formData.isFullDay ? 'full-day' : 'time-slot'} 
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  isFullDay: value === 'full-day',
                  time_slot: value === 'full-day' ? '' : prev.time_slot
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time-slot">Specific Time Slot</SelectItem>
                  <SelectItem value="full-day">Full Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!formData.isFullDay && (
            <div className="space-y-2">
              <Label>Time Slot</Label>
              <Select 
                value={formData.time_slot} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, time_slot: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time} (GMT+6)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Reason (Optional)</Label>
            <Textarea
              placeholder="Meeting, holiday, personal time, etc."
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Unavailable Slot
          </Button>
        </CardContent>
      </Card>

      {/* Existing Unavailable Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Current Unavailable Slots ({unavailableSlots.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {unavailableSlots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarX className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No unavailable slots configured</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unavailableSlots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="font-medium">
                        {format(new Date(slot.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {slot.time_slot ? (
                          <Badge variant="outline">{slot.time_slot}</Badge>
                        ) : (
                          <Badge variant="secondary">Full Day</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {slot.reason || <span className="text-muted-foreground">No reason</span>}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Unavailable Slot</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this unavailable slot? 
                                This will make the time slot available for booking again.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(slot.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnavailableSlotsManager;
