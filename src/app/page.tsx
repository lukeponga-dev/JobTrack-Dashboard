'use client';

import Link from 'next/link';
import { Briefcase, Bell, BarChart3, Shield, Users, Zap } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 dark:border-gray-800">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">Job Pilot</span>
                    </div>
                    <nav className="flex items-center space-x-4">
                        <Link
                            href="/login"
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Get Started
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                    Track Your Job Search
                    <br />
                    <span className="text-blue-600 dark:text-blue-400">Land Your Dream Job</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                    Stay organized and never miss an opportunity. Job Pilot helps you manage applications,
                    track interviews, and analyze your job search progress—all in one place.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/signup"
                        className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                    >
                        Start Tracking Free
                    </Link>
                    <Link
                        href="/login"
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-400 transition-colors font-medium text-lg"
                    >
                        Sign In
                    </Link>
                </div>
            </section>

            {/* Features Grid */}
            <section className="container mx-auto px-4 py-20">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                    Everything You Need to Succeed
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                        <div className="bg-blue-100 dark:bg-blue-900 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                            <Briefcase className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                            Track Applications
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Keep all your job applications organized in one place. Track status, dates, and
                            important details for every opportunity.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                        <div className="bg-green-100 dark:bg-green-900 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                            <Bell className="h-7 w-7 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                            Interview Reminders
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Never miss an interview again. Set reminders for phone screens, interviews, and
                            follow-ups to stay on top of your schedule.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                        <div className="bg-purple-100 dark:bg-purple-900 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                            <BarChart3 className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                            Visual Analytics
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Understand your job search with clear charts and statistics. See your progress and
                            identify areas for improvement.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-blue-600 dark:bg-blue-700 py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 text-center text-white">
                        <div>
                            <div className="flex items-center justify-center mb-2">
                                <Users className="h-8 w-8 mr-2" />
                                <div className="text-4xl font-bold">100%</div>
                            </div>
                            <p className="text-blue-100">NZ Job Market Coverage</p>
                        </div>
                        <div>
                            <div className="flex items-center justify-center mb-2">
                                <Zap className="h-8 w-8 mr-2" />
                                <div className="text-4xl font-bold">Free</div>
                            </div>
                            <p className="text-blue-100">Forever Free Service</p>
                        </div>
                        <div>
                            <div className="flex items-center justify-center mb-2">
                                <Shield className="h-8 w-8 mr-2" />
                                <div className="text-4xl font-bold">Secure</div>
                            </div>
                            <p className="text-blue-100">Your Data is Protected</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                    Ready to Take Control of Your Job Search?
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                    Join Job Pilot today and start tracking your applications like a pro.
                </p>
                <Link
                    href="/signup"
                    className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                >
                    Get Started for Free
                </Link>
            </section>

            {/* Footer */}
            <footer className="border-t bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            <span className="text-lg font-bold text-gray-900 dark:text-white">Job Pilot</span>
                        </div>
                        <nav className="flex space-x-6 text-sm text-gray-600 dark:text-gray-400">
                            <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                                Terms of Service
                            </Link>
                        </nav>
                    </div>
                    <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} Job Pilot. Made with ❤️ in New Zealand.
                    </div>
                </div>
            </footer>
        </div>
    );
}
