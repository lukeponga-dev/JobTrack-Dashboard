'use server';

import {
  collection,
  doc,
  serverTimestamp,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { analyzeApplicationData } from '@/ai/flows/analyze-application-data';
import type { JobApplication } from '@/lib/types';
import { getFirebaseAdmin } from '@/firebase/server-init';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';

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
  const { firestore } = getFirebaseAdmin();
  if (!firestore) {
    return { error: 'Database not available.' };
  }
  try {
    const data = {
      ...applicationData,
      lastUpdated: serverTimestamp(),
      userId: userId,
    };
    const jobAppsCollection = collection(firestore, 'users', userId, 'jobApplications');
    addDocumentNonBlocking(jobAppsCollection, data);
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
  const { firestore } = getFirebaseAdmin();
  if (!firestore) {
    return { error: 'Database not available.' };
  }
  try {
    const data = {
      ...applicationData,
      lastUpdated: serverTimestamp(),
    };
    const appDocRef = doc(firestore, 'users', userId, 'jobApplications', applicationId);
    updateDocumentNonBlocking(appDocRef, data);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteApplication(applicationId: string, userId: string) {
    const { firestore } = getFirebaseAdmin();
    if (!firestore) {
      return { error: 'Database not available.' };
    }
    try {
      const appDocRef = doc(firestore, 'users', userId, 'jobApplications', applicationId);
      deleteDocumentNonBlocking(appDocRef);
      return { success: true };
    } catch (error: any) {
      return { error: 'Could not delete application. Please try again.' };
    }
  }