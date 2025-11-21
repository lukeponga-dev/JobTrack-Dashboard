'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { JobApplication, JobStatus } from '@/lib/types';
import { MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { useMobile } from '@/hooks/use-mobile';
import { Checkbox } from '../ui/checkbox';

type ApplicationsTableProps = {
  applications: JobApplication[];
  onEdit: (application: JobApplication) => void;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
};

const statusColors: Record<JobStatus, string> = {
    Applied: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    Interviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    Offer: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    Viewed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    'Not selected': 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
    Expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    'Unlikely to progress': 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
};

// Helper function to safely convert different date types to a Date object
const toDate = (date: any): Date | null => {
    if (!date) return null;
    if (date instanceof Date) return date;
    if (typeof date === 'object' && date !== null && typeof date.toDate === 'function') {
      return date.toDate();
    }
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      return d;
    }
    return null;
  };

  const EmptyState = () => (
    <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <h3 className="text-lg font-semibold">No Applications Found</h3>
            <p className="text-sm text-muted-foreground">Start by adding your first job application.</p>
        </CardContent>
    </Card>
);


const DesktopView = ({ applications, onEdit, selectedIds, setSelectedIds }: ApplicationsTableProps) => (
    <Card>
        <CardContent className='p-0'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.length === applications.length && applications.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedIds(applications.map(app => app.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => {
                const lastUpdatedDate = toDate(app.lastUpdated);
                return (
                    <TableRow key={app.id} data-state={selectedIds.includes(app.id) && "selected"}>
                        <TableCell className="py-2">
                           <Checkbox
                            checked={selectedIds.includes(app.id)}
                            onCheckedChange={(checked) => {
                              setSelectedIds(
                                checked
                                  ? [...selectedIds, app.id]
                                  : selectedIds.filter((id) => id !== app.id)
                              );
                            }}
                            aria-label="Select row"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell className="py-2 cursor-pointer" onClick={() => onEdit(app)}>
                            <div className="font-medium">{app.company}</div>
                        </TableCell>
                        <TableCell className="py-2 cursor-pointer" onClick={() => onEdit(app)}>{app.role}</TableCell>
                        <TableCell className="py-2 cursor-pointer" onClick={() => onEdit(app)}>
                            <Badge className={`border-none ${statusColors[app.status]}`} variant="outline">
                                {app.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="py-2 cursor-pointer" onClick={() => onEdit(app)}>
                            {lastUpdatedDate ? formatDistanceToNow(lastUpdatedDate, { addSuffix: true }) : 'N/A'}
                        </TableCell>
                        <TableCell className="py-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenuItem onSelect={() => onEdit(app)}>Edit</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
);

const MobileView = ({ applications, onEdit, selectedIds, setSelectedIds }: ApplicationsTableProps) => (
    <div className="grid gap-4">
      {applications.map((app) => {
        const lastUpdatedDate = toDate(app.lastUpdated);
        return (
          <Card key={app.id} onClick={() => onEdit(app)} className="cursor-pointer data-[state=selected]:ring-2 data-[state=selected]:ring-primary" data-state={selectedIds.includes(app.id) ? "selected" : "unselected"}>
            <CardContent className="p-4 flex items-start gap-4">
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.includes(app.id)}
                  onCheckedChange={(checked) => {
                    setSelectedIds(
                      checked
                        ? [...selectedIds, app.id]
                        : selectedIds.filter((id) => id !== app.id)
                    );
                  }}
                  aria-label="Select row"
                  className="mt-1"
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground truncate">{app.company}</p>
                    <Badge className={`border-none text-xs ${statusColors[app.status]}`} variant="outline">
                        {app.status}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{app.role}</p>
                 <p className="text-xs text-muted-foreground pt-1">
                    {lastUpdatedDate ? `Updated ${formatDistanceToNow(lastUpdatedDate, { addSuffix: true })}` : 'N/A'}
                </p>
              </div>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onSelect={() => onEdit(app)}>Edit</DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

export default function ApplicationsTable(props: ApplicationsTableProps) {
  const isMobile = useMobile();

  // Deselect applications that are no longer in the filtered list
  React.useEffect(() => {
    const currentIds = new Set(props.applications.map(app => app.id));
    props.setSelectedIds(ids => ids.filter(id => currentIds.has(id)));
  }, [props.applications, props.setSelectedIds]);
  
  if (props.applications.length === 0) {
    return <EmptyState />;
  }

  return isMobile 
    ? <MobileView {...props} /> 
    : <DesktopView {...props} />;
}
