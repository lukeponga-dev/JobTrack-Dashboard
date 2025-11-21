'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, Wand2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  extractApplicationFromEmail,
  ExtractApplicationInputSchema,
} from '@/ai/flows/extract-from-email';
import type { ExtractApplicationInput } from '@/ai/flows/extract-from-email';
import type { PartialJobApplication } from '@/lib/types';

type AutoFromEmailProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: PartialJobApplication) => void;
};

export default function AutoFromEmail({ open, onOpenChange, onSave }: AutoFromEmailProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<ExtractApplicationInput>({
    resolver: zodResolver(ExtractApplicationInputSchema),
    defaultValues: {
      emailContent: '',
    },
  });

  const onSubmit = async (values: ExtractApplicationInput) => {
    setLoading(true);
    try {
      const result = await extractApplicationFromEmail(values);
      onSave(result);
      toast({
        title: 'Data Extracted!',
        description:
          'Job application details have been extracted and pre-filled.',
      });
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Extraction Failed',
        description: 'Could not extract details from the email. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 gap-1">
          <Mail className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Auto from Email
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Auto-create from Email</DialogTitle>
          <DialogDescription>
            Paste the full content of a job email below. The AI will extract the
            details for you.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="emailContent"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Email Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste your email content here..."
                      rows={15}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Extract Details
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
