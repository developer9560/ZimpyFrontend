'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    ExternalLink,
    ImageIcon,
    Tag,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    BarChart2,
    XCircle,
    Package,
    Filter
} from 'lucide-react';
import api, { productsAPI } from '@/src/lib/api';
import { formatPrice } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { toast } from 'react-hot-toast';
import { cn } from '@/src/lib/utils';
import type { ApiResponse, PaginatedResponse, ProductAnalytics } from '@/src/types';

interface Product {
    id: number;
    name: string;
    slug: string;
    brand: string;
    active: boolean;
    featured: boolean;
    sale: number;
    views: number;
    categoryName: string;
    primaryImage: string;
    skus: Array<{
        id: number;
        skuCode: string;
        price: number;
        mrp: number;
        stock: number;
        attributeValues: Array<{
            name: string;
            type: string;
            value: string;
        }>;
    }>;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [hasNext, setHasNext] = useState(false);

    const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);

    useEffect(() => {
        fetchProducts(0, true);
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await productsAPI.getAnalytics();
            if (response.success) {
                setAnalytics(response.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    const fetchProducts = async (pageNum: number, reset: boolean = false) => {
        setIsLoading(true);
        try {
            const response = await api.get<ApiResponse<PaginatedResponse<Product>>>(`/admin/products?page=${pageNum}&size=10&sort=createdAt,desc`);
            const data = response.data.data;
            if (data) {
                setProducts(prev => reset ? data.content : [...prev, ...data.content]);
                setTotalElements(data.totalElements);
                setHasNext(!data.last);
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (!isLoading && hasNext) {
            fetchProducts(page + 1);
        }
    };

    const handleSoftDelete = async (id: number) => {
        if (!confirm('Move this product to trash?')) return;
        try {
            await productsAPI.softDelete(id);
            setProducts(prev => prev.filter(p => p.id !== id));
            toast.success('Product moved to trash');
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const handlePermanentDelete = async (id: number) => {
        const confirmName = prompt('This is IRREVERSIBLE. It will delete all variants and images. Type "PERMANENT" to confirm:');
        if (confirmName !== 'PERMANENT') {
            toast.error('Deletion cancelled');
            return;
        }

        try {
            await productsAPI.permanentDelete(id);
            setProducts((prev: Product[]) => prev.filter(p => p.id !== id));
            toast.success('Product and all related data purged from database');
        } catch (error) {
            toast.error('Failed to permanently delete product');
        }
    };

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            const endpoint = currentStatus ? 'deactivate' : 'activate';
            await api.patch(`/admin/products/${id}/${endpoint}`);
            setProducts((prev: Product[]) => prev.map(p =>
                p.id === id ? { ...p, active: !currentStatus } : p
            ));
            toast.success(`Product ${currentStatus ? 'deactivated' : 'activated'}`);
        } catch (error) {
            toast.error('Failed to update product status');
        }
    };
    const toggleFeatured = async (id: number, currentStatus: boolean) => {
        try {
            const endpoint = currentStatus ? 'unfeature' : 'feature';
            await api.patch(`/admin/products/${id}/${endpoint}`);
            setProducts((prev: Product[]) => prev.map(p =>
                p.id === id ? { ...p, featured: !currentStatus } : p
            ));
            toast.success(`Product ${currentStatus ? 'unfeatured' : 'featured'}`);
        } catch (error) {
            toast.error('Failed to update product status');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                    <p className="text-gray-500">Manage your catalog, stock and pricing</p>
                </div>
                <Link href="/suraj-yuvraj-zimpy-admin/products/new">
                    <Button size="lg" className="bg-[#10B981] hover:bg-[#059669]">
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Product
                    </Button>
                </Link>
            </div>

            {/* Analytics Dashboard */}
            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    {/* Total Products */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                                <Package size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Catalog</p>
                                <h3 className="text-xl font-black text-gray-900">{analytics.totalProducts}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Active Products */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Live</p>
                                <h3 className="text-xl font-black text-gray-900">{analytics.activeProducts}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Low Stock */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Low Stock</p>
                                <h3 className="text-xl font-black text-gray-900">{analytics.lowStockProducts}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Out of Stock */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-50 text-red-500 rounded-2xl group-hover:scale-110 transition-transform">
                                <XCircle size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Out of Stock</p>
                                <h3 className="text-xl font-black text-gray-900">{analytics.outOfStockProducts}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Top Category */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 text-purple-500 rounded-2xl group-hover:scale-110 transition-transform">
                                <TrendingUp size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">Main Category</p>
                                <h3 className="text-sm font-black text-gray-900 truncate">
                                    {(Object.entries(analytics.productsByCategory) as any).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A'}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Distribution Visualization */}
            {analytics && Object.keys(analytics.productsByCategory).length > 0 && (
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <BarChart2 className="text-emerald-500" size={20} />
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Category Distribution</h2>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Auto-Updated Dashboard</span>
                    </div>

                    <div className="space-y-4">
                        {(Object.entries(analytics.productsByCategory) as any)
                            .sort((a: any, b: any) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([name, count]: [string, number], idx: number) => {
                                const percentage = Math.round((count / analytics.totalProducts) * 100);
                                return (
                                    <div key={name} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-gray-700">{name}</span>
                                            <span className="font-black text-emerald-600">{count} Items ({percentage}%)</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000",
                                                    idx === 0 ? "bg-emerald-500" :
                                                        idx === 1 ? "bg-blue-500" :
                                                            idx === 2 ? "bg-purple-500" :
                                                                idx === 3 ? "bg-amber-500" : "bg-gray-400"
                                                )}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search by name or brand..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                </Button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-sm md:text-base">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600">Product</th>
                                {/* <th className="px-6 py-4 font-semibold text-gray-600">Brand</th> */}
                                <th className="px-6 py-4 font-semibold text-gray-600">Category</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Featured</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">SKUs</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Active</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Sales</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Views</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={9} className="px-6 py-4">
                                            <div className="h-12 bg-gray-100 rounded"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                                        No products found.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-gray-50/50 transition-colors group/row border-2 border-gray-100 "
                                    >
                                        {/* Product Image & Name */}
                                        <td className="px-6 py-4 border-2 ">
                                            <div className="flex items-center gap-3">
                                                <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200 shadow-sm">
                                                    {product.primaryImage ? (
                                                        <img src={product.primaryImage} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="w-6 h-6 text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 line-clamp-1 group-hover/row:text-[#10B981] transition-colors">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate"> {product.brand}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Brand */}
                                        {/* <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-700">
                                                {product.brand || 'No Brand'}
                                            </span>
                                        </td> */}

                                        {/* Category */}
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold border border-purple-100">
                                                {product.categoryName}
                                            </span>
                                        </td>

                                        {/* Featured */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                {product.featured ? (
                                                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black tracking-wider border border-amber-200 flex items-center gap-1" onClick={() => toggleFeatured(product.id, product.featured)}>
                                                        <TrendingUp className="w-3 h-3" />
                                                        YES
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-full text-[10px] font-semibold tracking-wider border border-gray-200" onClick={() => toggleFeatured(product.id, product.featured)}>
                                                        NO
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* SKUs with Details */}
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                {/* <div className="flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-gray-400" />
                                                    <span className="font-bold text-gray-900">{product.skus?.length || 0} Variants</span>
                                                </div> */}
                                                {product.skus && product.skus.length > 0 && (
                                                    <div className="space-y-1.5 max-w-xs">
                                                        {product.skus.map((sku, idx) => (
                                                            <div key={sku.id} className="p-2 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="font-semibold text-gray-700">SKU #{idx + 1}</span>
                                                                    <span className={cn(
                                                                        "px-1.5 py-0.5 rounded text-[10px] font-bold",
                                                                        sku.stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                                                    )}>
                                                                        Stock: {sku.stock}
                                                                    </span>
                                                                </div>
                                                                {sku.attributeValues && sku.attributeValues.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1 mb-1">
                                                                        {sku.attributeValues.map((attr, attrIdx) => (
                                                                            <span key={attrIdx} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium border border-blue-100">
                                                                                {attr.name}: {attr.value}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center justify-between text-[10px]">
                                                                    <span className="text-gray-500">Price: <span className="font-bold text-emerald-600">{formatPrice(sku.price)}</span></span>
                                                                    <span className="text-gray-500">MRP: <span className="font-bold text-gray-700 line-through">{formatPrice(sku.mrp)}</span></span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Active Status */}
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => toggleStatus(product.id, product.active)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all shadow-sm",
                                                    product.active
                                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                                                        : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                                )}
                                            >
                                                {product.active ? 'ACTIVE' : 'INACTIVE'}
                                            </button>
                                        </td>

                                        {/* Sales */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <BarChart2 className="w-4 h-4 text-blue-400" />
                                                <span className="font-bold text-gray-900">{product.sale}</span>
                                            </div>
                                        </td>

                                        {/* Views */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <TrendingUp className="w-4 h-4 text-purple-400" />
                                                <span className="font-bold text-gray-900">{product.views}</span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/suraj-yuvraj-zimpy-admin/products/edit/${product.id}`}>
                                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-amber-600 border-amber-200 hover:bg-amber-50">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                    onClick={() => handleSoftDelete(product.id)}
                                                    title="Move to Trash"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                                <Link href={`/user/products/${product.id}`} target="_blank">
                                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-200 hover:bg-gray-50">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {hasNext && (
                    <div className="p-4 border-t border-gray-50 flex justify-center">
                        <Button
                            variant="outline"
                            onClick={handleLoadMore}
                            disabled={isLoading}
                            className="text-[#10B981] border-[#10B981] hover:bg-emerald-50"
                        >
                            {isLoading ? 'Loading...' : 'Load More Products'}
                        </Button>
                    </div>
                )}
            </div>

            {/* Total Results Counter */}
            {!isLoading && products.length > 0 && (
                <p className="mt-4 text-xs text-gray-500 text-center font-medium">
                    Showing {products.length} of {totalElements} products
                </p>
            )}

        </div>
    );
}
