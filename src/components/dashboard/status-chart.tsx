'use client';

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { JobApplication, JobStatus } from '@/lib/types';
import { JOB_STATUSES } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

const chartConfig = {
  count: {
    label: 'Count',
  },
  ...Object.fromEntries(
    JOB_STATUSES.map((status, index) => [
      status,
      {
        label: status,
        color: `hsl(var(--chart-${index + 1}))`,
      },
    ])
  ),
} satisfies ChartConfig;

type StatusChartProps = {
  applications: JobApplication[];
};

export default function StatusChart({ applications }: StatusChartProps) {
  const chartData = useMemo(() => {
    const statusCounts = applications.reduce(
      (acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      },
      {} as Record<JobStatus, number>
    );

    return JOB_STATUSES.map((status) => ({
      status,
      count: statusCounts[status] || 0,
      fill: `var(--color-${status})`,
    }));
  }, [applications]);
  
  if (!applications) {
    return <Skeleton className="h-64" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Applications by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
              <XAxis
                dataKey="status"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
                style={{ fontSize: '12px' }}
              />
              <YAxis style={{ fontSize: '12px' }} />
              <ChartTooltip 
                cursor={false} 
                content={<ChartTooltipContent indicator="dot" style={{ fontSize: '12px' }} />} 
              />
              <Bar dataKey="count" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
