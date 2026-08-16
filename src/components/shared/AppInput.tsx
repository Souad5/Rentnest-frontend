// components/common/AppInput.tsx

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type AppInputProps = React.ComponentProps<typeof Input>;

export function AppInput({
    className,
    ...props
}: AppInputProps) {
    return (
        <Input
            className={cn('cursor-text', className)}
            {...props}
        />
    );
}