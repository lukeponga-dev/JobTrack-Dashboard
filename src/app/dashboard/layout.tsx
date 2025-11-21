'use client';

import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/auth-guard';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';
import { Briefcase, FileText, ScanText, StickyNote, Home, ExternalLink } from 'lucide-react';
import Header from '@/components/dashboard/header';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';

function DashboardSidebar() {
    const { user } = useUser();
    const pathname = usePathname();
    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2">
                    <Briefcase className="h-6 w-6 text-primary" />
                    <span className="font-headline text-lg">JobTrack</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === '/dashboard'}>
                            <Link href="/dashboard">
                                <Home />
                                <span>Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === '/dashboard/resume-tailor'}>
                            <Link href="/dashboard/resume-tailor">
                                <ScanText />
                                <span>Resume Tailor</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === '/dashboard/cv-writer'}>
                            <Link href="/dashboard/cv-writer">
                                <FileText />
                                <span>CV Writer</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === '/dashboard/cover-letter-writer'}>
                            <Link href="/dashboard/cover-letter-writer">
                                <StickyNote />
                                <span>Cover Letter Writer</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/" target="_blank">
                                <ExternalLink />
                                <span>View Home Page</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

function DashboardMain({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();
    return (
        <div 
            data-collapsed={isCollapsed}
            className={cn(
                "flex flex-col sm:gap-4 sm:py-4 transition-all duration-300",
                "sm:pl-[--sidebar-width-collapsed] data-[collapsed=false]:sm:pl-[--sidebar-width]"
            )}
        >
            {children}
        </div>
    )
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
        <SidebarProvider>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <DashboardSidebar />
                <DashboardMain>
                    {children}
                </DashboardMain>
            </div>
        </SidebarProvider>
    </AuthGuard>
  );
}
