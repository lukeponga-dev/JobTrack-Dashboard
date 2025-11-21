'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing job application data to identify trends and provide insights.
 *
 * The flow takes job application data as input and returns an analysis of success rates for different roles or companies.
 *
 * @remarks
 * - analyzeApplicationData - A function that triggers the job application analysis flow.
 * - AnalyzeApplicationDataInput - The input type for the analyzeApplicationData function, representing job application data.
 * - AnalyzeApplicationDataOutput - The output type for the analyzeApplicationData function, representing the analysis results.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the job application data.
const AnalyzeApplicationDataInputSchema = z.object({
  jobData: z
    .string()
    .describe('A JSON string representing an array of job applications.'),
});
export type AnalyzeApplicationDataInput = z.infer<
  typeof AnalyzeApplicationDataInputSchema
>;

// Define the output schema for the analysis results.
const AnalyzeApplicationDataOutputSchema = z.object({
  overallSuccessRate: z
    .number()
    .describe('The overall success rate across all applications.'),
  roleSuccessRates: z.record(
    z.string(),
    z.number()
  ).describe('Success rates broken down by role.'),
  companySuccessRates: z.record(
    z.string(),
    z.number()
  ).describe('Success rates broken down by company.'),
  optimalApplicationTiming: z
    .string()
    .describe('The optimal time to apply for jobs based on the data.'),
  personalizedRecommendations: z
    .string()
    .describe(
      'Personalized recommendations for improving the application strategy.'
    ),
});
export type AnalyzeApplicationDataOutput = z.infer<
  typeof AnalyzeApplicationDataOutputSchema
>;

// Exported function to trigger the flow
export async function analyzeApplicationData(
  input: AnalyzeApplicationDataInput
): Promise<AnalyzeApplicationDataOutput> {
  return analyzeApplicationDataFlow(input);
}

// Define the prompt for analyzing the job application data.
const analyzeApplicationDataPrompt = ai.definePrompt({
  name: 'analyzeApplicationDataPrompt',
  input: {schema: AnalyzeApplicationDataInputSchema},
  output: {schema: AnalyzeApplicationDataOutputSchema},
  prompt: `You are an AI job search strategist. Analyze the following job application data to identify trends and provide insights.

Job Application Data: {{{jobData}}}

Provide the following analysis:

- Overall Success Rate: The overall success rate across all applications.
- Role Success Rates: Success rates broken down by role.
- Company Success Rates: Success rates broken down by company.
- Optimal Application Timing: The optimal time to apply for jobs based on the data.
- Personalized Recommendations: Personalized recommendations for improving the application strategy.
`,
});

// Define the Genkit flow for analyzing job application data.
const analyzeApplicationDataFlow = ai.defineFlow(
  {
    name: 'analyzeApplicationDataFlow',
    inputSchema: AnalyzeApplicationDataInputSchema,
    outputSchema: AnalyzeApplicationDataOutputSchema,
  },
  async input => {
    const {output} = await analyzeApplicationDataPrompt(input);
    return output!;
  }
);
