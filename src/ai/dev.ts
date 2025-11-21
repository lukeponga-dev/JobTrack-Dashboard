import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-application-data.ts';
import '@/ai/flows/get-application-recommendations.ts';
import '@/ai/flows/cv-writer.ts';
import '@/ai/flows/cover-letter-writer.ts';
