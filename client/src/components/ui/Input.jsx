import React from "react";
import { cn } from "../../../utils/cn";

const Input = React.forwardRef(
  ({ label, error, className = '', leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-semibold text-primary mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              `block w-full rounded-md border border-gray bg-white py-2 px-3 text-sm shadow-sm placeholder-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none ${
                leftIcon ? 'pl-10' : ''
              } ${rightIcon ? 'pr-10' : ''} ${error ? 'border-red-500' : ''}`,
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

export default Input; 