'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Settings2,
    Search,
    Loader2,
    ChevronRight,
    Tag,
    Layers,
    X,
    Check
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { toast } from 'react-hot-toast';
import { attributeAPI } from '@/src/lib/api';
import { cn } from '@/src/lib/utils';
import type { Attribute, AttributeValue, AttributeType } from '@/src/types/attribute';

export default function AttributesPage() {
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Attribute Form Modal State
    const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
    const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);
    const [attrFormData, setAttrFormData] = useState<{ name: string; type: AttributeType }>({
        name: '',
        type: 'TEXT'
    });

    // Attribute Values State
    const [selectedAttr, setSelectedAttr] = useState<Attribute | null>(null);
    const [attrValues, setAttrValues] = useState<AttributeValue[]>([]);
    const [isValuesLoading, setIsValuesLoading] = useState(false);
    const [newValue, setNewValue] = useState('');
    const [editingValueId, setEditingValueId] = useState<number | null>(null);
    const [editingValueText, setEditingValueText] = useState('');

    useEffect(() => {
        fetchAttributes();
    }, []);

    const fetchAttributes = async () => {
        setIsLoading(true);
        try {
            const data = await attributeAPI.getAll();
            setAttributes(data || []);
        } catch (error) {
            toast.error('Failed to load attributes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveAttribute = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!attrFormData.name) {
            toast.error('Attribute name is required');
            return;
        }

        setIsLoading(true);
        try {
            if (editingAttr) {
                await attributeAPI.update(editingAttr.id, attrFormData);
                toast.success('Attribute updated');
            } else {
                await attributeAPI.create(attrFormData);
                toast.success('Attribute created');
            }
            fetchAttributes();
            setIsAttrModalOpen(false);
            setEditingAttr(null);
            setAttrFormData({ name: '', type: 'TEXT' });
        } catch (error) {
            toast.error('Failed to save attribute');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAttribute = async (id: number) => {
        if (!confirm('Are you sure? This will delete all mapped values.')) return;
        setIsLoading(true);
        try {
            await attributeAPI.delete(id);
            toast.success('Attribute deleted');
            if (selectedAttr?.id === id) setSelectedAttr(null);
            fetchAttributes();
        } catch (error) {
            toast.error('Failed to delete attribute');
        } finally {
            setIsLoading(false);
        }
    };

    const openAttrModal = (attr?: Attribute) => {
        if (attr) {
            setEditingAttr(attr);
            setAttrFormData({ name: attr.name, type: attr.type });
        } else {
            setEditingAttr(null);
            setAttrFormData({ name: '', type: 'TEXT' });
        }
        setIsAttrModalOpen(true);
    };

    // Values Management
    const selectAttribute = async (attr: Attribute) => {
        setSelectedAttr(attr);
        setIsValuesLoading(true);
        try {
            const values = await attributeAPI.getValues(attr.id);
            setAttrValues(values || []);
        } catch (error) {
            toast.error('Failed to load values');
        } finally {
            setIsValuesLoading(false);
        }
    };

    const handleAddValue = async () => {
        if (!selectedAttr || !newValue) return;
        setIsValuesLoading(true);
        try {
            await attributeAPI.createValue({
                attributeId: selectedAttr.id,
                value: newValue
            });
            toast.success('Value added');
            setNewValue('');
            selectAttribute(selectedAttr);
        } catch (error) {
            toast.error('Failed to add value');
        } finally {
            setIsValuesLoading(false);
        }
    };

    const handleDeleteValue = async (id: number) => {
        if (!confirm('Delete this value?')) return;
        try {
            await attributeAPI.deleteValue(id);
            toast.success('Value deleted');
            if (selectedAttr) selectAttribute(selectedAttr);
        } catch (error) {
            toast.error('Failed to delete value');
        }
    };

    const startEditingValue = (val: AttributeValue) => {
        setEditingValueId(val.id);
        setEditingValueText(val.value);
    };

    const handleUpdateValue = async () => {
        if (!editingValueId || !editingValueText || !selectedAttr) return;
        try {
            await attributeAPI.updateValue(editingValueId, { value: editingValueText });
            toast.success('Value updated');
            setEditingValueId(null);
            selectAttribute(selectedAttr);
        } catch (error) {
            toast.error('Failed to update value');
        }
    };

    const filteredAttributes = attributes.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Settings2 className="text-[#10B981]" />
                        Attribute Management
                    </h1>
                    <p className="text-gray-500 text-sm">Define and manage product characteristics and variations</p>
                </div>
                <Button
                    onClick={() => openAttrModal()}
                    className="bg-black hover:bg-gray-800 text-white rounded-2xl h-12 px-6 font-bold flex items-center gap-2 transition-all active:scale-95"
                >
                    <Plus size={20} /> Add New Attribute
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Attributes List Section */}
                <div className="lg:col-span-12 xl:col-span-8 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden pb-4">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="font-bold text-gray-900">Attribute Catalog</h2>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <Input
                                    placeholder="Filter attributes..."
                                    className="pl-10 h-10 rounded-xl"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Attribute Name</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Data Type</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center">
                                                <Loader2 className="animate-spin inline-block text-[#10B981]" size={32} />
                                            </td>
                                        </tr>
                                    ) : filteredAttributes.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">
                                                No attributes found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAttributes.map((attr) => (
                                            <tr
                                                key={attr.id}
                                                className={cn(
                                                    "hover:bg-gray-50/50 transition-colors group cursor-pointer",
                                                    selectedAttr?.id === attr.id && "bg-[#10B981]/5"
                                                )}
                                                onClick={() => selectAttribute(attr)}
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-[#10B981]/10 rounded-xl flex items-center justify-center text-[#10B981]">
                                                            <Tag size={18} />
                                                        </div>
                                                        <span className="font-bold text-gray-900">{attr.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border",
                                                        attr.type === 'TEXT' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                            attr.type === 'NUMBER' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                                "bg-purple-50 text-purple-600 border-purple-100"
                                                    )}>
                                                        {attr.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-9 w-9 p-0 rounded-xl"
                                                            onClick={(e) => { e.stopPropagation(); openAttrModal(attr); }}
                                                        >
                                                            <Edit size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-9 w-9 p-0 rounded-xl text-red-500 border-red-100 hover:bg-red-50"
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteAttribute(attr.id); }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                        <div className="w-8 h-8 flex items-center justify-center text-gray-300">
                                                            <ChevronRight size={18} />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Values Panel Section */}
                <div className="lg:col-span-12 xl:col-span-4 sticky top-24">
                    {selectedAttr ? (
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-12rem)]">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-black text-white">
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-widest">Manage Values</h3>
                                    <p className="text-[11px] text-gray-400 font-bold">{selectedAttr.name}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white hover:bg-white/10 p-1"
                                    onClick={() => setSelectedAttr(null)}
                                >
                                    <X size={20} />
                                </Button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add new value..."
                                        className="h-11 rounded-1.5xl"
                                        value={newValue}
                                        onChange={(e) => setNewValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddValue()}
                                    />
                                    <Button
                                        onClick={handleAddValue}
                                        className="bg-[#10B981] hover:bg-[#059669] text-white w-11 h-11 p-0 rounded-1.5xl flex-shrink-0"
                                    >
                                        <Plus size={20} />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-3 no-scrollbar">
                                {isValuesLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="animate-spin text-[#10B981]" />
                                    </div>
                                ) : attrValues.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <Layers className="mx-auto mb-2 opacity-20" size={48} />
                                        <p className="text-xs">No values defined yet</p>
                                    </div>
                                ) : (
                                    attrValues.map((val) => (
                                        <div
                                            key={val.id}
                                            className="group flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#10B981]/30 transition-all"
                                        >
                                            {editingValueId === val.id ? (
                                                <div className="flex items-center gap-2 w-full">
                                                    <Input
                                                        className="h-9 rounded-lg bg-white"
                                                        value={editingValueText}
                                                        onChange={(e) => setEditingValueText(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <Button
                                                        size="sm"
                                                        className="h-9 w-9 p-0 bg-[#10B981]"
                                                        onClick={handleUpdateValue}
                                                    >
                                                        <Check size={16} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 w-9 p-0"
                                                        onClick={() => setEditingValueId(null)}
                                                    >
                                                        <X size={16} />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="font-bold text-gray-700">{val.value}</span>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => startEditingValue(val)}
                                                            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteValue(val.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2rem] border border-gray-100 border-dashed p-12 text-center shadow-sm">
                            <Layers className="mx-auto mb-4 text-gray-200" size={64} />
                            <h3 className="text-gray-900 font-bold mb-1">Manage Values</h3>
                            <p className="text-gray-400 text-xs max-w-[200px] mx-auto">Select an attribute from the catalog to manage its possible values</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Attribute Create/Edit */}
            {isAttrModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAttrModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 pb-0 flex items-center justify-between">
                            <h2 className="text-xl font-black text-gray-900">
                                {editingAttr ? 'Edit Attribute' : 'New Attribute'}
                            </h2>
                            <Button variant="ghost" onClick={() => setIsAttrModalOpen(false)} className="rounded-full p-2">
                                <X size={24} />
                            </Button>
                        </div>

                        <form onSubmit={handleSaveAttribute} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Attribute Name</label>
                                <Input
                                    className="h-14 rounded-2xl text-lg font-bold"
                                    placeholder="e.g. Color, Material, Size"
                                    value={attrFormData.name}
                                    onChange={(e) => setAttrFormData({ ...attrFormData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Data Type</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['TEXT', 'NUMBER', 'ENUM'] as AttributeType[]).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setAttrFormData({ ...attrFormData, type })}
                                            className={cn(
                                                "h-12 rounded-xl text-[11px] font-black tracking-widest transition-all border",
                                                attrFormData.type === type
                                                    ? "bg-black text-white border-black shadow-lg shadow-gray-200"
                                                    : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"
                                            )}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full h-14 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-emerald-100 transition-all active:scale-[0.98]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : editingAttr ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
