import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export interface InputNumberProps extends InputProps {
  value?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

const InputNumber = ({
  value,
  onChange,
  className,
  type,
  ...props
}: InputNumberProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!value) {
      return;
    }
    inputRef.current!.value = value;
  }, [value]);

  React.useEffect(() => {
    inputRef.current!.onchange = (e) => {
      let str = (e.target as any).value;
      const regex = /[^0-9]/g;
      let match = regex.exec(str);
      if (match) {
        str = str.slice(0, match.index);
      }
      inputRef.current!.value = str;
      onChange && onChange(e as any);
    };
  }, []);

  return <Input ref={inputRef} className={className} type={type} {...props} />;
};

export { Input, InputNumber };
