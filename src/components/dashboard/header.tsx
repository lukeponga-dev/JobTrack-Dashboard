'use client';

import { FileDown, FileUp, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import { format } from 'date-fns';
import { collection, serverTimestamp } from 'firebase/firestore';
import React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/icons';
import { useAuth, useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import type { JobApplication } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


type HeaderProps = {
    applications: JobApplication[];
}

export default function Header({ applications }: HeaderProps) {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleExport = () => {
    if (applications.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'No applications to export.',
      });
      return;
    }
    const csv = Papa.unparse(applications);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `job_applications_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const importedApps = results.data as any[];
            const jobAppsCollection = collection(firestore, 'users', user.uid, 'jobApplications');

            for (const app of importedApps) {
              const appData = {
                ...app,
                dateApplied: app.dateApplied || format(new Date(), 'yyyy-MM-dd'),
                lastUpdated: serverTimestamp(),
                userId: user.uid,
              };
              addDocumentNonBlocking(jobAppsCollection, appData)
            }
            toast({
              title: 'Import Successful',
              description: `${importedApps.length} applications imported.`,
            });
          } catch (error) {
            toast({
              variant: 'destructive',
              title: 'Import Failed',
              description: 'Please check the CSV file format and try again.',
            });
          }
        },
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Logo className="h-6 w-6 text-primary" />
          <span className="font-headline">Job Pilot</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleImport}
                className="hidden"
            />
            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => fileInputRef.current?.click()}>
              <FileUp className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Import</span>
            </Button>
            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
              <FileDown className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
            </Button>
            <ThemeToggle />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                <Avatar>
                    <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'User'} />
                    <AvatarFallback>{user?.displayName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.displayName ?? user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </header>
  );
}
