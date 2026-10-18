'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { authApi } from '@/lib/api';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useAuth, type User } from '@/providers/AuthProvider';
import { errorMessage } from '@/components/dashboard/landlord/shared';

const BIO_MAX = 500;

// Mirrors the backend PATCH /auth/me validation.
const profileSchema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name must be 80 characters or fewer'),
    phone: z
        .string()
        .trim()
        .max(30, 'Phone must be 30 characters or fewer')
        .regex(/^[+\d\s()-]*$/, 'Use digits, spaces, +, - or brackets only'),
    avatarUrl: z
        .string()
        .trim()
        .max(2048, 'URL is too long')
        .refine((v) => v === '' || /^https?:\/\/\S+$/i.test(v), 'Enter a full image URL starting with https://'),
    bio: z.string().trim().max(BIO_MAX, `Bio must be ${BIO_MAX} characters or fewer`),
});

type ProfileValues = z.infer<typeof profileSchema>;

function isPreviewable(url: string) {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
        return false;
    }
}

export function ProfileDetailsForm({ user }: { user: User }) {
    const { refreshUser } = useAuth();

    const form = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user.name ?? '',
            phone: user.phone ?? '',
            avatarUrl: user.avatarUrl ?? '',
            bio: user.bio ?? '',
        },
    });
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = form;

    const [avatarUrl, name, bio] = useWatch({ control, name: ['avatarUrl', 'name', 'bio'] });
    const bioLength = bio?.length ?? 0;

    const onSubmit = async (values: ProfileValues) => {
        try {
            const res = await authApi.updateMe(values);
            await refreshUser().catch(() => undefined);
            reset({
                name: res.data.name ?? values.name,
                phone: res.data.phone ?? '',
                avatarUrl: res.data.avatarUrl ?? '',
                bio: res.data.bio ?? '',
            });
            toast.success('Profile updated');
        } catch (error) {
            toast.error(errorMessage(error, 'Could not update your profile.'));
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-20 w-20 border border-border">
                    {avatarUrl && isPreviewable(avatarUrl) && <AvatarImage src={avatarUrl} alt="Avatar preview" />}
                    <AvatarFallback className="bg-primary text-xl font-bold text-primary-foreground">
                        {initials(name || user.name)}
                    </AvatarFallback>
                </Avatar>
                <div className="w-full flex-1 space-y-1.5">
                    <Label htmlFor="avatarUrl">Avatar image URL</Label>
                    <Input
                        id="avatarUrl"
                        type="url"
                        inputMode="url"
                        placeholder="https://images.unsplash.com/…"
                        className="h-10 rounded-xl"
                        aria-invalid={!!errors.avatarUrl}
                        {...register('avatarUrl')}
                    />
                    {errors.avatarUrl ? (
                        <p className="text-xs text-destructive">{errors.avatarUrl.message}</p>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            The preview updates as you type. Leave empty to show your initials.
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                        id="name"
                        autoComplete="name"
                        className="h-10 rounded-xl"
                        aria-invalid={!!errors.name}
                        {...register('name')}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+880 17XX-XXXXXX"
                        className="h-10 rounded-xl"
                        aria-invalid={!!errors.phone}
                        {...register('phone')}
                    />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <Label htmlFor="bio">Bio</Label>
                    <span
                        className={cn('text-xs tabular-nums', bioLength > BIO_MAX ? 'text-destructive' : 'text-muted-foreground')}
                        aria-live="polite"
                    >
                        {bioLength}/{BIO_MAX}
                    </span>
                </div>
                <Textarea
                    id="bio"
                    rows={4}
                    placeholder={
                        user.role === 'LANDLORD'
                            ? 'Tell tenants how you manage your homes, e.g. response times and maintenance.'
                            : 'Introduce yourself to landlords: where you work, who you live with, how long you plan to stay.'
                    }
                    className="rounded-xl"
                    aria-invalid={!!errors.bio}
                    {...register('bio')}
                />
                {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl"
                    disabled={!isDirty || isSubmitting}
                    onClick={() => reset()}
                >
                    Discard changes
                </Button>
                <Button type="submit" className="h-10 rounded-xl px-5" disabled={isSubmitting || !isDirty}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save profile
                </Button>
            </div>
        </form>
    );
}
