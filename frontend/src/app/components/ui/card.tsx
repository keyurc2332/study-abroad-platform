import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-md bg-white border border-slate-200
          shadow-sm p-6
          ${hoverable ? 'card-hover cursor-pointer' : ''}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

// Card subcomponents
export const CardHeader = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`mb-4 ${className}`} {...props} />
);

export const CardTitle = ({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-xl font-semibold text-slate-900 ${className}`} {...props} />
);

export const CardDescription = ({ className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-slate-500 mt-1 ${className}`} {...props} />
);

export const CardBody = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`space-y-3 ${className}`} {...props} />
);

export const CardFooter = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`mt-4 pt-4 border-t border-slate-100 flex gap-2 ${className}`} {...props} />
);