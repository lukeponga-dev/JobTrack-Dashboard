'use client';

import { useState, useMemo } from 'react';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import type { JobApplication, JobStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { JOB_STATUSES } from '@/lib/types';
import ApplicationForm from '@/components/dashboard/application-sheet';
import SummaryCards from '@/components/dashboard/summary-cards';
import ApplicationsTable from '@/components/dashboard/applications-table';
import StatusChart from '@/components/dashboard/status-chart';
import Reminders from '@/components/dashboard/reminders';
import AiInsights from '@/components/dashboard/ai-insights';
import Header from '@/components/dashboard/header';
import { PlusCircle, Trash, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Reminder } from '@/lib/types';
import AutoFromEmail from '@/components/dashboard/auto-from-email';
import type { PartialJobApplication } from '@/lib/types';


export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAutoEmailOpen, setIsAutoEmailOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [prefilledData, setPrefilledData] = useState<PartialJobApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const jobsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'jobApplications'),
      orderBy('lastUpdated', 'desc')
    );
  }, [firestore, user]);
  const { data: applications, isLoading: isLoadingApplications } = useCollection<JobApplication>(jobsQuery);
  
  const remindersQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, 'users', user.uid, 'reminders'),
        orderBy('date', 'asc')
      );
  }, [firestore, user]);

  const { data: reminders, isLoading: isLoadingReminders } = useCollection<Reminder>(remindersQuery);
  
  const loading = isLoadingApplications || isLoadingReminders;

  const handleAddApplication = () => {
    setSelectedApplication(null);
    setPrefilledData(null);
    setIsSheetOpen(true);
  };

  const handleEditApplication = (app: JobApplication) => {
    setSelectedApplication(app);
    setPrefilledData(null);
    setIsSheetOpen(true);
  };

  const handleCreateFromEmail = (data: PartialJobApplication) => {
    setPrefilledData(data);
    setSelectedApplication(null);
    setIsAutoEmailOpen(false);
    setIsSheetOpen(true);
  };
  
  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setSelectedApplication(null);
    setPrefilledData(null);
  }

  const filteredApplications = useMemo(() => {
    const apps = applications || [];
    if (statusFilter === 'all') return apps;
    return apps.filter(app => app.status === statusFilter);
  }, [applications, statusFilter]);

  const handleBulkDelete = () => {
    if (!user || !firestore || selectedIds.length === 0) return;

    selectedIds.forEach(id => {
        const appDocRef = doc(firestore, 'users', user.uid, 'jobApplications', id);
        deleteDocumentNonBlocking(appDocRef);
    });

    toast({
        title: 'Applications Deleted',
        description: `${selectedIds.length} job applications have been deleted.`,
    });
    setSelectedIds([]);
  }

  return (
    <>
      <Header applications={applications || []} />
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <SummaryCards applications={applications || []} />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-headline font-semibold">Applications</h2>
              {selectedIds.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="h-8 gap-1">
                      <Trash className="h-3.5 w-3.5" />
                      Delete ({selectedIds.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete {selectedIds.length} selected applications. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2 mt-4 sm:mt-0">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {JOB_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <AutoFromEmail open={isAutoEmailOpen} onOpenChange={setIsAutoEmailOpen} onSave={handleCreateFromEmail} />
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button size="sm" className="h-8 gap-1" onClick={handleAddApplication}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Add Application
                    </span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="sm:max-w-lg">
                  <SheetHeader>
                    <SheetTitle className="font-headline">
                      {selectedApplication ? 'Edit Application' : 'Add Application'}
                    </SheetTitle>
                    <SheetDescription>
                      {selectedApplication ? 'Update the details of your job application.' : 'Track a new job application.'}
                    </SheetDescription>
                  </SheetHeader>
                  <ApplicationForm 
                    application={selectedApplication} 
                    prefilledData={prefilledData}
                    onSave={handleSheetClose} 
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <ApplicationsTable
              applications={filteredApplications}
              onEdit={handleEditApplication}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              <StatusChart applications={applications || []} />
              <Reminders reminders={reminders || []} applications={applications || []} />
              <AiInsights applications={applications || []} />
          </div>
      </main>
    </>
  );
}
