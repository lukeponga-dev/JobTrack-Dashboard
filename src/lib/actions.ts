'use server';

import { analyzeApplicationData } from '@/ai/flows/analyze-application-data';
import type { JobApplication } from '@/lib/types';

export async function getAiInsights(applications: JobApplication[]) {
  if (!applications || applications.length === 0) {
    return {
      error: 'No application data available to analyze.',
    };
  }

  // Map JobApplication to the format expected by the AI flow
  const analysisInput = applications.map(app => ({
    company: app.company,
    role: app.role,
    status: app.status,
    dateApplied: app.dateApplied,
  }));

  try {
    // Pass the stringified data to the flow
    const analysis = await analyzeApplicationData({
      jobData: JSON.stringify(analysisInput),
    });
    return { data: analysis };
  } catch (e) {
    console.error(e);
    return {
      error: 'Failed to generate AI insights. Please try again later.',
    };
  }
}
