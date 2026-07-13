"use client";

import { useEffect, useState } from "react";
import { PencilSimpleIcon, StackIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IlsFxRates } from "@/lib/plans/fetch-fx-rates";
import { formatPlanPriceTriple } from "@/lib/plans/money";
import type { AdminPlan } from "@/lib/plans/types";
import { useIlsFxRates } from "@/lib/plans/use-fx-rates";
import { useUpdatePlan } from "@/lib/plans/use-plan-mutations";
import { cn } from "@/lib/utils";

type PlansTableProps = {
  plans: AdminPlan[];
  onEdit: (plan: AdminPlan) => void;
};

function ActiveToggle({ plan }: { plan: AdminPlan }) {
  const update = useUpdatePlan();
  const [optimistic, setOptimistic] = useState(plan.isActive);
  const checked = update.isPending ? optimistic : plan.isActive;

  useEffect(() => {
    setOptimistic(plan.isActive);
  }, [plan.isActive]);

  return (
    <Switch
      checked={checked}
      disabled={update.isPending}
      aria-label={`${plan.isActive ? "Disable" : "Enable"} ${plan.name}`}
      onCheckedChange={(next) => {
        setOptimistic(next);
        update.mutate(
          { planId: plan.id, body: { isActive: next } },
          {
            onError: () => {
              setOptimistic(plan.isActive);
            },
          },
        );
      }}
    />
  );
}

function PlanPriceCell({
  plan,
  fx,
}: {
  plan: AdminPlan;
  fx: IlsFxRates | undefined;
}) {
  const rows = formatPlanPriceTriple(plan.priceAmount, plan.currency, fx);

  return (
    <div className="flex flex-col gap-1">
      {rows.map((row) => (
        <div key={row.code} className="flex items-baseline gap-2">
          <span className="w-10 shrink-0 text-label-md text-on-surface-variant">
            {row.code}
          </span>
          <span className="font-label-md text-on-surface">{row.text}</span>
        </div>
      ))}
    </div>
  );
}

export function PlansTable({ plans, onEdit }: PlansTableProps) {
  const fxQuery = useIlsFxRates();

  if (plans.length === 0) {
    return (
      <Empty className="min-h-56 rounded-none border-0 px-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <StackIcon />
          </EmptyMedia>
          <EmptyTitle className="text-on-surface">No plans yet</EmptyTitle>
          <EmptyDescription>
            Create a subscription plan to offer students paid access tiers.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <Table aria-label="Subscription plans">
        <TableHeader>
          <TableRow className="border-outline-variant bg-surface-container-low/50 hover:bg-surface-container-low/50">
            <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
              Plan Name
            </TableHead>
            <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
              Price (ILS / USD / EGP)
            </TableHead>
            <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
              Duration (Days)
            </TableHead>
            <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
              Sort
            </TableHead>
            <TableHead className="px-6 py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
              Active
            </TableHead>
            <TableHead className="px-6 py-4 text-right text-label-md uppercase tracking-wider text-on-surface-variant">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow
              key={plan.id}
              className={cn(
                "border-outline-variant",
                !plan.isActive && "opacity-60",
              )}
            >
              <TableCell className="px-6 py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-body-md font-semibold text-on-surface">
                    {plan.name}
                  </span>
                  {plan.description ? (
                    <span className="line-clamp-1 text-body-sm text-on-surface-variant">
                      {plan.description}
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="px-6 py-4">
                <PlanPriceCell plan={plan} fx={fxQuery.data} />
              </TableCell>
              <TableCell className="px-6 py-4 text-body-md text-on-surface">
                {plan.durationDays}
              </TableCell>
              <TableCell className="px-6 py-4 text-body-md text-on-surface">
                {plan.sortOrder}
              </TableCell>
              <TableCell className="px-6 py-4">
                <ActiveToggle plan={plan} />
              </TableCell>
              <TableCell className="px-6 py-4 text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${plan.name}`}
                  onClick={() => onEdit(plan)}
                >
                  <PencilSimpleIcon />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="border-t border-outline-variant bg-surface-container-low px-6 py-4">
        <p className="text-body-sm text-on-surface-variant">
          Showing {plans.length} of {plans.length} subscription plans. Stored in
          ILS; USD and EGP are display-only from live FX
          {fxQuery.data ? ` (${fxQuery.data.date})` : ""}
          {fxQuery.isPending ? " (loading rates…)" : ""}
          {fxQuery.isError ? " (rates unavailable)" : ""}.
        </p>
      </div>
    </>
  );
}
