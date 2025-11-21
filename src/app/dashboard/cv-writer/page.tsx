'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, Trash, Loader2, Wand2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateCv } from '@/ai/flows/cv-writer';
import { CvWriterInputSchema } from '@/ai/flows/schemas';
import type { CvWriterInput } from '@/ai/flows/schemas';

const CvWriterPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatedCv, setGeneratedCv] = useState<string | null>(null);

  const form = useForm<CvWriterInput>({
    resolver: zodResolver(CvWriterInputSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      summary: '',
      experience: [{ role: '', company: '', duration: '', responsibilities: '' }],
      education: [{ degree: '', institution: '', year: '' }],
      skills: '',
    },
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control: form.control,
    name: 'experience',
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control: form.control,
    name: 'education',
  });

  const onSubmit = async (values: CvWriterInput) => {
    setLoading(true);
    setGeneratedCv(null);
    try {
      const result = await generateCv(values);
      setGeneratedCv(result.cvText);
      toast({
        title: 'CV Generated Successfully!',
        description: 'Your new CV is ready for review.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate the CV. Please try again.',
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
            <CardTitle className='font-headline text-2xl'>Your Details</CardTitle>
            <CardDescription>Fill out the form below to generate your CV.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <FormField name="fullName" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField name="email" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input placeholder="john.doe@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="phone" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl><Input placeholder="+123456789" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField name="address" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl><Input placeholder="City, Country" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
                </div>
                {/* Summary */}
                <FormField name="summary" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Summary</FormLabel>
                      <FormControl><Textarea placeholder="A brief summary of your career..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )} />

                {/* Work Experience */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Work Experience</h3>
                  {expFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md space-y-2 relative">
                      <FormField name={`experience.${index}.role`} control={form.control} render={({ field }) => (
                          <FormItem><FormLabel>Role</FormLabel><FormControl><Input placeholder="Software Engineer" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField name={`experience.${index}.company`} control={form.control} render={({ field }) => (
                          <FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="Tech Corp" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField name={`experience.${index}.duration`} control={form.control} render={({ field }) => (
                          <FormItem><FormLabel>Duration</FormLabel><FormControl><Input placeholder="Jan 2022 - Present" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField name={`experience.${index}.responsibilities`} control={form.control} render={({ field }) => (
                          <FormItem><FormLabel>Responsibilities</FormLabel><FormControl><Textarea placeholder="Describe your key responsibilities..." {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeExp(index)}><Trash className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendExp({ role: '', company: '', duration: '', responsibilities: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
                  </Button>
                </div>
                
                {/* Education */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Education</h3>
                  {eduFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md space-y-2 relative">
                      <FormField name={`education.${index}.degree`} control={form.control} render={({ field }) => (
                          <FormItem><FormLabel>Degree</FormLabel><FormControl><Input placeholder="B.Sc. in Computer Science" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField name={`education.${index}.institution`} control={form.control} render={({ field }) => (
                          <FormItem><FormLabel>Institution</FormLabel><FormControl><Input placeholder="University of Example" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField name={`education.${index}.year`} control={form.control} render={({ field }) => (
                          <FormItem><FormLabel>Year of Graduation</FormLabel><FormControl><Input placeholder="2021" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeEdu(index)}><Trash className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendEdu({ degree: '', institution: '', year: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Education
                  </Button>
                </div>

                {/* Skills */}
                <FormField name="skills" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills</FormLabel>
                      <FormControl><Textarea placeholder="List your skills, separated by commas..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Generate CV
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='font-headline text-2xl'>Generated CV</CardTitle>
            <CardDescription>Your AI-generated CV will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {generatedCv && (
              <div className="prose dark:prose-invert max-w-none p-4 border rounded-md bg-secondary/50">
                <pre className="whitespace-pre-wrap font-sans text-sm">{generatedCv}</pre>
              </div>
            )}
            {!loading && !generatedCv && (
              <div className="flex justify-center items-center h-64 text-muted-foreground text-center">
                  <p>Your generated CV will be displayed here once you fill out and submit the form.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default CvWriterPage;
