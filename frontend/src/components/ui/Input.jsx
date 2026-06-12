import React from 'react';

export const Input = React.forwardRef(({
  className = '',
  type = 'text',
  error = false,
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={`flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${
        error ? 'border-destructive focus-visible:ring-destructive/40' : 'border-border focus-visible:border-primary/50'
      } ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';
