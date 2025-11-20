'use server';

import {
  collection,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { analyzeApplicationData } from '@/ai/flows/analyze-application-data';
import type { JobApplication } from '@/lib/types';
import { getFirebaseAdmin } from '@/firebase/server-init';
import { addDoc, updateDoc, deleteDoc } from 'firebase-admin/firestore';

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

// This is a server action, so we can't get the user from the client.
// We would normally get the user from the session or a token.
// For now, we'll hardcode the user for demonstration purposes.
// In a real app, this should be replaced with actual authentication logic.
const FAKE_USER_ID = 'user123';

export async function addApplication(
  applicationData: Omit<JobApplication, 'id' | 'userId' | 'lastUpdated'>
) {
  const { firestore } = getFirebaseAdmin();
  const userId = FAKE_USER_ID; // Replace with real user logic
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
    // We are using the admin SDK here, so we use its `addDoc`
    const ref = await addDoc(jobAppsCollection, data);
    return { success: true, id: ref.id };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateApplication(
  applicationId: string,
  applicationData: Omit<JobApplication, 'id' | 'userId' | 'lastUpdated'>
) {
  const { firestore } = getFirebaseAdmin();
  const userId = FAKE_USER_ID; // Replace with real user logic
  if (!firestore) {
    return { error: 'Database not available.' };
  }
  try {
    const data = {
      ...applicationData,
      lastUpdated: serverTimestamp(),
    };
    const appDocRef = doc(firestore, 'users', userId, 'jobApplications', applicationId);
    await updateDoc(appDocRef, data);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteApplication(applicationId: string) {
    const { firestore } = getFirebaseAdmin();
    const userId = FAKE_USER_ID; // Replace with real user logic
    if (!firestore) {
      return { error: 'Database not available.' };
    }
    try {
      const appDocRef = doc(firestore, 'users', userId, 'jobApplications', applicationId);
      await deleteDoc(appDocRef);
      return { success: true };
    } catch (error: any) {
      return { error: 'Could not delete application. Please try again.' };
    }
  }