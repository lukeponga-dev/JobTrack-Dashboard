
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, BarChart, Bell } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-white shadow-sm">
        <Link href="#" className="flex items-center justify-center">
          <span className="text-xl font-semibold text-blue-600">JobTrack</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
          >
            Sign Up
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-blue-600 text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Streamline Your Job Application Process
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
                JobTrack helps you keep track of your job applications, get timely reminders, and analyze your job search performance.
              </p>
              <Link href="/signup">
                <Button className="bg-white text-blue-600 hover:bg-gray-100">Get Started</Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center p-4 space-y-2 text-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Track Applications</h3>
                <p className="text-sm text-gray-500">
                  Keep all your job applications in one place. Never lose track of an opportunity.
                </p>
              </div>
              <div className="flex flex-col items-center p-4 space-y-2 text-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Reminders</h3>
                <p className="text-sm text-gray-500">
                  Get timely reminders for follow-ups, interviews, and deadlines.
                </p>
              </div>
              <div className="flex flex-col items-center p-4 space-y-2 text-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <BarChart className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Analytics</h3>
                <p className="text-sm text-gray-500">
                  Visualize your job search progress with insightful analytics.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Trusted by Thousands of Job Seekers</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join a growing community of users who have successfully managed their job search with JobTrack.
              </p>
            </div>
            <div className="grid gap-6 mt-8 sm:grid-cols-3">
              <div className="p-4 text-center">
                <h3 className="text-4xl font-bold text-blue-600">10k+</h3>
                <p className="text-sm text-gray-500">Active Users</p>
              </div>
              <div className="p-4 text-center">
                <h3 className="text-4xl font-bold text-blue-600">50k+</h3>
                <p className="text-sm text-gray-500">Applications Tracked</p>
              </div>
              <div className="p-4 text-center">
                <h3 className="text-4xl font-bold text-blue-600">95%</h3>
                <p className="text-sm text-gray-500">User Satisfaction</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center py-6 bg-white shadow-sm">
        <nav className="flex gap-4 sm:gap-6">
          <Link href="/privacy" className="text-xs hover:underline underline-offset-4">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
        </nav>
      </footer>
    </div>
  );
}
