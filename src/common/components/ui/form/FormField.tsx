import type { InputHTMLAttributes } from "react";
import type {
  FieldError,
  FieldPath,
  FieldValues,
  UseFormRegister,
} from "react-hook-form";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  errorMessage?: FieldError["message"];
  register: UseFormRegister<T>;
  children?: React.ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function FormField<T extends FieldValues>({
  name,
  label,
  errorMessage,
  register,
  children,
  className = "relative left-0.5",
  ...rest
}: Props<T>) {
  return (
    <div className={`form-control w-full ${className}`}>
      {/* Label */}
      <label className="label font-medium">
        <span className="label-text text-base-content">{label}</span>
      </label>

      {/* Input Field */}
      <input
        {...register(name)}
        className="input input-bordered w-full bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
        {...rest}
      />

      {/* Slot for Additional Content (Like Icons) */}
      {children && (
        <span className="absolute inset-y-0 right-1 top-6 flex items-center">
          {children}
        </span>
      )}

      {/* Error Message */}
      {errorMessage && (
        <span className="text-error text-sm mt-1">{errorMessage}</span>
      )}
    </div>
  );
}
