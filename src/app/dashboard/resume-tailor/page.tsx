'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Wand2, ScanText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { tailorResume } from '@/ai/flows/resume-tailor';

export const ResumeTailorInputSchema = z.object({
  resumeText: z.string().min(1, 'Original resume text is required.'),
  jobDescription: z.string().min(1, 'Job description is required.'),
});
export type ResumeTailorInput = z.infer<typeof ResumeTailorInputSchema>;


const ResumeTailorPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tailoredResume, setTailoredResume] = useState<string | null>(null);

  const form = useForm<ResumeTailorInput>({
    resolver: zodResolver(ResumeTailorInputSchema),
    defaultValues: {
      resumeText: '',
      jobDescription: '',
    },
  });

  const onSubmit = async (values: ResumeTailorInput) => {
    setLoading(true);
    setTailoredResume(null);
    try {
      const result = await tailorResume(values);
      setTailoredResume(result.tailoredResumeText);
      toast({
        title: 'Resume Tailored!',
        description: 'Your tailored resume is ready for review.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not tailor the resume. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className='font-headline text-2xl'>Resume &amp; Job Details</CardTitle>
            <CardDescription>Paste your resume and the job description below.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField name="resumeText" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Current Resume</FormLabel>
                    <FormControl><Textarea placeholder="Paste your full resume text here..." rows={12} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="jobDescription" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Job Description</FormLabel>
                    <FormControl><Textarea placeholder="Paste the job description you are applying for..." rows={12} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Tailor Resume
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='font-headline text-2xl'>Tailored Resume</CardTitle>
            <CardDescription>Your AI-tailored resume will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {tailoredResume && (
              <div className="prose dark:prose-invert max-w-none p-4 border rounded-md bg-secondary/50">
                <pre className="whitespace-pre-wrap font-sans text-sm">{tailoredResume}</pre>
              </div>
            )}
            {!loading && !tailoredResume && (
              <div className="flex justify-center items-center h-64 text-muted-foreground text-center">
                <p>Your tailored resume will be displayed here once you submit the form.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ResumeTailorPage;
