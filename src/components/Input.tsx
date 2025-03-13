import React, { useState } from "react";
import { z } from "zod";

export interface InputProps {
    label?: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    error?: string;
    onBlur?: () => void;
}

// Define a Zod schema for input validation
const inputSchema = z
    .string()
    .regex(/^[a-zA-Z0-9\s]+$/, "Only letters, numbers, and spaces are allowed");

// Enhanced Input Component
const Input: React.FC<InputProps> = ({
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    className = "",
    
}) => {
    const [error, setError] = useState("");
    const [touched, setTouched] = useState(false);

    const validateInput = (inputValue: string) => {
        if (!inputValue.trim()) return "This field is required";
        const validationResult = inputSchema.safeParse(inputValue);
        return validationResult.success ? "" : validationResult.error.errors[0].message;
    };

    const handleBlur = () => {
        setTouched(true);
        setError(validateInput(value));
    };

    return (
        <div className="flex flex-col space-y-1">
            {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    onChange(e);
                    if (touched) setError(validateInput(e.target.value));
                }}
                onBlur={handleBlur}
                className={`border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 
                    ${error ? "border-red-500" : "border-gray-300"} ${className}`}
            />
            {touched && error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default Input;
