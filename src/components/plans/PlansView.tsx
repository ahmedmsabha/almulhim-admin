"use client";

import { useEffect, useState } from "react";
import { PlusIcon } from "@phosphor-icons/react";

import { PageHeader } from "@/components/layout/PageHeader";
import { PlanFormDialog } from "@/components/plans/PlanFormDialog";
import { PlansTable } from "@/components/plans/PlansTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminPlan, AdminPlanListResponse } from "@/lib/plans/types";

type PlansViewProps = {
  data: AdminPlanListResponse;
};

export function PlansView({ data }: PlansViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  /** Edit by id so the dialog always sees the live list row (e.g. after a Switch toggle). */
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingPlan =
    editingId === null
      ? null
      : (data.plans.find((plan) => plan.id === editingId) ?? null);

  useEffect(() => {
    if (dialogOpen && editingId && !editingPlan) {
      setDialogOpen(false);
      setEditingId(null);
    }
  }, [dialogOpen, editingId, editingPlan]);

  function openCreate() {
    setEditingId(null);
    setDialogOpen(true);
  }

  function openEdit(plan: AdminPlan) {
    setEditingId(plan.id);
    setDialogOpen(true);
  }

  function handleOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) setEditingId(null);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          eyebrow="Plans"
          title="Subscription Plans"
          description="Manage pricing tiers students can subscribe to."
          className="mb-0"
        />
        <Button type="button" onClick={openCreate}>
          <PlusIcon data-icon="inline-start" />
          Add New Plan
        </Button>
      </div>

      <Card className="gap-0 overflow-hidden border-outline-variant bg-surface-container-lowest py-0 shadow-none">
        <CardHeader className="border-b border-outline-variant px-6 py-4">
          <CardTitle className="font-body-lg text-body-lg font-semibold text-on-surface">
            All Subscription Tiers
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <PlansTable plans={data.plans} onEdit={openEdit} />
        </CardContent>
      </Card>

      <PlanFormDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        plan={editingPlan}
      />
    </div>
  );
}
