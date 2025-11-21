'use server';
/**
 * @fileOverview A cover letter generation AI agent.
 *
 * - generateCoverLetter - A function that handles the cover letter generation process.
 * - CoverLetterWriterInput - The input type for the generateCoverLetter function.
 * - CoverLetterWriterOutput - The return type for the generateCoverLetter function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const CoverLetterWriterInputSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.'),
  jobRole: z.string().min(1, 'Job role is required.'),
  companyName: z.string().min(1, 'Company name is required.'),
  jobDescription: z.string().min(1, 'Job description is required.'),
  userExperience: z.string().min(1, 'Please describe your relevant experience.'),
});

export type CoverLetterWriterInput = z.infer<typeof CoverLetterWriterInputSchema>;

export const CoverLetterWriterOutputSchema = z.object({
  coverLetterText: z.string().describe('The full, formatted cover letter text in Markdown format.'),
});
export type CoverLetterWriterOutput = z.infer<typeof CoverLetterWriterOutputSchema>;

const coverLetterWriterFlow = ai.defineFlow(
  {
    name: 'coverLetterWriterFlow',
    inputSchema: CoverLetterWriterInputSchema,
    outputSchema: CoverLetterWriterOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'coverLetterWriterPrompt',
      input: { schema: CoverLetterWriterInputSchema },
      output: { schema: CoverLetterWriterOutputSchema },
      prompt: `You are a professional career coach. Write a compelling and professional cover letter in Markdown format based on the following information. The tone should be enthusiastic and confident.

## Candidate Information
- **Full Name:** {{{fullName}}}
- **Relevant Experience & Skills:** {{{userExperience}}}

## Job Information
- **Company:** {{{companyName}}}
- **Role:** {{{jobRole}}}
- **Job Description:** {{{jobDescription}}}

Address the letter to the "Hiring Manager" at the specified company. The letter should highlight how the candidate's experience aligns with the job description and express strong interest in the role. Structure it with an introduction, a body paragraph (or two) highlighting key qualifications, and a strong closing with a call to action.
`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateCoverLetter(input: CoverLetterWriterInput): Promise<CoverLetterWriterOutput> {
  return coverLetterWriterFlow(input);
}
