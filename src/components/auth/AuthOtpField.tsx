"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

type AuthOtpFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string | null;
  maxLength?: number;
  className?: string;
};

export function AuthOtpField({
  id,
  label,
  value,
  onChange,
  disabled,
  error,
  maxLength = 6,
  className,
}: AuthOtpFieldProps) {
  const invalid = Boolean(error);
  const errorId = `${id}-error`;
  const slots = Array.from({ length: maxLength }, (_, index) => index);

  return (
    <Field data-invalid={invalid || undefined} className={cn(className)}>
      <FieldLabel htmlFor={id} className="text-body-sm text-on-surface">
        {label}
      </FieldLabel>
      <InputOTP
        id={id}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={error ? errorId : undefined}
        containerClassName="justify-center gap-0 w-full"
      >
        <InputOTPGroup className="w-full justify-between gap-1.5 rounded-none border-0">
          {slots.map((index) => (
            <InputOTPSlot
              key={index}
              index={index}
              className="size-10 flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md first:rounded-lg first:border-l last:rounded-lg"
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
      {error ? (
        <FieldError id={errorId} className="text-body-sm text-error">
          {error}
        </FieldError>
      ) : null}
    </Field>
  );
}
