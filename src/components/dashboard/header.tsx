'use client';

import { useState } from 'react';
import { FileDown, FileUp, LogOut, PanelLeft } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import { format } from 'date-fns';
import { collection, serverTimestamp } from 'firebase/firestore';
import React from 'react';
import Link from 'next/link';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleMobileNavClick = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        {/* Mobile Nav */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
                <nav className="grid gap-6 text-lg font-medium">
                    <Link
                        href="/dashboard"
                        className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
                        <span className="sr-only">JobTrack</span>
                    </Link>
                    <Link href="#" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground" onClick={() => handleMobileNavClick(() => fileInputRef.current?.click())}>
                        <FileUp className="h-5 w-5" />
                        Import
                    </Link>
                    <Link href="#" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground" onClick={() => handleMobileNavClick(handleExport)}>
                        <FileDown className="h-5 w-5" />
                        Export
                    </Link>
                </nav>
            </SheetContent>
        </Sheet>

        {/* Desktop Nav */}
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
          <Logo className="h-6 w-6 text-primary" />
          <span className="font-headline">JobTrack</span>
        </Link>
        
        <div className="ml-auto flex items-center gap-2">
            <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleImport}
                className="hidden"
            />
            <Button size="sm" variant="outline" className="h-8 gap-1 hidden sm:flex" onClick={() => fileInputRef.current?.click()}>
              <FileUp className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Import</span>
            </Button>
            <Button size="sm" variant="outline" className="h-8 gap-1 hidden sm:flex" onClick={handleExport}>
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
