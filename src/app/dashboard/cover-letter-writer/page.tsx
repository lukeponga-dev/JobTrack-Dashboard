'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Wand2, FileText } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { CoverLetterWriterInputSchema, generateCoverLetter } from '@/ai/flows/cover-letter-writer';
import type { CoverLetterWriterInput } from '@/ai/flows/cover-letter-writer';

const CoverLetterWriterPage = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);

  const form = useForm<CoverLetterWriterInput>({
    resolver: zodResolver(CoverLetterWriterInputSchema),
    defaultValues: {
      fullName: user?.displayName || '',
      jobRole: '',
      companyName: '',
      jobDescription: '',
      userExperience: '',
    },
  });

  const onSubmit = async (values: CoverLetterWriterInput) => {
    setLoading(true);
    setGeneratedLetter(null);
    try {
      const result = await generateCoverLetter(values);
      setGeneratedLetter(result.coverLetterText);
      toast({
        title: 'Cover Letter Generated!',
        description: 'Your new cover letter is ready for review.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate the cover letter. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Link href="/dashboard" className="text-lg font-semibold font-headline flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          AI Cover Letter Writer
        </Link>
      </header>
      <main className="flex-1 p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Job &amp; You</CardTitle>
              <CardDescription>Fill out the details to generate a custom cover letter.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Your Information</h3>
                    <FormField name="fullName" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="userExperience" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Key Skills & Experience</FormLabel>
                        <FormControl><Textarea placeholder="Describe your most relevant skills and experience for this role..." rows={5} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Job Details</h3>
                    <FormField name="jobRole" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Role</FormLabel>
                        <FormControl><Input placeholder="e.g., Senior Product Manager" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="companyName" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Acme Inc." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="jobDescription" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl><Textarea placeholder="Paste the job description here..." rows={8} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Generate Cover Letter
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Generated Cover Letter</CardTitle>
              <CardDescription>Your AI-generated cover letter will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {generatedLetter && (
                <div className="prose dark:prose-invert max-w-none p-4 border rounded-md bg-secondary/50">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{generatedLetter}</pre>
                </div>
              )}
              {!loading && !generatedLetter && (
                <div className="flex justify-center items-center h-64 text-muted-foreground text-center">
                  <p>Your generated letter will be displayed here once you fill out and submit the form.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CoverLetterWriterPage;
