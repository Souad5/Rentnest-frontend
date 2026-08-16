// components/common/AppButton.tsx

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AppButtonProps = React.ComponentProps<typeof Button>;

export function AppButton({
    className,
    ...props
}: AppButtonProps) {
    return (
        <Button
            className={cn('cursor-pointer', className)}
            {...props}
        />
    );
}