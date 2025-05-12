import React from "react";
import { FieldError } from "react-hook-form";

// Form Field Container
export const FormField = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`mb-6 ${className}`}>{children}</div>;
};

// Form Label
export const FormLabel = ({
  htmlFor,
  children,
  required = false,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean | undefined;
}) => {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-text-primary">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
};

// Form Input
export const FormInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    error?: FieldError;
  }
>(({ className, error, ...props }, ref) => {
  return (
    <>
      <input
        ref={ref}
        className={`focus:border-primary w-full rounded-lg border border-[#E8E9EC] bg-white p-3 py-2 text-text-primary placeholder:text-text-secondary/50 focus:outline-none ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <div className="mt-1 text-sm text-red-500">{error.message}</div>
      )}
    </>
  );
});
FormInput.displayName = "FormInput";

// Form Textarea
export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    error?: FieldError;
    characterCount?: number;
    maxLength?: number;
  }
>(({ className, error, characterCount, maxLength, ...props }, ref) => {
  return (
    <>
      <textarea
        ref={ref}
        className={`focus:border-primary w-full rounded-lg border border-border-primary/50 bg-white/50 p-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...props}
      />
      <div className="mt-1 flex justify-between">
        {error && <div className="text-sm text-red-500">{error.message}</div>}
        {maxLength !== undefined && (
          <div className="text-right text-sm text-text-secondary">
            {characterCount || 0}/{maxLength}
          </div>
        )}
      </div>
    </>
  );
});
FormTextarea.displayName = "FormTextarea";

// Form Error Message
export const FormErrorMessage = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  if (!children) return null;
  return <div className="mt-1 text-sm text-red-500">{children}</div>;
};

// Radio Group
export const RadioGroup = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`flex gap-3 ${className}`}>{children}</div>;
};

// Radio Option
export const RadioOption = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
    label: string;
  }
>(({ label, className = "", ...props }, ref) => {
  return (
    <label
      className={`flex cursor-pointer items-center rounded-full border border-border-primary/50 px-4 py-2 ${props.checked ? "border-primary bg-primary/5" : ""} ${className}`}
    >
      <input ref={ref} type="radio" className="hidden" {...props} />
      <span>{label}</span>
    </label>
  );
});
RadioOption.displayName = "RadioOption";

// Form Helper Text
export const FormHelperText = ({ children }: { children: React.ReactNode }) => {
  return <div className="mt-1 text-sm text-text-secondary">{children}</div>;
};

// Checkbox
export const FormCheckbox = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
    label: string;
    error?: FieldError;
  }
>(({ label, className = "", error, ...props }, ref) => {
  return (
    <div className="flex items-start">
      <div className="flex h-5 items-center">
        <input
          ref={ref}
          type="checkbox"
          className="focus:ring-primary h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-2 focus:ring-offset-2"
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        <label className="font-medium text-text-primary">{label}</label>
        {error && (
          <div className="mt-1 text-sm text-red-500">{error.message}</div>
        )}
      </div>
    </div>
  );
});
FormCheckbox.displayName = "FormCheckbox";

// Button
export const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline";
}) => {
  const baseClasses =
    "rounded-lg px-4 py-2 font-medium transition-colors focus:outline-none";

  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-gray-100 text-text-primary hover:bg-gray-200",
    outline:
      "border border-border-primary/50 bg-transparent text-text-primary hover:bg-gray-100",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
