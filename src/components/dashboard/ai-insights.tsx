'use client';

import { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAiInsights } from '@/lib/actions';
import type { JobApplication } from '@/lib/types';
import type { AnalyzeApplicationDataOutput } from '@/ai/flows/analyze-application-data';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type AiInsightsProps = {
  applications: JobApplication[];
};

// Helper function to safely convert different date types to a Date object
const toDate = (date: any): Date | null => {
    if (!date) return null;
    if (date instanceof Date) return date;
    // Handle Firestore Timestamp
    if (typeof date === 'object' && date !== null && typeof date.toDate === 'function') {
      return date.toDate();
    }
    // Handle string or number
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      return d;
    }
    return null;
  };

export default function AiInsights({ applications }: AiInsightsProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AnalyzeApplicationDataOutput | null>(null);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    setLoading(true);
    setInsights(null);

    // Convert complex objects (like Firestore Timestamps) to plain objects
    const plainApplications = applications.map(app => ({
      ...app,
      lastUpdated: toDate(app.lastUpdated)?.toISOString() ?? new Date().toISOString(),
    }));

    const result = await getAiInsights(plainApplications);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: result.error,
      });
    } else {
      setInsights(result.data!);
    }
    setLoading(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline">AI Insights</CardTitle>
        <CardDescription>Analyze your strategy and get recommendations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleAnalysis} disabled={loading || applications.length === 0} className="w-full">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Generate Insights
        </Button>

        {insights && (
          <div className="space-y-4 pt-4">
            <Alert>
              <AlertTitle className="font-semibold">Personalized Recommendations</AlertTitle>
              <AlertDescription>
                {insights.personalizedRecommendations}
              </AlertDescription>
            </Alert>
             <Card>
                <CardHeader className='pb-2'>
                    <CardTitle className='text-base'>Optimal Application Timing</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className='text-sm text-muted-foreground'>{insights.optimalApplicationTiming}</p>
                </CardContent>
             </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
