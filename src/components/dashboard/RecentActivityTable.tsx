import Link from "next/link";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DashboardStats } from "@/lib/dashboard/mock-data";

type RecentActivityTableProps = {
  rows: DashboardStats["recentActivity"];
};

function initials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatRelativeTime(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const now = Date.now();
  const diffMs = Math.max(0, now - then);
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function RecentActivityTable({ rows }: RecentActivityTableProps) {
  return (
    <Card className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest py-0 ring-0">
      <CardHeader className="flex flex-row items-center justify-between border-b border-outline-variant bg-surface-container-low/30 px-6 py-6">
        <CardTitle className="text-headline-sm font-display text-on-surface">
          Recent Activity
        </CardTitle>
        <Link
          href="/students"
          className="text-body-sm font-bold text-primary underline-offset-4 hover:underline"
        >
          View All Students
        </Link>
      </CardHeader>
      <CardContent className="px-0">
        {rows.length === 0 ? (
          <Empty className="min-h-48 rounded-none border-0 px-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UsersThreeIcon />
              </EmptyMedia>
              <EmptyTitle className="text-on-surface">No recent activity</EmptyTitle>
              <EmptyDescription>
                Subscription and support events will show up here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table aria-label="Recent subscription activity">
            <TableHeader>
              <TableRow className="border-outline-variant bg-surface-container-low/50 hover:bg-surface-container-low/50">
                <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                  Student Name
                </TableHead>
                <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                  Action
                </TableHead>
                <TableHead className="px-6 py-4 text-right text-label-md uppercase tracking-wider text-on-surface-variant">
                  When
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-12 border-outline-variant hover:bg-surface-container-low"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 rounded-full">
                        <AvatarFallback className="rounded-full bg-primary-fixed text-xs font-bold text-primary">
                          {initials(row.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-on-surface">
                        {row.studentName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-on-surface-variant">
                    {row.action}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right font-mono text-label-md text-on-surface-variant">
                    {formatRelativeTime(row.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
