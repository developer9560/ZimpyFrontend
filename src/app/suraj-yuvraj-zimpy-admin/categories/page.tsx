'use client';

import React, { useState, useEffect } from 'react';
import {
    Tag, Plus, Search, MoreVertical, Edit2, Trash2,
    Folder, FolderOpen, ChevronRight, ChevronDown, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { categoryAPI } from '@/src/lib/api';
import { CategoryTreeResponse } from '@/src/types';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Recursive Tree Item Component
const CategoryTreeItem = ({
    category,
    level = 0,
    onDelete,
    searchQuery,
    onToggleActive,
    onToggleFeatured
}: {
    category: CategoryTreeResponse,
    level?: number,
    onDelete: (id: number) => void,
    searchQuery: string,
    onToggleActive: (id: number) => void,
    onToggleFeatured: (id: number) => void
}) => {
    const [isOpen, setIsOpen] = useState(false); // Collapsible state
    const hasChildren = category.children && category.children.length > 0;

    // Auto-expand if searching matches children
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase());
    // Also check if any child matches (to keep parent expanding)
    const hasMatchingChild = (node: CategoryTreeResponse): boolean => {
        if (node.name.toLowerCase().includes(searchQuery.toLowerCase())) return true;
        if (node.children) return node.children.some(hasMatchingChild);
        return false;
    };

    const visible = !searchQuery || matchesSearch || hasMatchingChild(category);

    useEffect(() => {
        if (searchQuery && hasMatchingChild(category)) setIsOpen(true);
    }, [searchQuery]);

    if (!visible) return null;

    return (
        <>
            <tr className={`hover:bg-gray-50/50 transition-colors group border-b border-gray-50/50 ${!category.isActive ? 'bg-gray-50 opacity-75' : ''}`}>
                <td className="px-6 py-3">
                    <div
                        className="flex items-center gap-3"
                        style={{ paddingLeft: `${level * 24}px` }}
                    >
                        {hasChildren ? (
                            <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-gray-100 rounded">
                                {isOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                            </button>
                        ) : (
                            <span className="w-5.5 inline-block" /> // Spacer
                        )}

                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 shrink-0 overflow-hidden relative">
                            {category.imageUrl ? (
                                <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                            ) : (
                                <Tag size={18} className="text-gray-400" />
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-3">
                                <p className="text-sm font-semibold text-gray-900">{category.name}</p>

                                <div className="flex items-center gap-2">
                                    {/* Active Toggle */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onToggleActive(category.id); }}
                                        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none ${category.isActive ? 'bg-[#10B981]' : 'bg-gray-300'}`}
                                        title={category.isActive ? "Active (Visible)" : "Inactive (Hidden)"}
                                    >
                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${category.isActive ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                                    </button>

                                    <p className="text-xs font-medium text-gray-800 px-2 py-1 rounded-full bg-gray-50">{category.priority}</p>

                                </div>
                            </div>
                            {level > 0 && <span className="text-[10px] text-gray-400">Level {level} Subcategory</span>}
                        </div>
                    </div>
                </td>
                <td className="px-6 py-3">
                    <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded-md">{category.slug}</span>
                </td>
                <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200" title="Direct Products">
                            {category.productCount || 0} Products
                        </span>
                        {hasChildren && <span className="text-xs font-medium text-gray-400 px-2 py-1 rounded-full bg-gray-50">{category.children?.length || 0} Subs</span>}
                    </div>
                </td>
                <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                        <Link href={`/suraj-yuvraj-zimpy-admin/categories/edit/${category.id}`}>
                            <button className="p-2 text-gray-800 hover:text-[#10B981] hover:bg-[#10B981]/10 rounded-lg transition-colors" title="Edit Category">
                                <Edit2 size={16} />
                            </button>
                        </Link>
                        <button
                            onClick={() => onDelete(category.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Category"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </td>
            </tr>
            {isOpen && hasChildren && category.children.map(child => (
                <CategoryTreeItem
                    key={child.id}
                    category={child}
                    level={level + 1}
                    onDelete={onDelete}
                    searchQuery={searchQuery}
                    onToggleActive={onToggleActive}
                    onToggleFeatured={onToggleFeatured}
                />
            ))}
        </>
    );
};

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<CategoryTreeResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const data = await categoryAPI.getTree();
            setCategories(data);
        } catch (error) {
            toast.error("Failed to load categories");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? This will delete the category.")) return;
        try {
            await categoryAPI.delete(String(id));
            toast.success("Category deleted");
            fetchCategories();
        } catch (e) {
            toast.error("Failed to delete category (Ensure it has no active subcategories)");
        }
    };

    // Helper to recursively update tree state
    const updateCategoryInTree = (nodes: CategoryTreeResponse[], id: number, field: 'isActive' | 'isFeatured'): CategoryTreeResponse[] => {
        return nodes.map(node => {
            if (node.id === id) {
                return { ...node, [field]: !node[field] };
            }
            if (node.children) {
                return { ...node, children: updateCategoryInTree(node.children, id, field) };
            }
            return node;
        });
    };

    const handleToggleActive = async (id: number) => {
        // Optimistic Update
        setCategories(prev => updateCategoryInTree(prev, id, 'isActive'));
        try {
            await categoryAPI.toggleActive(id);
            toast.success("Status updated");
        } catch (error) {
            // Revert on failure
            setCategories(prev => updateCategoryInTree(prev, id, 'isActive'));
            toast.error("Failed to update status");
        }
    };

    const handleToggleFeatured = async (id: number) => {
        // Optimistic Update
        setCategories(prev => updateCategoryInTree(prev, id, 'isFeatured'));
        try {
            await categoryAPI.toggleFeatured(id);
            toast.success("Featured status updated");
        } catch (error) {
            // Revert on failure
            setCategories(prev => updateCategoryInTree(prev, id, 'isFeatured'));
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
                    <p className="text-sm text-gray-500 font-medium">Create and organize your product categories.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative group flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-400 group-focus-within:text-[#10B981] transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search categories..."
                            className="w-full pl-10 pr-4 py-2.5 h-11 border border-gray-200 rounded-xl outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/10 transition-all font-medium text-sm text-gray-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Link href="/suraj-yuvraj-zimpy-admin/categories/new">
                        <Button className="zimpy-btn-primary gap-2 h-11 px-6 shadow-xl shadow-[#10B981]/20 w-full sm:w-auto">
                            <Plus size={20} />
                            <span>Add New Category</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Content List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Category Hierarchy
                    </p>
                    {/* Collapsing controls could go here, but search handles expansion nicely. */}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-[45%]">Name</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Slug</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Stats</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500">Loading hierarchy...</td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500">No categories found. Create one to get started.</td>
                                </tr>
                            ) : (
                                categories.map(cat => (
                                    <CategoryTreeItem
                                        key={cat.id}
                                        category={cat}
                                        onDelete={handleDelete}
                                        searchQuery={searchQuery}
                                        onToggleActive={handleToggleActive}
                                        onToggleFeatured={handleToggleFeatured}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
