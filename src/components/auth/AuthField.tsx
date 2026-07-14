import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AuthFieldProps = {
  id: string;
  label: string;
  type?: "email" | "password" | "text";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  error?: string | null;
  className?: string;
};

export function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  error,
  className,
}: AuthFieldProps) {
  const invalid = Boolean(error);
  const errorId = `${id}-error`;

  return (
    <Field
      data-invalid={invalid || undefined}
      className={cn(className)}
    >
      <FieldLabel htmlFor={id} className="text-body-sm text-on-surface">
        {label}
      </FieldLabel>
      <Input
        id={id}
        type={type}
        value={value}
        onValueChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={error ? errorId : undefined}
        className="h-10 rounded-lg border-outline-variant bg-surface-container-lowest px-3 text-body-md"
      />
      {error ? (
        <FieldError id={errorId} className="text-body-sm text-error">
          {error}
        </FieldError>
      ) : null}
    </Field>
  );
}
