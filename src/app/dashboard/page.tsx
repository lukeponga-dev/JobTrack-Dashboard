'use client';

import { useState, useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { JobApplication, JobStatus, Reminder } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JOB_STATUSES } from '@/lib/types';
import ApplicationSheet from '@/components/dashboard/application-sheet';
import SummaryCards from '@/components/dashboard/summary-cards';
import ApplicationsTable from '@/components/dashboard/applications-table';
import StatusChart from '@/components/dashboard/status-chart';
import Reminders from '@/components/dashboard/reminders';
import AiInsights from '@/components/dashboard/ai-insights';
import Header from '@/components/dashboard/header';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');

  const jobsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'jobApplications'),
      orderBy('lastUpdated', 'desc')
    );
  }, [firestore, user]);

  const remindersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, 'users', user.uid, 'reminders'),
        orderBy('date', 'asc')
      );
  }, [firestore, user]);

  const { data: applications, isLoading: isLoadingApplications } = useCollection<JobApplication>(jobsQuery);
  const { data: reminders, isLoading: isLoadingReminders } = useCollection<Reminder>(remindersQuery);
  
  const loading = isLoadingApplications || isLoadingReminders;

  const handleAddApplication = () => {
    setSelectedApplication(null);
    setIsSheetOpen(true);
  };

  const handleEditApplication = (app: JobApplication) => {
    setSelectedApplication(app);
    setIsSheetOpen(true);
  };

  const filteredApplications = useMemo(() => {
    const apps = applications || [];
    if (statusFilter === 'all') return apps;
    return apps.filter(app => app.status === statusFilter);
  }, [applications, statusFilter]);

  return (
    <ApplicationSheet
      isOpen={isSheetOpen}
      setIsOpen={setIsSheetOpen}
      application={selectedApplication}
    >
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <Header applications={applications || []} />
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
            <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
              <SummaryCards applications={applications || []} />
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-headline font-semibold">Applications</h2>
                <div className="ml-auto flex items-center gap-2">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {JOB_STATUSES.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                  <SheetTrigger asChild>
                    <Button size="sm" className="h-8 gap-1" onClick={handleAddApplication}>
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add Application
                      </span>
                    </Button>
                  </SheetTrigger>
                </div>
              </div>
              {loading ? (
                 <Skeleton className="h-96 w-full" />
              ) : (
                <ApplicationsTable applications={filteredApplications} onEdit={handleEditApplication} />
              )}
            </div>
            <div className="grid auto-rows-max items-start gap-4 md:gap-8">
              <StatusChart applications={applications || []} />
              <Reminders reminders={reminders || []} applications={applications || []}/>
              <AiInsights applications={applications || []} />
            </div>
          </main>
        </div>
      </div>
    </ApplicationSheet>
  );
}
