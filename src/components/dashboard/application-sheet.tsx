'use client';

import { useEffect } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Loader2, Trash } from 'lucide-react';
import { format } from 'date-fns';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { getFirestoreDb } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import type { JobApplication } from '@/lib/types';
import { JOB_STATUSES, type JobStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
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
} from '../ui/alert-dialog';

const formSchema = z.object({
  company: z.string().min(1, { message: 'Company is required.' }),
  role: z.string().min(1, { message: 'Role is required.' }),
  url: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')),
  status: z.enum(JOB_STATUSES),
  dateApplied: z.date({ required_error: 'Date applied is required.' }),
});

type ApplicationSheetProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  application: JobApplication | null;
  children: React.ReactNode;
};

export default function ApplicationSheet({
  isOpen,
  setIsOpen,
  application,
  children,
}: ApplicationSheetProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = form;

  useEffect(() => {
    if (application) {
      reset({
        ...application,
        dateApplied: new Date(application.dateApplied),
      });
    } else {
      reset({
        company: '',
        role: '',
        url: '',
        status: 'Applied',
        dateApplied: new Date(),
      });
    }
  }, [application, reset]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    const db = getFirestoreDb();
    if (!db) {
        toast({ variant: 'destructive', title: 'Error', description: 'Database not available.' });
        return;
    }

    const data = {
      ...values,
      dateApplied: format(values.dateApplied, 'yyyy-MM-dd'),
      lastUpdated: serverTimestamp(),
      userId: user.uid,
    };

    try {
      if (application) {
        await updateDoc(doc(db, 'jobApplications', application.id), data);
        toast({ title: 'Success', description: 'Application updated.' });
      } else {
        await addDoc(collection(db, 'jobApplications'), data);
        toast({ title: 'Success', description: 'Application added.' });
      }
      setIsOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleDelete = async () => {
    if (!application) return;
    
    const db = getFirestoreDb();
    if (!db) {
        toast({ variant: 'destructive', title: 'Error', description: 'Database not available.' });
        return;
    }

    try {
      await deleteDoc(doc(db, 'jobApplications', application.id));
      toast({ title: 'Success', description: 'Application deleted.' });
      setIsOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not delete application. Please try again.',
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {children}
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-headline">
            {application ? 'Edit Application' : 'Add Application'}
          </SheetTitle>
          <SheetDescription>
            {application ? 'Update the details of your job application.' : 'Track a new job application.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <FormField
              control={control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Google" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Posting URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {JOB_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="dateApplied"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2">
                    <FormLabel className='mb-2'>Date Applied</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className="pt-8">
              {application && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" className="mr-auto">
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this application. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
