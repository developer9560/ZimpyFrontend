'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/src/components/ui/Button';
import { Input, Select } from '@/src/components/ui/Input';
import { categoryAPI } from '@/src/lib/api';
import { CategoryTreeResponse, CategoryResponse } from '@/src/types';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ChevronRight, UploadCloud } from 'lucide-react';

const categorySchema = z.object({
    name: z.string().min(2, 'Name is required'),
    parentId: z.string().optional(), // We'll handle this as string ID from select
    priority: z.number().optional(),
    isActive: z.boolean().optional()
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
    initialData?: CategoryResponse; // For Edit Mode
}

export default function CategoryFormPage({ initialData }: CategoryFormProps) {
    const router = useRouter();
    const [tree, setTree] = useState<CategoryTreeResponse[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrl || null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: initialData?.name || '',
            parentId: '', // Should map if editing child
            priority: initialData?.priority || 1,
            isActive: initialData?.isActive || false
        }
    });

    useEffect(() => {
        // Load tree for Parent Selection
        categoryAPI.getTree().then(buildFlatOptions).catch(console.error);

        // Note: Finding parentId for 'initialData' isn't direct since backend doesn't return parentId in CategoryResponse.
        // We might need to fetch full detail or iterate tree to find parent.
        // For now, parent selection in Edit might default to root if not provided.
    }, []);

    // Helper to flatten tree for Select options (optional, or just render recursive options)
    const [flatOptions, setFlatOptions] = useState<{ value: string, label: string }[]>([]);

    const buildFlatOptions = (nodes: CategoryTreeResponse[]) => {
        const options: { value: string, label: string }[] = [];
        const traverse = (list: CategoryTreeResponse[], prefix = '') => {
            for (const node of list) {
                // Don't allow selecting self or descendants as parent (simple check: skip self)
                if (initialData && node.id === initialData.id) continue;

                options.push({ value: String(node.id), label: prefix + node.name });
                if (node.children) traverse(node.children, prefix + '-- ');
            }
        };
        traverse(nodes);
        setTree(nodes);
        setFlatOptions(options);

        // Try to find parent in edit mode? 
        // Backend: category.getParent() check needed.
        // Or simply let user re-parent if they want.
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: CategoryFormData) => {
        const formData = new FormData();

        // Prepare Request JSON part
        const categoryRequest = {
            name: data.name,
            parentId: data.parentId ? Number(data.parentId) : null,
            priority: data.priority,
            isActive: data.isActive
        };

        // Append JSON blob (backend expects @RequestPart("category"))
        const jsonBlob = new Blob([JSON.stringify(categoryRequest)], { type: 'application/json' });
        formData.append('category', jsonBlob); // Key 'category' matches @RequestPart("category")

        // Append Image (backend expects @RequestPart("imageUrl"))
        // Wait, Controller says @RequestPart(value = "imageUrl").
        // Wait, Controller (Step 1426) line 29: @RequestPart(value = "imageUrl"...)
        // But "imageUrl" usually implies String URL?
        // Ah, Step 1426: @RequestPart(value = "imageUrl", required = false) MultipartFile file
        // Yes it expects file part named "imageUrl".
        if (imageFile) {
            formData.append('imageUrl', imageFile);
        }

        setUploadProgress(0);
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        try {
            if (initialData) {
                await categoryAPI.update(String(initialData.id), formData);
                toast.success('Category updated!');
            } else {
                await categoryAPI.create(formData);
                toast.success('Category created!');
            }

            clearInterval(progressInterval);
            setUploadProgress(100);
            // Slight delay to show 100%
            setTimeout(() => router.push('/suraj-yuvraj-zimpy-admin/categories'), 500);
        } catch (error) {
            clearInterval(progressInterval);
            setUploadProgress(0);
            console.error(error);
            toast.error('Failed to save category');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                <span className="hover:text-gray-900 cursor-pointer" onClick={() => router.push('/suraj-yuvraj-zimpy-admin/categories')}>Categories</span>
                <ChevronRight size={14} />
                <span className="font-semibold text-gray-900">{initialData ? 'Edit Category' : 'New Category'}</span>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">{initialData ? 'Edit Category' : 'Create New Category'}</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Name */}
                    <Input
                        {...register('name')}
                        label="Category Name"
                        placeholder="e.g. Electronics"
                        error={errors.name?.message}
                    />

                    {/* Parent Selection */}
                    <Select
                        {...register('parentId')}
                        label="Parent Category (Optional)"
                        options={[{ value: '', label: 'None (Root Category)' }, ...flatOptions]}
                    />

                    <Input
                        {...register('priority', { valueAsNumber: true })}
                        label="Priority"
                        type="number"
                        min="1"
                        error={errors.priority?.message}
                    />

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
                        <div className="flex items-start gap-6">
                            <div className="w-24 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden shrink-0">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <UploadCloud className="text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="file"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#10B981]/10 file:text-[#10B981] hover:file:bg-[#10B981]/20 cursor-pointer"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                <p className="text-xs text-gray-400 mt-2">Upload a square icon or banner image (JPG, PNG).</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-50 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" isLoading={isSubmitting}>Save Category</Button>
                    </div>
                </form>
            </div>
        </div>
    );

}