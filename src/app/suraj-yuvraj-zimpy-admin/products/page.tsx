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
    Filter,
    List
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
    category: {
        name: string;
    };
    skus: Array<{
        price: number;
        stock: number;
        reservedStock: number;
        availableStock: number;
    }>;
    images: Array<{
        imageUrl: string;
        isPrimary: boolean;
    }>;
    productDetails: Array<{
        key: string;
        value: string;
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
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

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
                                <th className="px-6 py-4 font-semibold text-gray-600">Category</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Price (Min)</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Stock</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4">
                                            <div className="h-12 bg-gray-100 rounded"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No products found.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-gray-50/50 transition-colors cursor-pointer group/row"
                                        onClick={() => {
                                            setSelectedProduct(product);
                                            setIsDetailOpen(true);
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="w-6 h-6 text-gray-300" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 line-clamp-1 group-hover/row:text-[#10B981] transition-colors">{product.name}</p>
                                                    <p className="text-xs text-gray-500">{product.brand || 'No Brand'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                                                {product.category?.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            {product.skus?.length > 0
                                                ? formatPrice(Math.min(...product.skus.map(s => s.price)))
                                                : formatPrice(0)
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-gray-400" />
                                                <span className={cn(
                                                    "font-medium",
                                                    product.skus?.reduce((acc: number, s: any) => acc + (s.stock || 0), 0) === 0 ? "text-red-500" : "text-gray-700"
                                                )}>
                                                    {product.skus?.reduce((acc: number, s: any) => acc + (s.stock || 0), 0) || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => toggleStatus(product.id, product.active)}
                                                className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black tracking-widest transition-all",
                                                    product.active
                                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                        : "bg-red-50 text-red-600 border border-red-100"
                                                )}
                                            >
                                                {product.active ? 'ACTIVE' : 'INACTIVE'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/suraj-yuvraj-zimpy-admin/products/edit/${product.id}`}>
                                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-amber-600 border-amber-100 hover:bg-amber-50">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                                                    onClick={() => handleSoftDelete(product.id)}
                                                    title="Move to Trash"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                                <Link href={`/user/products/${product.id}`} target="_blank">
                                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
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

            {/* Product Detail Drawer */}
            {isDetailOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsDetailOpen(false)} />
                    <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                                    {selectedProduct.images?.[0] ? (
                                        <img src={selectedProduct.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-gray-300 m-4" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">{selectedProduct.name}</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">{selectedProduct.brand || 'No Brand'}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                        <span className="text-xs font-bold text-emerald-600 tracking-widest uppercase">{selectedProduct.category?.name}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsDetailOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <XCircle className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="p-4 bg-emerald-50 rounded-3xl border border-emerald-100">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Stock</p>
                                    <h4 className="text-2xl font-black text-emerald-900">
                                        {selectedProduct.skus?.reduce((acc, s) => acc + (s.stock || 0), 0)}
                                    </h4>
                                </div>
                                <div className="p-4 bg-amber-50 rounded-3xl border border-amber-100">
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Reserved</p>
                                    <h4 className="text-2xl font-black text-amber-900">
                                        {selectedProduct.skus?.reduce((acc, s) => acc + (s.reservedStock || 0), 0)}
                                    </h4>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-3xl border border-blue-100">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Available</p>
                                    <h4 className="text-2xl font-black text-blue-900">
                                        {selectedProduct.skus?.reduce((acc, s) => acc + (s.availableStock || 0), 0)}
                                    </h4>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                            <Tag size={16} className="text-emerald-500" />
                                            Product Variants (SKUs)
                                        </h3>
                                        <Link href={`/suraj-yuvraj-zimpy-admin/products/edit/${selectedProduct.id}`}>
                                            <Button variant="ghost" size="sm" className="text-xs font-bold text-[#10B981]">Manage SKUs</Button>
                                        </Link>
                                    </div>
                                    <div className="space-y-3">
                                        {selectedProduct.skus?.map((sku, idx) => (
                                            <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <p className="text-xs font-black text-gray-400 mb-1 uppercase tracking-tighter">Variant #{idx + 1}</p>
                                                        <p className="text-sm font-bold text-gray-900">{formatPrice(sku.price)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-gray-100 shadow-sm">
                                                        <Package size={14} className={sku.stock === 0 ? "text-red-400" : "text-emerald-400"} />
                                                        <span className={cn("text-xs font-black", sku.stock === 0 ? "text-red-600" : "text-gray-900")}>
                                                            {sku.stock} Total
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-50 shadow-sm">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reserved</span>
                                                        <span className="text-xs font-black text-amber-600">{sku.reservedStock} Units</span>
                                                    </div>
                                                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-50 shadow-sm">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available</span>
                                                        <span className="text-xs font-black text-blue-600">{sku.availableStock} Units</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!selectedProduct.skus || selectedProduct.skus.length === 0) && (
                                            <div className="p-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                                                <p className="text-sm font-medium text-gray-500">No variants found for this product.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Product Details Section */}
                                {selectedProduct.productDetails && selectedProduct.productDetails.length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                                            <List size={16} className="text-emerald-500" />
                                            Product Details
                                        </h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {selectedProduct.productDetails.map((detail, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl transition-colors hover:bg-gray-100/50">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">{detail.key}</span>
                                                    <span className="text-xs font-black text-gray-900">{detail.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex gap-4">
                            <Link href={`/suraj-yuvraj-zimpy-admin/products/edit/${selectedProduct.id}`} className="flex-1">
                                <Button className="w-full bg-[#10B981] hover:bg-[#059669] rounded-2xl h-12 font-bold uppercase tracking-widest text-xs">
                                    Edit Full Details
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                onClick={() => setIsDetailOpen(false)}
                                className="flex-1 rounded-2xl h-12 font-bold uppercase tracking-widest text-xs"
                            >
                                Close Overview
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
