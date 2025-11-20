'use server';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { analyzeApplicationData } from '@/ai/flows/analyze-application-data';
import type { JobApplication } from '@/lib/types';
import { getFirestoreDb } from './firebase';

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
    const analysis = await analyzeApplicationData(analysisInput);
    return { data: analysis };
  } catch (e) {
    console.error(e);
    return {
      error: 'Failed to generate AI insights. Please try again later.',
    };
  }
}

export async function addApplication(
  applicationData: Omit<JobApplication, 'id' | 'userId' | 'lastUpdated'>,
  userId: string
) {
  const db = getFirestoreDb();
  if (!db) {
    return { error: 'Database not available.' };
  }
  try {
    const data = {
      ...applicationData,
      lastUpdated: serverTimestamp(),
      userId: userId,
    };
    await addDoc(collection(db, 'jobApplications'), data);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateApplication(
  applicationId: string,
  applicationData: Omit<JobApplication, 'id' | 'userId' | 'lastUpdated'>,
  userId: string
) {
  const db = getFirestoreDb();
  if (!db) {
    return { error: 'Database not available.' };
  }
  try {
    const data = {
      ...applicationData,
      lastUpdated: serverTimestamp(),
      userId: userId,
    };
    await updateDoc(doc(db, 'jobApplications', applicationId), data);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteApplication(applicationId: string) {
  const db = getFirestoreDb();
  if (!db) {
    return { error: 'Database not available.' };
  }
  try {
    await deleteDoc(doc(db, 'jobApplications', applicationId));
    return { success: true };
  } catch (error: any) {
    return { error: 'Could not delete application. Please try again.' };
  }
}
