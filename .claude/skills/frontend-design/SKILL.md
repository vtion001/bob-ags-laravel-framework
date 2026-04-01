---
name: frontend-design
description: Generate consistent React + Tailwind CSS UI components following shadcn/ui patterns
user-invocable: true
---

# Frontend Design Skill

Generate production-ready React components with Tailwind CSS for this codebase.

## Codebase Conventions

### Component Location
- Shared UI components: `resources/js/components/ui/`
- Feature components: `resources/js/components/{feature}/`
- Pages: `resources/js/pages/`

### Styling Pattern
- Tailwind CSS v4 via `@tailwindcss/postcss`
- shadcn/ui-inspired components in `resources/js/components/ui/`
- Use `clsx` and `tailwind-merge` for conditional classes
- Use `lucide-react` for icons

### Component Structure
```tsx
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export function ComponentName({ className, ...props }: ComponentProps) {
  return (
    <div className={cn("base-classes", className)} {...props}>
      {/* content */}
    </div>
  );
}
```

### TypeScript Patterns
- Define prop types with TypeScript interfaces
- Use React 19's built-in types where applicable
- Import types from `resources/js/lib/types/`

### API Data Fetching
- Use custom hooks from `resources/js/hooks/`
- Follow patterns in `resources/js/hooks/dashboard/useDashboard.ts`
- Handle loading/error states consistently

## Output

Generate complete component files that:
- Can be dropped into `resources/js/components/`
- Include proper TypeScript types
- Use `cn()` helper for className merging
- Follow existing naming conventions
- Include JSDoc comments for complex logic

## Examples

### Basic Button Variant
```tsx
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
}

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
```
