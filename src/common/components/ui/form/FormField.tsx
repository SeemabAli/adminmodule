import { useState, useEffect } from "react";
import type { InputHTMLAttributes } from "react";
import type {
  FieldError,
  FieldPath,
  FieldValues,
  PathValue,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { formatIndianNumber, parseIndianNumber } from "@/utils/CommaSeparator";

type FormFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  valueAsNumber?: boolean;
  errorMessage?: FieldError["message"];
  register: UseFormRegister<T>;
  children?: React.ReactNode;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function FormField<T extends FieldValues>({
  name,
  label,
  errorMessage,
  register,
  children,
  valueAsNumber,
  className = "relative left-0.5",
  type,
  ...rest
}: FormFieldProps<T>) {
  return (
    <div className={`form-control w-full ${className}`}>
      {/* Label */}
      <label className="label font-medium">
        <span className="label-text text-base-content ">{label}</span>
      </label>
      <div className="relative">
        <input
          {...register(name, { valueAsNumber: valueAsNumber })}
          className={`input input-bordered w-full bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-info ${
            type === "number" ? "text-right" : ""
          }`}
          type={type}
          {...rest}
        />
        {children && (
          <span className="absolute inset-y-0 right-1 flex items-center">
            {children}
          </span>
        )}
      </div>
      {errorMessage && (
        <span className="text-error text-xs mt-1">{errorMessage}</span>
      )}
    </div>
  );
}

type FormattedNumberFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  errorMessage?: FieldError["message"];
  register: UseFormRegister<T>;
  setValue: UseFormSetValue<T>;
  watch: UseFormWatch<T>;
  children?: React.ReactNode;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function FormattedNumberField<T extends FieldValues>({
  name,
  label,
  errorMessage,
  register,
  setValue,
  watch,
  children,
  className = "relative left-0.5",
  ...rest
}: FormattedNumberFieldProps<T>) {
  const [displayValue, setDisplayValue] = useState("");
  const actualValue = watch(name);

  // Update display value when the actual value changes (e.g., form reset or initial load)
  useEffect(() => {
    if (actualValue !== undefined && actualValue !== null) {
      // If actual value is a string (which shouldn't happen in ideal case), parse it
      const numValue =
        typeof actualValue === "string"
          ? parseIndianNumber(actualValue)
          : actualValue;

      // Only format if it's a valid number
      if (!isNaN(Number(numValue))) {
        setDisplayValue(formatIndianNumber(Number(numValue)));
      } else {
        setDisplayValue("");
      }
    } else {
      setDisplayValue("");
    }
  }, [actualValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // If input is empty, reset both display and form values
    if (!inputValue) {
      setDisplayValue("");
      // Important: Set as number 0, not string "0"
      setValue(name, 0 as PathValue<T, FieldPath<T>>, { shouldValidate: true });
      return;
    }

    // Keep only digits, commas, and possibly one minus sign at start
    // This allows the user to type numbers with commas
    let sanitizedInput = inputValue;

    // Remove any character that is not a digit, comma, or minus sign
    sanitizedInput = sanitizedInput.replace(/[^\d,-]/g, "");

    // Handle minus sign properly - only allowed at the beginning
    if (sanitizedInput.startsWith("-")) {
      // Keep the first minus and remove any others
      sanitizedInput = "-" + sanitizedInput.substring(1).replace(/-/g, "");
    } else {
      // Remove all minus signs if not at the beginning
      sanitizedInput = sanitizedInput.replace(/-/g, "");
    }

    // Special case for just a minus sign
    if (sanitizedInput === "-") {
      setDisplayValue("-");
      // Don't update the form value yet, wait for more input
      return;
    }

    // Update display value with the sanitized input
    setDisplayValue(sanitizedInput);

    // Parse the input to get the numeric value
    const numberValue = parseIndianNumber(sanitizedInput);

    if (!isNaN(numberValue)) {
      // Important: Set as number, not as string or any
      setValue(
        name,
        Number(numberValue) as unknown as PathValue<T, FieldPath<T>>,
        { shouldValidate: true },
      );
    }
  };

  // Format the display value properly when input loses focus
  const handleBlur = () => {
    if (displayValue && displayValue !== "-") {
      const numberValue = parseIndianNumber(displayValue);
      if (!isNaN(numberValue)) {
        // Update the display with properly formatted value
        setDisplayValue(formatIndianNumber(numberValue));
        // Ensure the form value is set as a number
        setValue(name, Number(numberValue) as PathValue<T, FieldPath<T>>, {
          shouldValidate: true,
        });
      }
    } else if (displayValue === "-" || displayValue === "") {
      // If only a minus sign or empty, reset to zero
      setDisplayValue("");
      setValue(name, 0 as PathValue<T, FieldPath<T>>, { shouldValidate: true });
    }
  };

  // This ensures that what React Hook Form registers is always a number
  // by explicitly setting the ValueAs transformation
  register(name, {
    setValueAs: (value) => {
      if (value === "" || value === null || value === undefined) {
        return 0;
      }
      if (typeof value === "string") {
        const parsed = parseIndianNumber(value);
        return isNaN(parsed) ? 0 : Number(parsed);
      }
      return Number(value);
    },
  });

  return (
    <div className={`form-control w-full ${className}`}>
      {/* Label */}
      <label className="label font-medium">
        <span className="label-text text-base-content ">{label}</span>
      </label>
      <div className="relative">
        <input
          // Note: No need to spread register here as we've already registered above with custom transformation
          name={name}
          className="input input-bordered w-full bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-info text-right"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          inputMode="numeric"
          {...rest}
        />
        {children && (
          <span className="absolute inset-y-0 right-1 flex items-center">
            {children}
          </span>
        )}
      </div>
      {errorMessage && (
        <span className="text-error text-xs mt-1">{errorMessage}</span>
      )}
    </div>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

type SelectFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  options: SelectOption[];
  errorMessage?: FieldError["message"];
  register: UseFormRegister<T>;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLSelectElement>, "name">;

export function SelectField<T extends FieldValues>({
  name,
  label,
  options,
  errorMessage,
  register,
  className = "relative left-0.5",
  ...rest
}: SelectFieldProps<T>) {
  return (
    <div className={`form-control w-full ${className}`}>
      <label className="label font-medium">
        <span className="label-text text-base-content">{label}</span>
      </label>
      <select
        {...register(name)}
        className="select select-bordered w-full bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-info"
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errorMessage && (
        <span className="text-error text-xs mt-1">{errorMessage}</span>
      )}
    </div>
  );
}

type TextAreaFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  errorMessage?: FieldError["message"];
  register: UseFormRegister<T>;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLTextAreaElement>, "name">;

export function TextAreaField<T extends FieldValues>({
  name,
  label,
  errorMessage,
  register,
  className = "relative left-0.5",
  ...rest
}: TextAreaFieldProps<T>) {
  return (
    <div className={`form-control w-full ${className}`}>
      <label className="label font-medium">
        <span className="label-text text-base-content">{label}</span>
      </label>
      <textarea
        {...register(name)}
        className="textarea textarea-bordered w-full bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-info"
        {...rest}
      />
      {errorMessage && (
        <span className="text-error text-xs mt-1">{errorMessage}</span>
      )}
    </div>
  );
}
