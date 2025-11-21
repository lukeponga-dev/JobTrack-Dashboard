'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-application-data.ts';
import '@/ai/flows/get-application-recommendations.ts';
import '@/ai/flows/cv-writer.ts';
import '@/ai/flows/cover-letter-writer.ts';
import '@/ai/flows/resume-tailor.ts';
import '@/ai/flows/extract-from-email.ts';
