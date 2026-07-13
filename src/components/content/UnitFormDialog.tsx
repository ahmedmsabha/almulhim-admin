"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api/errors";
import {
  unitFormSchema,
  unitFormToCreateBody,
  unitFormToUpdateBody,
  type UnitFormInput,
  type UnitFormValues,
} from "@/lib/content/form-schema";
import { nextSortOrder } from "@/lib/content/next-sort-order";
import type { AdminContentTreeUnit, ContentRegion } from "@/lib/content/types";
import { CONTENT_REGION_LABELS } from "@/lib/content/types";
import {
  useCreateUnit,
  useUpdateUnit,
} from "@/lib/content/use-content-mutations";
import { nestFieldErrorsFromApiError } from "@/lib/plans/nest-field-errors";

type UnitFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: AdminContentTreeUnit | null;
  siblingSortOrders: number[];
};

const emptyDefaults: UnitFormInput = {
  title: "",
  description: "",
  region: "both",
  sortOrder: 0,
};

function defaultsFromUnit(unit: AdminContentTreeUnit | null): UnitFormInput {
  if (!unit) return emptyDefaults;
  return {
    title: unit.title,
    description: unit.description ?? "",
    region: unit.region,
    sortOrder: unit.sortOrder,
  };
}

export function UnitFormDialog({
  open,
  onOpenChange,
  unit,
  siblingSortOrders,
}: UnitFormDialogProps) {
  const isEdit = unit !== null;
  const create = useCreateUnit();
  const update = useUpdateUnit();
  const pending = create.isPending || update.isPending;

  const form = useForm<UnitFormInput, unknown, UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: emptyDefaults,
  });

  const unitId = unit?.id;

  useEffect(() => {
    if (open) {
      form.reset(defaultsFromUnit(unit));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by unitId
  }, [open, unitId, form]);

  async function onSubmit(values: UnitFormValues) {
    form.clearErrors();
    try {
      if (isEdit && unit) {
        await update.mutateAsync({
          unitId: unit.id,
          body: unitFormToUpdateBody(values),
        });
      } else {
        await create.mutateAsync(
          unitFormToCreateBody(values, nextSortOrder(siblingSortOrders)),
        );
      }
      onOpenChange(false);
    } catch (error) {
      const mapped = nestFieldErrorsFromApiError(error);
      for (const [key, message] of Object.entries(mapped)) {
        form.setError(key as keyof UnitFormValues, { message });
      }
      if (Object.keys(mapped).length === 0) {
        form.setError("root", {
          message: isApiError(error)
            ? error.message
            : "Could not save unit. Try again.",
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit unit" : "New unit"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update unit title, region, description, and order."
              : "Create a unit. Sort order is appended after existing units."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.title)}>
              <FieldLabel htmlFor="unit-title">Title</FieldLabel>
              <Input
                id="unit-title"
                {...form.register("title")}
                aria-invalid={Boolean(form.formState.errors.title)}
              />
              <FieldError>{form.formState.errors.title?.message}</FieldError>
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.description)}>
              <FieldLabel htmlFor="unit-description">Description</FieldLabel>
              <Textarea
                id="unit-description"
                rows={3}
                {...form.register("description")}
              />
              <FieldError>
                {form.formState.errors.description?.message}
              </FieldError>
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.region)}>
              <FieldLabel>Region</FieldLabel>
              <Controller
                control={form.control}
                name="region"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value as ContentRegion)
                    }
                  >
                    <SelectTrigger className="w-full" aria-label="Unit region">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {(
                          Object.keys(CONTENT_REGION_LABELS) as ContentRegion[]
                        ).map((region) => (
                          <SelectItem key={region} value={region}>
                            {CONTENT_REGION_LABELS[region]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{form.formState.errors.region?.message}</FieldError>
            </Field>
            {isEdit ? (
              <Field data-invalid={Boolean(form.formState.errors.sortOrder)}>
                <FieldLabel htmlFor="unit-sort">Sort order</FieldLabel>
                <Input
                  id="unit-sort"
                  type="number"
                  min={0}
                  step={1}
                  {...form.register("sortOrder")}
                />
                <FieldError>
                  {form.formState.errors.sortOrder?.message}
                </FieldError>
              </Field>
            ) : null}
          </FieldGroup>
          {form.formState.errors.root?.message ? (
            <p className="font-body-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save unit" : "Create unit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
