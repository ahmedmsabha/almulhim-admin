'use client';

import { useState } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppTopbar } from '@/components/layout/AppTopbar';

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({
  children,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-inverse-surface/25 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <AppSidebar
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-h-screen flex-col lg:pl-sidebar rtl:lg:pl-0 rtl:lg:pr-sidebar">
        <AppTopbar
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-4 py-6 md:px-container md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
