'use client';

import { useState } from 'react';
import { FileDown, FileUp, LogOut, Database } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import { format } from 'date-fns';
import { collection, serverTimestamp } from 'firebase/firestore';
import React from 'react';
import * as XLSX from 'xlsx';

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
import { useAuth, useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import type { JobApplication } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { SidebarTrigger } from '../ui/sidebar';
import { seedApplications } from '@/lib/seed-data';


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

  const handleSeedData = async () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to seed data.',
      });
      return;
    }

    try {
        const jobAppsCollection = collection(firestore, 'users', user.uid, 'jobApplications');

        for (const app of seedApplications) {
          const appData = {
            ...app,
            lastUpdated: serverTimestamp(),
            userId: user.uid,
          };
          addDocumentNonBlocking(jobAppsCollection, appData);
        }
        toast({
          title: 'Data Seeding Successful',
          description: `${seedApplications.length} sample applications have been added to your account.`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Data Seeding Failed',
          description: 'An error occurred while trying to add the sample data.',
        });
      }
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
  
  const processAndImportData = async (data: any[]) => {
    if (!user || !firestore) return;
    try {
        const jobAppsCollection = collection(firestore, 'users', user.uid, 'jobApplications');

        for (const app of data) {
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
          description: `${data.length} applications imported.`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: 'Please check the file format and try again.',
        });
      }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    reader.onload = (e) => {
        const content = e.target?.result;
        if(!content) return;

        if (fileExtension === 'csv') {
            Papa.parse(content as string, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => processAndImportData(results.data),
            });
        } else if (fileExtension === 'json') {
            try {
                const data = JSON.parse(content as string);
                processAndImportData(Array.isArray(data) ? data : [data]);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Import Failed', description: 'Invalid JSON file.' });
            }
        } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            try {
                const workbook = XLSX.read(content, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet);
                processAndImportData(data);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Import Failed', description: 'Could not parse Excel file.' });
            }
        } else {
            toast({ variant: 'destructive', title: 'Unsupported File Type', description: 'Please upload a CSV, JSON, or Excel file.' });
        }
    };
    
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        reader.readAsBinaryString(file);
    } else {
        reader.readAsText(file);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <SidebarTrigger className="sm:hidden" />
        
        <div className="ml-auto flex items-center gap-2">
            <input
                type="file"
                accept=".csv, .json, .xls, .xlsx"
                ref={fileInputRef}
                onChange={handleImport}
                className="hidden"
            />
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                <FileUp className="h-4 w-4" />
                <span className="sr-only">Import</span>
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={handleExport}>
                <FileDown className="h-4 w-4" />
                <span className="sr-only">Export</span>
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
                <DropdownMenuItem onClick={handleSeedData}>
                    <Database className="mr-2 h-4 w-4" />
                    <span>Seed Data</span>
                </DropdownMenuItem>
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
