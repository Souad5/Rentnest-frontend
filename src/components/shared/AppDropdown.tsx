// components/common/AppDropdown.tsx

'use client';

import * as React from 'react';
import Link from 'next/link';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';

export interface AppDropdownItem {
    label?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    href?: string;
    separator?: boolean;
    destructive?: boolean;
    disabled?: boolean;
    className?: string;
}

interface AppDropdownProps {
    trigger: React.ReactNode;
    items: AppDropdownItem[];
    label?: React.ReactNode;
    align?: 'start' | 'center' | 'end';
    className?: string;
}

export function AppDropdown({
    trigger,
    items,
    label,
    align = 'end',
    className,
}: AppDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {trigger}
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align={align}
                className={cn('w-56', className)}
            >
                {label && (
                    <>
                        <DropdownMenuLabel>
                            {label}
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />
                    </>
                )}

                {items.map((item, index) => {
                    if (item.separator) {
                        return (
                            <DropdownMenuSeparator
                                key={`separator-${index}`}
                            />
                        );
                    }

                    const content = (
                        <>
                            {item.icon}
                            {item.label}
                        </>
                    );

                    return (
                        <DropdownMenuItem
                            key={`${item.label}-${index}`}
                            disabled={item.disabled}
                            onClick={item.href ? undefined : item.onClick}
                            className={cn(
                                'cursor-pointer',
                                item.destructive &&
                                'text-destructive focus:text-destructive',
                                item.className
                            )}
                            asChild={!!item.href}
                        >
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className="flex items-center gap-2"
                                >
                                    {content}
                                </Link>
                            ) : (
                                content
                            )}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}