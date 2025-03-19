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
  className = "",
  ...rest
}: Props<T>) {
  return (
    <p className={`w-full ${className}`}>
      <label className="form-control w-full relative top-1 right-2">
        <span className="label block">
          <span className={`label-text font-semibold text-gray-700`}>
            {label}
          </span>
        </span>

        <span className="relative w-full">
          <input
            className={`input input-bordered w-full mb-2 ${
              errorMessage ? "border-red-500" : "text-gray-700"
            }`}
            {...register(name)}
            {...rest}
          />
          {children && (
            <span className="absolute inset-y-0 right-3 flex items-center">
              {children}
            </span>
          )}
        </span>
      </label>
      {errorMessage && (
        <small className="mt-0.5 block text-red-500">{errorMessage}</small>
      )}
    </p>
  );
}
