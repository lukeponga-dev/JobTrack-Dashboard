
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Briefcase, Bell, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-card shadow-sm border-b">
        <Link href="/" className="flex items-center justify-center">
          <span className="text-xl font-semibold text-primary">JobTrack</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl md:text-6xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Track Your Job Search Journey
              </h1>
              <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl">
                Keep all your job applications organized in one place. Never miss an interview or lose track of opportunities.
              </p>
              <Button variant="secondary" asChild>
                <Link href="/signup">Start Tracking Applications</Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center p-4 space-y-2 text-center">
                <div className="p-3 rounded-full bg-accent">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Track Applications</h3>
                <p className="text-sm text-muted-foreground">
                  Organize job applications with details like company, role, and status.
                </p>
              </div>
              <div className="flex flex-col items-center p-4 space-y-2 text-center">
                <div className="p-3 rounded-full bg-accent">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Interview Reminders</h3>
                <p className="text-sm text-muted-foreground">
                  Set reminders for interviews and follow-ups.
                </p>
              </div>
              <div className="flex flex-col items-center p-4 space-y-2 text-center">
                <div className="p-3 rounded-full bg-accent">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Visual Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  View charts and metrics to track your progress.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center py-6 bg-card border-t">
        <nav className="flex gap-4 sm:gap-6">
          <Link href="/privacy" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Terms of Service
          </Link>
        </nav>
      </footer>
    </div>
  );
}
