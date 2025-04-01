import * as React from 'react';

import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref): React.ReactElement => (
  <div
    ref={ref}
    className={cn(
      'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
      className
    )}
    data-slot="card"
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref): React.ReactElement => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1.5 px-6', className)}
    data-slot="card-header"
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref): React.ReactElement => (
  <h3
    ref={ref}
    className={cn('leading-none font-semibold', className)}
    data-slot="card-title"
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref): React.ReactElement => (
  <p
    ref={ref}
    className={cn('text-muted-foreground text-sm', className)}
    data-slot="card-description"
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref): React.ReactElement => (
  <div
    ref={ref}
    className={cn('px-6', className)}
    data-slot="card-content"
    {...props}
  />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref): React.ReactElement => (
  <div
    ref={ref}
    className={cn('flex items-center px-6', className)}
    data-slot="card-footer"
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
