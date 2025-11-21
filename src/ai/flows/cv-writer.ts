'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExperienceSchema = z.object({
  role: z.string(),
  company: z.string(),
  duration: z.string(),
  responsibilities: z.string(),
});

const EducationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  year: z.string(),
});

export const CvWriterInputSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(1, 'Phone number is required.'),
  address: z.string().min(1, 'Address is required.'),
  summary: z.string().min(1, 'Professional summary is required.'),
  experience: z.array(ExperienceSchema).min(1, 'At least one work experience is required.'),
  education: z.array(EducationSchema).min(1, 'At least one education entry is required.'),
  skills: z.string().min(1, 'Please list your skills.'),
});
export type CvWriterInput = z.infer<typeof CvWriterInputSchema>;

const CvWriterOutputSchema = z.object({
  cvText: z.string().describe('The full, formatted CV text in Markdown format.'),
});
export type CvWriterOutput = z.infer<typeof CvWriterOutputSchema>;

const cvWriterFlow = ai.defineFlow(
  {
    name: 'cvWriterFlow',
    inputSchema: CvWriterInputSchema,
    outputSchema: CvWriterOutputSchema,
  },
  async input => {
    const prompt = ai.definePrompt({
      name: 'cvWriterPrompt',
      input: { schema: CvWriterInputSchema },
      output: { schema: CvWriterOutputSchema },
      prompt: `You are a professional resume writer. Create a clean, well-formatted CV in Markdown based on the following information. Ensure the output is professional and easy to read.

## Personal Information
- **Full Name:** {{{fullName}}}
- **Email:** {{{email}}}
- **Phone:** {{{phone}}}
- **Address:** {{{address}}}

## Professional Summary
{{{summary}}}

## Work Experience
{{#each experience}}
- **{{role}}** at {{company}} ({{duration}})
  - {{responsibilities}}
{{/each}}

## Education
{{#each education}}
- **{{degree}}**, {{institution}} ({{year}})
{{/each}}

## Skills
- {{{skills}}}
`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateCv(input: CvWriterInput): Promise<CvWriterOutput> {
  return cvWriterFlow(input);
}
