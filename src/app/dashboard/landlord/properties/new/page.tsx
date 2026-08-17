'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, ImagePlus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CreatePropertyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>(['']);

    const [formData, setFormData] = useState({
        title: '',
        location: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        description: '',
        category: '',
    });

    const handleImageUrlChange = (index: number, value: string) => {
        const updated = [...imageUrls];
        updated[index] = value;
        setImageUrls(updated);
    };

    const addImageUrlField = () => setImageUrls([...imageUrls, '']);
    const removeImageUrlField = (index: number) =>
        setImageUrls(imageUrls.filter((_, i) => i !== index));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                bedrooms: Number(formData.bedrooms),
                bathrooms: Number(formData.bathrooms),
                images: imageUrls.filter((url) => url.trim() !== ''),
            };

            // Call API: POST /api/landlord/properties
            console.log('Posting Property Payload:', payload);

            router.push('/dashboard/landlord');
        } catch (err) {
            console.error('Failed to create property', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-6 space-y-6">
            <Button variant="ghost" asChild className="gap-2 text-muted-foreground">
                <Link href="/dashboard/landlord">
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>
            </Button>

            <div>
                <h1 className="text-2xl font-bold tracking-tight">Create New Property Listing</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Provide detailed specifications and high-quality image URLs for prospective tenants.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border p-6 rounded-2xl shadow-xs">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-foreground">Property Title</label>
                        <Input
                            required
                            placeholder="e.g. Modern Apartment in Downtown"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="mt-1"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-foreground">Location / Address</label>
                            <Input
                                required
                                placeholder="e.g. Dhaka, Bangladesh"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground">Monthly Rent ($/mo)</label>
                            <Input
                                type="number"
                                required
                                placeholder="e.g. 1200"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-foreground">Bedrooms</label>
                            <Input
                                type="number"
                                required
                                placeholder="e.g. 2"
                                value={formData.bedrooms}
                                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground">Bathrooms</label>
                            <Input
                                type="number"
                                required
                                placeholder="e.g. 2"
                                value={formData.bathrooms}
                                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-foreground">Description</label>
                        <textarea
                            required
                            rows={4}
                            placeholder="Describe amenities, neighborhood, lease terms..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="mt-1 w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>

                    {/* Image URLs UI */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                <ImagePlus className="h-4 w-4" /> Image URLs
                            </label>
                            <Button type="button" variant="outline" size="sm" onClick={addImageUrlField} className="gap-1">
                                <Plus className="h-3 w-3" /> Add Image Field
                            </Button>
                        </div>
                        {imageUrls.map((url, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <Input
                                    type="url"
                                    placeholder="https://images.unsplash.com/photo-..."
                                    value={url}
                                    onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                                />
                                {imageUrls.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeImageUrlField(idx)}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Publish Listing'}
                    </Button>
                </div>
            </form>
        </div>
    );
}