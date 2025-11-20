'use client';

import { useState } from 'react';
import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { Reminder, JobApplication } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

const reminderSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  date: z.date({ required_error: 'Date is required.' }),
  jobId: z.string().min(1, 'Associated job is required.'),
});

type RemindersProps = {
  reminders: Reminder[];
  applications: JobApplication[];
};

export default function Reminders({ reminders, applications }: RemindersProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof reminderSchema>>({
    resolver: zodResolver(reminderSchema),
  });

  async function onSubmit(values: z.infer<typeof reminderSchema>) {
    if (!user) return;
    const selectedJob = applications.find(app => app.id === values.jobId);
    if (!selectedJob) return;

    const db = getFirestoreDb();
    if (!db) {
      toast({ variant: 'destructive', title: 'Failed to set reminder.' });
      return;
    }

    try {
      await addDoc(collection(db, 'reminders'), {
        userId: user.uid,
        title: values.title,
        date: format(values.date, 'yyyy-MM-dd'),
        jobId: values.jobId,
        jobCompany: selectedJob.company,
        jobRole: selectedJob.role,
      });
      toast({ title: 'Reminder set successfully!' });
      setIsDialogOpen(false);
      form.reset();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Failed to set reminder.' });
    }
  }

  async function deleteReminder(id: string) {
    const db = getFirestoreDb();
    if (!db) {
      toast({ variant: 'destructive', title: 'Failed to delete reminder.' });
      return;
    }
    try {
      await deleteDoc(doc(db, 'reminders', id));
      toast({ title: 'Reminder deleted.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Failed to delete reminder.' });
    }
  }

  if (!reminders) {
    return <Skeleton className="h-64" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle className="font-headline">Reminders</CardTitle>
          <CardDescription>Your upcoming events.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost">
              <Plus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Reminder</DialogTitle>
              <DialogDescription>Set a reminder for an interview or follow-up.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Follow-up with HR" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Associated Job</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a job application" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {applications.map((app) => (
                            <SelectItem key={app.id} value={app.id}>
                              {app.role} at {app.company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {reminders.length > 0 ? (
          <ul className="space-y-3">
            {reminders.map((reminder) => (
              <li key={reminder.id} className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{reminder.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {reminder.jobCompany} - {format(new Date(reminder.date), 'PP')}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteReminder(reminder.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">No upcoming reminders.</p>
        )}
      </CardContent>
    </Card>
  );
}
