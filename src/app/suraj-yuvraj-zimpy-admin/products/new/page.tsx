'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Save,
    Plus,
    Trash2,
    Upload,
    Image as ImageIcon,
    LayoutGrid,
    Info,
    CheckCircle2,
    ArrowRight,
    Loader2,
    Settings2,
    Link as LinkIcon,
    X,
    AlertCircle,
    List
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { toast } from 'react-hot-toast';
import api, { categoryAPI, skuAPI, attributeAPI, skuAttributeAPI, productsAPI, productImageAPI } from '@/src/lib/api';
import { cn } from '@/src/lib/utils';
import type {
    Attribute,
    AttributeValue,
    ProductSku,
    CategoryMiniResponse,
    ApiResponse
} from '@/src/types';

type FormStage = 'basic' | 'skus' | 'attributes' | 'images';

export default function ProductFormPage() {
    const router = useRouter();
    const params = useParams();
    const isEdit = !!params.id;

    // Wizard State
    const [currentStage, setCurrentStage] = useState<FormStage>('basic');
    const [savedProductId, setSavedProductId] = useState<number | null>(isEdit ? parseInt(params.id as string) : null);
    const [isLoading, setIsLoading] = useState(false);

    // Data States
    const [categories, setCategories] = useState<CategoryMiniResponse[]>([]);
    const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>([]);
    const [savedSkus, setSavedSkus] = useState<ProductSku[]>([]);

    // Form States
    const [productFormData, setProductFormData] = useState({
        name: '',
        brand: '',
        categoryId: '',
        summary: '',
        productDetails: [] as { key: string, value: string }[],
    });

    const [skuForms, setSkuForms] = useState<any[]>([
        { price: 0, mrp: 0, stock: 0, costPrice: 0 }
    ]);

    // Gallery State
    const [gallery, setGallery] = useState<{
        file?: File;
        preview: string;
        progress: number;
        status: 'pending' | 'uploading' | 'done' | 'error';
        id?: number;
        primary: boolean;
    }[]>([]);

    // Variant Mapping UI State
    const [selectedSkuId, setSelectedSkuId] = useState<number | null>(null);
    const [attributeId, setAttributeId] = useState<string>('');
    const [availableValues, setAvailableValues] = useState<AttributeValue[]>([]);
    const [attrValue, setAttrValue] = useState<string>('');
    const [isValuesLoading, setIsValuesLoading] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (attributeId) {
            fetchAttributeValues(parseInt(attributeId));
        } else {
            setAvailableValues([]);
        }
    }, [attributeId]);

    const fetchAttributeValues = async (id: number) => {
        setIsValuesLoading(true);
        try {
            const values = await attributeAPI.getValues(id);
            setAvailableValues(values || []);
        } catch (error) {
            console.error("Failed to load values", error);
        } finally {
            setIsValuesLoading(false);
        }
    };

    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            const [catRes, attrRes] = await Promise.all([
                categoryAPI.getAllCategories(),
                attributeAPI.getAll()
            ]);
            setCategories(catRes);
            setAvailableAttributes(attrRes);

            if (isEdit) {
                const response = await api.get<ApiResponse<any>>(`/admin/products/${params.id}`);
                const product = response.data.data;
                setProductFormData({
                    name: product.name,
                    brand: product.brand || '',
                    categoryId: String(product.category.id),
                    summary: product.summary,
                    productDetails: product.productDetails || []
                });
                if (product.skus && product.skus.length > 0) {
                    setSkuForms(product.skus.map((s: any) => ({
                        id: s.id,
                        price: s.price,
                        mrp: s.mrp,
                        stock: s.stock,
                        costPrice: s.costPrice
                    })));
                }
                setSavedSkus(product.skus || []);
                const existingImages = product.images?.map((img: any) => ({
                    preview: img.imageUrl,
                    progress: 100,
                    status: 'done' as const,
                    id: img.id,
                    primary: img.primary
                })) || [];
                setGallery(existingImages);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load form data');
        } finally {
            setIsLoading(false);
        }
    };

    // --- STAGE 1: BASIC INFO ---
    const handleSaveBasicInfo = async () => {
        if (!productFormData.name || !productFormData.categoryId) {
            toast.error('Product Name and Category are required');
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                ...productFormData,
                categoryId: parseInt(productFormData.categoryId),
                productDetails: productFormData.productDetails.filter(s => s.key && s.value)
            };

            if (savedProductId) {
                await productsAPI.update(savedProductId, payload);
                toast.success('Product updated');
            } else {
                const product = await productsAPI.create(payload);
                setSavedProductId(product.id);
                toast.success('Product created! Proceed to SKU setup.');
            }
            setCurrentStage('skus');
        } catch (error) {
            toast.error('Failed to save product info');
        } finally {
            setIsLoading(false);
        }
    };

    // --- STAGE 2: SKUs ---
    const addSkuRow = () => {
        setSkuForms([...skuForms, { price: 0, mrp: 0, stock: 0, costPrice: 0 }]);
    };

    const removeSkuRow = async (index: number) => {
        const sku = skuForms[index];
        if (sku.id) {
            if (!confirm('Are you sure you want to delete this variant?')) return;
            setIsLoading(true);
            try {
                await skuAPI.delete(sku.id);
                toast.success('Variant deleted');
            } catch (error) {
                toast.error('Failed to delete variant');
                return;
            } finally {
                setIsLoading(false);
            }
        }
        setSkuForms(prev => prev.filter((_, i) => i !== index));
    };






    const handleSkus = async (index: number) => {
        if (!savedProductId) {
            toast.error('Please save basic info first');
            return;
        }

        const sku = skuForms[index];
        if (sku.price <= 0 || sku.mrp <= 0) {
            toast.error('Price and MRP must be greater than 0');
            return;
        }

        setIsLoading(true);
        try {
            if (sku.id) {
                const updated = await skuAPI.update(sku.id, {
                    ...sku,
                    productId: savedProductId
                });
                toast.success('Variant updated');
                // Refresh local product data if needed or just sync state
                const next = [...skuForms];
                next[index] = { ...updated, costPrice: updated.costPrice || sku.costPrice };
                setSkuForms(next);
            } else {
                const created = await skuAPI.create({
                    ...sku,
                    productId: savedProductId
                });
                toast.success('Variant added');
                const next = [...skuForms];
                next[index] = { ...created, costPrice: created.costPrice || sku.costPrice };
                setSkuForms(next);

                // Update savedSkus for other stages
                const productRes = await api.get<ApiResponse<any>>(`/admin/products/${savedProductId}`);
                setSavedSkus(productRes.data.data.skus || []);
            }
        } catch (error) {
            toast.error('Failed to save variant');
        } finally {
            setIsLoading(false);
        }
    };

    // const handleCreateSkus = async () => {
    //     if (!savedProductId) return;
    //     setIsLoading(true);
    //     try {
    //         for (const form of skuForms) {
    //             if (form.id) {
    //                 await skuAPI.update(form.id, {
    //                     ...form,
    //                     productId: savedProductId
    //                 });
    //             } else {
    //                 await skuAPI.create({
    //                     ...form,
    //                     productId: savedProductId
    //                 });
    //             }
    //         }
    //         const productRes = await api.get(`/admin/products/${savedProductId}`);
    //         const updatedProduct = productRes.data;
    //         setSavedSkus(updatedProduct.skus || []);
    //         // Keep skuForms in sync after save
    //         setSkuForms(updatedProduct.skus.map((s: any) => ({
    //             id: s.id,
    //             price: s.price,
    //             mrp: s.mrp,
    //             stock: s.stock,
    //             costPrice: s.costPrice
    //         })));
    //         toast.success('SKUs saved successfully');
    //         setCurrentStage('attributes');
    //     } catch (error) {
    //         toast.error('Failed to create SKUs');
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // --- STAGE 3: ATTRIBUTES & MAPPING ---
    const [currentMappings, setCurrentMappings] = useState<any[]>([]);

    useEffect(() => {
        if (selectedSkuId) {
            loadMappings(selectedSkuId);
        }
    }, [selectedSkuId]);

    const loadMappings = async (skuId: number) => {
        try {
            const mappings = await skuAttributeAPI.getMappings(skuId);
            setCurrentMappings(mappings);
        } catch (error) {
            console.error('Failed to load mappings');
        }
    };

    const handleAssignAttribute = async () => {
        if (!selectedSkuId || !attributeId || !attrValue) {
            toast.error('Please select SKU, Attribute and provide a Value');
            return;
        }

        setIsLoading(true);
        try {
            let valueIdToAssign: number;

            // 1. Check if value already exists in the fetched list
            const existingValue = availableValues.find(v => v.value === attrValue);

            if (existingValue) {
                valueIdToAssign = existingValue.id;
            } else {
                // 2. Create new Attribute Value if it doesn't exist
                const valRes = await attributeAPI.createValue({
                    attributeId: parseInt(attributeId),
                    value: attrValue
                });
                valueIdToAssign = valRes.id;
                // Update local values list so it shows up next time
                setAvailableValues(prev => [...prev, valRes]);
            }

            // 3. Map to Sku
            await skuAttributeAPI.assign({
                skuId: selectedSkuId,
                attributeValueIds: [valueIdToAssign]
            });

            toast.success('Mapped trait to variant!');
            setAttrValue('');
            loadMappings(selectedSkuId);
        } catch (error: any) {
            console.error("Assign error:", error);
            toast.error(error.response?.data?.message || 'Failed to assign attribute');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnassignAttribute = async (valueId: number) => {
        if (!selectedSkuId) return;
        setIsLoading(true);
        try {
            await skuAttributeAPI.unassign(selectedSkuId, valueId);
            toast.success('Trait removed');
            loadMappings(selectedSkuId);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to remove trait');
        } finally {
            setIsLoading(false);
        }
    };

    const [isCreatingAttr, setIsCreatingAttr] = useState(false);
    const [newAttrName, setNewAttrName] = useState('');

    const handleQuickCreateAttribute = async () => {
        if (!newAttrName) return;
        setIsLoading(true);
        try {
            const res = await attributeAPI.create({ name: newAttrName, type: 'TEXT' });
            toast.success('New Category Attribute created');
            setAvailableAttributes(prev => [...prev, res]);
            setAttributeId(res.id.toString());
            setNewAttrName('');
            setIsCreatingAttr(false);
        } catch (error) {
            toast.error('Failed to create attribute');
        } finally {
            setIsLoading(false);
        }
    };

    // --- STAGE 4: IMAGES ---
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!savedProductId || !e.target.files) return;

        const newFiles = Array.from(e.target.files);
        const newItems = newFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            progress: 0,
            status: 'uploading' as const,
            primary: false
        }));

        setGallery(prev => [...prev, ...newItems]);

        // Sequential auto-upload for better UX with progress
        for (let i = 0; i < newItems.length; i++) {
            const item = newItems[i];
            try {
                const res = await productImageAPI.upload(
                    savedProductId,
                    item.file!,
                    false, // Default not primary
                    (percent) => {
                        setGallery(prev => {
                            const next = [...prev];
                            const idx = next.findIndex(x => x.preview === item.preview);
                            if (idx !== -1) next[idx].progress = percent;
                            return next;
                        });
                    }
                );

                setGallery(prev => {
                    const next = [...prev];
                    const idx = next.findIndex(x => x.preview === item.preview);
                    if (idx !== -1) {
                        next[idx].status = 'done';
                        next[idx].id = res.data.id;
                        next[idx].progress = 100;
                    }
                    return next;
                });
            } catch (error) {
                setGallery(prev => {
                    const next = [...prev];
                    const idx = next.findIndex(x => x.preview === item.preview);
                    if (idx !== -1) next[idx].status = 'error';
                    return next;
                });
                toast.error(`Failed to upload ${item.file?.name}`);
            }
        }
    };

    const handleSetPrimaryImage = async (id: number) => {
        setIsLoading(true);
        try {
            await productImageAPI.setPrimary(id);
            setGallery(prev => prev.map(img => ({
                ...img,
                primary: img.id === id
            })));
            toast.success('Primary image updated');
        } catch (error) {
            toast.error('Failed to update primary image');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteGalleryImage = async (index: number) => {
        const item = gallery[index];
        if (item.id) {
            if (!confirm('Are you sure you want to delete this image?')) return;
            setIsLoading(true);
            try {
                await productImageAPI.delete(item.id);
                setGallery(prev => prev.filter((_, i) => i !== index));
                toast.success('Image removed');
            } catch (error) {
                toast.error('Failed to remove image');
            } finally {
                setIsLoading(false);
            }
        } else {
            setGallery(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleFinalSubmit = async () => {
        if (!savedProductId) return;
        // Verify we have at least one image if required (optional)
        if (gallery.length === 0) {
            toast.error('Please upload at least one image');
            return;
        }

        // Ensure at least one is primary
        const hasPrimary = gallery.some(g => g.primary);
        if (!hasPrimary && gallery.length > 0 && gallery[0].id) {
            await handleSetPrimaryImage(gallery[0].id!);
        }

        toast.success('Product fully setup!');
        router.push('/suraj-yuvraj-zimpy-admin/products');
    };

    return (
        <div className="p-6 max-full mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? 'Edit Product' : 'Create New Product'}
                    </h1>
                    <p className="text-gray-500">Atomic setup ensures data integrity across variants</p>
                </div>
                <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button variant="outline" onClick={() => router.push('/suraj-yuvraj-zimpy-admin/products/attributes')}>Attributes</Button>
            </div>

            {/* Stepper UI */}
            <div className="grid grid-cols-4 gap-4 mb-8 ">
                {[
                    { id: 'basic', icon: Info, label: '1. Basic' },
                    { id: 'skus', icon: LayoutGrid, label: '2. Variants' },
                    { id: 'attributes', icon: Settings2, label: '3. Traits' },
                    { id: 'images', icon: ImageIcon, label: '4. Gallery' }
                ].map((s, idx) => {
                    const stages = ['basic', 'skus', 'attributes', 'images'];
                    const isActive = currentStage === s.id;
                    const isDone = (stages.indexOf(currentStage as any) > idx) || (isEdit && s.id !== 'images');

                    return (
                        <div
                            key={s.id}
                            onClick={() => {
                                if (isDone || isActive || (savedProductId && stages.indexOf(s.id as any) <= stages.indexOf(currentStage as any) + 1)) {
                                    setCurrentStage(s.id as FormStage);
                                }
                            }}
                            className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-green-800",
                                (isDone || isActive || (savedProductId)) ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                {isDone ? <CheckCircle2 size={16} /> : <s.icon size={16} />}
                                <span className="text-xs font-bold uppercase tracking-wider">{s.label}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* STAGE CONTENT */}
            <div className="space-y-6">

                {currentStage === 'basic' && (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-900">Product Name *</label>
                                <Input
                                    className="h-12 text-lg"
                                    placeholder="Enter product title..."
                                    value={productFormData.name}
                                    onChange={e => setProductFormData({ ...productFormData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-900">Brand *</label>
                                <Input
                                    className="h-12 text-lg"
                                    placeholder="Enter brand name..."
                                    value={productFormData.brand}
                                    onChange={e => setProductFormData({ ...productFormData, brand: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-900">Category *</label>
                                <select
                                    className="w-full h-12 px-4 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-[#10B981]/20 outline-none text-black"
                                    value={productFormData.categoryId}
                                    onChange={e => setProductFormData({ ...productFormData, categoryId: e.target.value })}
                                >
                                    <option value="">Choose category</option>
                                    {Array.isArray(categories) && categories.map(c => <option key={c.id} value={String(c.id)}>{c.name} <span className={`${c.isActive ? "text-green-600" : "text-red-600"}`}>{c.isActive ? "(Active)" : "(Inactive)"}</span></option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-900">Summary</label>
                            <Input
                                className="h-12"
                                placeholder="Short catchy tagline..."
                                value={productFormData.summary}
                                onChange={e => setProductFormData({ ...productFormData, summary: e.target.value })}
                            />
                        </div>
                        {/* Product Details Section (Replaces Description) */}
                        <div className="space-y-6 pt-4 border-t border-dashed border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <List size={20} className="text-[#10B981]" />
                                        Product Details
                                    </h3>
                                    <p className="text-xs text-gray-500">Add detailed specs (e.g. Protein, Volume, Origin)</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setProductFormData({
                                            ...productFormData,
                                            productDetails: [...productFormData.productDetails, { key: '', value: '' }]
                                        });
                                    }}
                                    className="rounded-xl border-emerald-100 hover:bg-emerald-50 text-emerald-600"
                                >
                                    <Plus size={16} className="mr-1.5" />
                                    Add Detail
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {productFormData.productDetails.map((spec, idx) => (
                                    <div key={idx} className="flex gap-4 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Label (e.g. Volume)"
                                                value={spec.key}
                                                onChange={e => {
                                                    const next = [...productFormData.productDetails];
                                                    next[idx].key = e.target.value;
                                                    setProductFormData({ ...productFormData, productDetails: next });
                                                }}
                                                className="bg-gray-50/50 border-gray-100"
                                            />
                                        </div>
                                        <div className="flex-[2]">
                                            <Input
                                                placeholder="Value (e.g. 500ml)"
                                                value={spec.value}
                                                onChange={e => {
                                                    const next = [...productFormData.productDetails];
                                                    next[idx].value = e.target.value;
                                                    setProductFormData({ ...productFormData, productDetails: next });
                                                }}
                                                className="bg-gray-50/50 border-gray-100"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setProductFormData({
                                                ...productFormData,
                                                productDetails: productFormData.productDetails.filter((_, i) => i !== idx)
                                            })}
                                            className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                {productFormData.productDetails.length === 0 && (
                                    <div className="text-center py-8 border-2 border-dashed border-gray-50 rounded-3xl">
                                        <p className="text-sm text-gray-400 italic">No details added yet. Add some specs for your users!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {savedProductId ?
                            <Button
                                className="w-full h-14 bg-[#10B981] hover:bg-[#059669] rounded-2xl text-lg font-black uppercase tracking-widest"
                                disabled={isLoading}
                                onClick={() => setCurrentStage('skus')}
                            >
                                {isLoading ? <Loader2 className="animate-spin uppercase" /> : 'Continue'}
                            </Button>
                            : ""}

                        <Button
                            className="w-full h-14 bg-[#10B981] hover:bg-[#059669] rounded-2xl text-lg font-black uppercase tracking-widest"
                            onClick={handleSaveBasicInfo}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin uppercase" /> : savedProductId ? 'Update' : 'Create Base Record'}
                        </Button>
                    </div>
                )}

                {currentStage === 'skus' && (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">Add Variations (SKUs)</h2>
                            <Button variant="outline" onClick={addSkuRow} className="rounded-xl">
                                <Plus size={18} className="mr-2" /> New Variant
                            </Button>
                        </div>
                        {skuForms.map((sku, idx) => (
                            <div key={idx} className="relative group p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                {skuForms.length > 1 && (
                                    <button
                                        onClick={() => removeSkuRow(idx)}
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-white text-red-500 rounded-full border border-red-50 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-50"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
                                    <div className="space-y-2 ">
                                        <label className="text-[11px] font-black text-gray-400 uppercase">Cost Price (₹)</label>
                                        <Input
                                            type="number"
                                            value={sku.costPrice}
                                            onChange={e => {
                                                const next = [...skuForms];
                                                next[idx].costPrice = parseFloat(e.target.value);
                                                setSkuForms(next);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase">Sale Price (₹)</label>
                                        <Input
                                            type="number"
                                            value={sku.price}
                                            onChange={e => {
                                                const next = [...skuForms];
                                                next[idx].price = parseFloat(e.target.value);
                                                setSkuForms(next);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase">MRP (₹)</label>
                                        <Input
                                            type="number"
                                            value={sku.mrp}
                                            onChange={e => {
                                                const next = [...skuForms];
                                                next[idx].mrp = parseFloat(e.target.value);
                                                setSkuForms(next);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase">Initial Stock</label>
                                        <Input
                                            type="number"
                                            value={sku.stock}
                                            onChange={e => {
                                                const next = [...skuForms];
                                                next[idx].stock = parseInt(e.target.value);
                                                setSkuForms(next);
                                            }}
                                        />
                                    </div>
                                    <div className="">
                                        <Button
                                            className="w-full h-12 bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs"
                                            onClick={() => handleSkus(idx)}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : sku.id ? 'update' : 'add'}
                                        </Button>
                                    </div>

                                </div>

                            </div>
                        ))}
                        <Button
                            className="w-full h-14 bg-black text-white rounded-2xl font-black uppercase tracking-widest"
                            onClick={() => {
                                if (savedSkus.length === 0 && skuForms.some(s => !s.id)) {
                                    toast.error('Please add at least one variant before continuing');
                                    return;
                                }
                                setCurrentStage('attributes');
                            }}
                            disabled={isLoading}
                        >
                            continue
                        </Button>
                    </div>
                )}

                {currentStage === 'attributes' && (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-bold">Configure Variant Traits</h2>
                            <p className="text-sm text-gray-500">Map specific attributes like 'Color' or 'Size' to each variation</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start p-6 bg-gray-50 rounded-3xl">
                            <div className="space-y-3">
                                <label className="text-sm font-bold flex items-center justify-between">
                                    1. Select Variation
                                    <span className="text-[10px] text-gray-400 font-normal">Active Selection</span>
                                </label>
                                <select
                                    className="w-full h-12 px-4 bg-white border border-gray-100 rounded-xl outline-none text-black ring-emerald-500/20 focus:ring-2"
                                    onChange={e => setSelectedSkuId(parseInt(e.target.value))}
                                    value={selectedSkuId || ''}
                                >
                                    <option value="">Pick SKU...</option>
                                    {Array.isArray(savedSkus) && savedSkus.map(s => (
                                        <option key={s.id} value={s.id}>SKU ID: {s.id} (₹{s.price})</option>
                                    ))}
                                </select>

                                {/* Current Mappings Display */}
                                {selectedSkuId && (
                                    <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-100 min-h-[100px]">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 px-1">Active Traits</p>
                                        <div className="flex flex-wrap gap-2">
                                            {currentMappings.length > 0 ? currentMappings.map((m, idx) => (
                                                <div key={idx} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-emerald-100">
                                                    <span>{m.attributeValue?.attribute?.name}:</span>
                                                    <span>{m.attributeValue?.value}</span>
                                                    <button
                                                        onClick={() => handleUnassignAttribute(m.attributeValue.id)}
                                                        className="hover:text-red-500 transition-colors ml-1"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            )) : (
                                                <p className="text-[11px] text-gray-400 italic py-2 px-1">No traits mapped yet</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold">2. Link Values</label>
                                        <button
                                            onClick={() => setIsCreatingAttr(!isCreatingAttr)}
                                            className="text-[10px] font-bold text-emerald-600 uppercase hover:underline"
                                        >
                                            {isCreatingAttr ? 'Cancel' : '+ New Category Trait'}
                                        </button>
                                    </div>

                                    {isCreatingAttr ? (
                                        <div className="flex gap-2 animate-in slide-in-from-top-2 duration-300">
                                            <Input
                                                className="h-12 bg-white"
                                                placeholder="Trait Name (e.g. Color)"
                                                value={newAttrName}
                                                onChange={e => setNewAttrName(e.target.value)}
                                            />
                                            <Button onClick={handleQuickCreateAttribute} size="sm" className="h-12 bg-black">Add</Button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <select
                                                    className="w-full h-12 px-4 bg-white border border-gray-100 rounded-xl outline-none text-black ring-emerald-500/20 focus:ring-2"
                                                    onChange={e => setAttributeId(e.target.value)}
                                                    value={attributeId}
                                                >
                                                    <option value="">Select Trait...</option>
                                                    {Array.isArray(availableAttributes) && availableAttributes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="relative">
                                                <select
                                                    className="w-full h-12 px-4 bg-white border border-gray-100 rounded-xl outline-none text-black ring-emerald-500/20 focus:ring-2 appearance-none"
                                                    onChange={e => {
                                                        if (e.target.value === 'NEW') {
                                                            const val = prompt('Enter new value:');
                                                            if (val) setAttrValue(val);
                                                        } else {
                                                            setAttrValue(e.target.value);
                                                        }
                                                    }}
                                                    value={(availableValues.some(v => v.value === attrValue)) ? attrValue : attrValue ? 'CUSTOM' : ''}
                                                    disabled={!attributeId || isValuesLoading}
                                                >
                                                    <option value="">{isValuesLoading ? 'Loading...' : 'Select Value...'}</option>
                                                    {availableValues.map(v => (
                                                        <option key={v.id} value={v.value}>{v.value}</option>
                                                    ))}
                                                    <option value="NEW" className="text-emerald-600 font-bold">+ Create New Value</option>
                                                    {attrValue && !availableValues.some(v => v.value === attrValue) && (
                                                        <option value="CUSTOM">{attrValue} (custom)</option>
                                                    )}
                                                </select>
                                                {isValuesLoading && (
                                                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                                                        <Loader2 className="animate-spin text-emerald-500" size={14} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    className="w-full h-14 bg-[#10B981] hover:bg-[#059669] rounded-2xl font-black uppercase tracking-widest flex gap-3 shadow-lg shadow-emerald-50 transition-all active:scale-95"
                                    onClick={handleAssignAttribute}
                                    disabled={isLoading || isCreatingAttr || !attrValue}
                                >
                                    <LinkIcon size={20} /> {isLoading ? <Loader2 className="animate-spin" /> : 'Link Trait to SKU'}
                                </Button>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-100">
                            <Button
                                className="w-full h-14 bg-black text-white rounded-2xl font-black uppercase tracking-widest"
                                onClick={() => setCurrentStage('images')}
                            >
                                Continue to Photo Gallery
                            </Button>
                        </div>
                    </div>
                )}

                {currentStage === 'images' && (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {gallery.map((img, idx) => (
                                <div key={idx} className={cn(
                                    "aspect-square rounded-3xl border-4 overflow-hidden relative group shadow-sm transition-all",
                                    img.primary ? "border-emerald-500  ring-4 ring-emerald-500/10" : "border-gray-50"
                                )}>
                                    <img src={img.preview} className="w-full h-full object-cover" alt="" />

                                    {/* Primary Badge */}
                                    {img.primary && (
                                        <div className="absolute top-3 left-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                            Primary
                                        </div>
                                    )}

                                    {/* Progress Overlay */}
                                    {img.status === 'uploading' && (
                                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                                            <div className="text-[10px] font-black text-gray-400 uppercase mb-2">Uploading {img.progress}%</div>
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 transition-all duration-300"
                                                    style={{ width: `${img.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Error State */}
                                    {img.status === 'error' && (
                                        <div className="absolute inset-0 bg-red-50/90 flex flex-col items-center justify-center p-4">
                                            <AlertCircle className="text-red-500 mb-1" size={24} />
                                            <span className="text-[10px] font-bold text-red-600 uppercase">Failed</span>
                                        </div>
                                    )}

                                    {/* Hover Actions */}
                                    {img.status === 'done' && (
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                            {!img.primary && (
                                                <Button
                                                    size="sm"
                                                    className="zimpy-btn-primary h-9 px-4 rounded-full text-[10px]"
                                                    onClick={() => handleSetPrimaryImage(img.id!)}
                                                >
                                                    Set Primary
                                                </Button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteGalleryImage(idx)}
                                                className="p-3 bg-white/20 hover:bg-red-500 text-white rounded-full transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <label className="aspect-square border-4 border-dashed border-emerald-50 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 transition-all hover:border-[#10B981]/30 group">
                                <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform mb-3 text-emerald-500">
                                    <Plus size={32} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Add Photos</span>
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    disabled={!savedProductId}
                                />
                            </label>
                        </div>
                        <Button
                            className="w-full h-16 bg-[#121212] hover:bg-black rounded-3xl text-xl font-black uppercase tracking-widest shadow-xl shadow-gray-200 transition-all active:scale-[0.98]"
                            onClick={handleFinalSubmit}
                            disabled={isLoading || gallery.some(g => g.status === 'uploading')}
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Finalize Product Setup'}
                        </Button>
                    </div>
                )}
            </div>

        </div>
    );
}
