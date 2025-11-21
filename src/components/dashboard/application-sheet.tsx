'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Loader2, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { collection, doc, serverTimestamp } from 'firebase/firestore';

import { SheetFooter } from '@/components/ui/sheet';
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
import { Textarea } from '@/components/ui/textarea';
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
import type { JobApplication, PartialJobApplication } from '@/lib/types';
import { JOB_STATUSES } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
  useFirestore,
  useUser,
} from '@/firebase';
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
  location: z.string().optional(),
  notes: z.string().optional(),
});

type ApplicationFormProps = {
  application: JobApplication | null;
  prefilledData?: PartialJobApplication | null;
  onSave: () => void;
};

export default function ApplicationForm({
  application,
  prefilledData,
  onSave,
}: ApplicationFormProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: '',
      role: '',
      url: '',
      status: 'Applied',
      dateApplied: new Date(),
      location: '',
      notes: '',
    },
  });

  const {
    handleSubmit,
    control,
    reset,
  } = form;

  useEffect(() => {
    if (application) {
      reset({
        ...application,
        url: application.url || '',
        dateApplied: new Date(application.dateApplied),
        location: application.location || '',
        notes: application.notes || '',
      });
    } else if (prefilledData) {
        reset({
            company: prefilledData.company || '',
            role: prefilledData.role || '',
            url: prefilledData.url || '',
            status: prefilledData.status as any || 'Applied',
            dateApplied: new Date(),
            location: prefilledData.location || '',
            notes: prefilledData.notes || '',
        });
    }
     else {
      reset({
        company: '',
        role: '',
        url: '',
        status: 'Applied',
        dateApplied: new Date(),
        location: '',
        notes: '',
      });
    }
  }, [application, prefilledData, reset]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }
    setIsSubmitting(true);

    const applicationData = {
      ...values,
      dateApplied: format(values.dateApplied, 'yyyy-MM-dd'),
      lastUpdated: serverTimestamp(),
      userId: user.uid,
    };
    
    try {
        if (application) {
          const appDocRef = doc(firestore, 'users', user.uid, 'jobApplications', application.id);
          updateDocumentNonBlocking(appDocRef, applicationData);
        } else {
          const jobAppsCollection = collection(firestore, 'users', user.uid, 'jobApplications');
          addDocumentNonBlocking(jobAppsCollection, applicationData);
        }
    
        toast({
          title: 'Success',
          description: application ? 'Application updated.' : 'Application added.',
        });
        onSave();
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'An unexpected error occurred.',
          });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!application || !user) return;
    try {
        const appDocRef = doc(firestore, 'users', user.uid, 'jobApplications', application.id);
        deleteDocumentNonBlocking(appDocRef);
        toast({ title: 'Success', description: 'Application deleted.' });
        onSave();
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Could not delete application. Please try again.',
        });
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
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
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Auckland, NZ" {...field} />
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
            <FormField
                control={control}
                name="notes"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                    <Textarea placeholder="Add any notes here..." {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

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
    </>
  );
}
