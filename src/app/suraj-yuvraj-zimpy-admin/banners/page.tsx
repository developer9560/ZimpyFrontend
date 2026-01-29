'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    ImageIcon, Plus, Trash2, Edit2, Eye, Monitor, Smartphone, Tablet,
    X, Upload, Calendar, Link as LinkIcon, MapPin, BarChart3, Power,
    PowerOff, Save, ChevronLeft, ChevronRight, Loader2, AlertCircle
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { adminAPI } from '@/src/lib/api';
import { toast } from 'react-toastify';
import { BannerAdminResponse, BannerPlacement, BannerStatus } from '@/src/types/banner';

interface BannerFormData {
    title: string;
    link: string;
    placement: BannerPlacement;
    status: BannerStatus;
    priority: number;
    startDate: string;
    endDate: string;
    showDays: string;
}

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<BannerAdminResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<BannerAdminResponse | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    // Form states
    const [formData, setFormData] = useState<BannerFormData>({
        title: '',
        link: '',
        placement: BannerPlacement.HOME_TOP,
        status: BannerStatus.INACTIVE,
        priority: 1,
        startDate: '',
        endDate: '',
        showDays: '',
    });

    const [images, setImages] = useState<{
        mobile: File | null;
        tablet: File | null;
        desktop: File | null;
    }>({
        mobile: null,
        tablet: null,
        desktop: null,
    });

    const [imagePreviews, setImagePreviews] = useState<{
        mobile: string | null;
        tablet: string | null;
        desktop: string | null;
    }>({
        mobile: null,
        tablet: null,
        desktop: null,
    });

    // Fetch banners
    const fetchBanners = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await adminAPI.getBanners(currentPage, 12);
            if (response.success && response.data) {
                setBanners(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
            }
        } catch (error) {
            console.error('Failed to fetch banners:', error);
            toast.error('Failed to load banners');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchBanners();
    }, [fetchBanners]);

    // Handle image selection
    const handleImageChange = (deviceType: 'mobile' | 'tablet' | 'desktop', file: File | null) => {
        if (file) {
            setImages(prev => ({ ...prev, [deviceType]: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => ({ ...prev, [deviceType]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Create banner
    const handleCreateBanner = async () => {
        if (!formData.title || !formData.link) {
            toast.error('Title and link are required');
            return;
        }

        if (!images.mobile && !images.tablet && !images.desktop) {
            toast.error('At least one device image is required');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const formDataObj = new FormData();

            // Add JSON data
            const requestData = {
                title: formData.title,
                link: formData.link,
                placement: formData.placement,
                status: formData.status,
                priority: formData.priority,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
                showDays: formData.showDays || null,
            };

            formDataObj.append('data', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));

            // Add images
            if (images.mobile) formDataObj.append('mobileImage', images.mobile);
            if (images.tablet) formDataObj.append('tabletImage', images.tablet);
            if (images.desktop) formDataObj.append('desktopImage', images.desktop);

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const response = await adminAPI.createBanner(formDataObj);

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (response.success) {
                toast.success('Banner created successfully!');
                setShowCreateModal(false);
                resetForm();
                fetchBanners();
            }
        } catch (error: any) {
            console.error('Failed to create banner:', error);
            toast.error(error.response?.data?.message || 'Failed to create banner');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // Update banner
    const handleUpdateBanner = async () => {
        if (!selectedBanner) return;

        try {
            const response = await adminAPI.updateBanner(selectedBanner.id, formData);
            if (response.success) {
                toast.success('Banner updated successfully!');
                setShowEditModal(false);
                resetForm();
                fetchBanners();
            }
        } catch (error: any) {
            console.error('Failed to update banner:', error);
            toast.error(error.response?.data?.message || 'Failed to update banner');
        }
    };

    // Toggle status
    const handleToggleStatus = async (id: number) => {
        try {
            const response = await adminAPI.toggleBannerStatus(id);
            if (response.success) {
                toast.success('Banner status updated!');
                fetchBanners();
            }
        } catch (error: any) {
            console.error('Failed to toggle status:', error);
            toast.error('Failed to update status');
        }
    };

    // Delete banner
    const handleDeleteBanner = async (id: number) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;

        try {
            await adminAPI.deleteBanner(id);
            toast.success('Banner deleted successfully!');
            fetchBanners();
        } catch (error: any) {
            console.error('Failed to delete banner:', error);
            toast.error('Failed to delete banner');
        }
    };

    // Open edit modal
    const openEditModal = (banner: BannerAdminResponse) => {
        setSelectedBanner(banner);
        setFormData({
            title: banner.title,
            link: banner.link,
            placement: banner.placement,
            status: banner.status,
            priority: banner.priority,
            startDate: banner.startDate || '',
            endDate: banner.endDate || '',
            showDays: banner.showDays || '',
        });
        // Clear image previews so existing images show
        setImagePreviews({ mobile: null, tablet: null, desktop: null });
        setShowEditModal(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            link: '',
            placement: BannerPlacement.HOME_TOP,
            status: BannerStatus.INACTIVE,
            priority: 1,
            startDate: '',
            endDate: '',
            showDays: '',
        });
        setImages({ mobile: null, tablet: null, desktop: null });
        setImagePreviews({ mobile: null, tablet: null, desktop: null });
        setSelectedBanner(null);
    };

    // Get banner image based on device
    const getBannerImage = (banner: BannerAdminResponse) => {
        return banner.desktopUrl || banner.tabletUrl || banner.mobileUrl || null;
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
                    <p className="text-sm text-gray-500 font-medium">Control homepage visuals and promotional sliders.</p>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="zimpy-btn-primary gap-2 h-11 px-6 shadow-xl shadow-[#10B981]/20"
                >
                    <Plus size={20} />
                    <span>Create New Banner</span>
                </Button>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-2xl">
                            <ImageIcon size={24} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Banners</p>
                            <h3 className="text-xl font-black text-gray-900">{banners.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-2xl">
                            <Power size={24} className="text-green-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active</p>
                            <h3 className="text-xl font-black text-gray-900">
                                {banners.filter(b => b.status === BannerStatus.ACTIVE).length}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-50 rounded-2xl">
                            <PowerOff size={24} className="text-orange-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Paused</p>
                            <h3 className="text-xl font-black text-gray-900">
                                {banners.filter(b => b.status === BannerStatus.PAUSED).length}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 rounded-2xl">
                            <BarChart3 size={24} className="text-purple-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Clicks</p>
                            <h3 className="text-xl font-black text-gray-900">
                                {banners.reduce((sum, b) => sum + b.totalClicked, 0).toLocaleString()}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Banner Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={48} className="animate-spin text-[#10B981]" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {banners.map((banner) => (
                            <div
                                key={banner.id}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:border-[#10B981] hover:shadow-xl transition-all flex flex-col"
                            >
                                {/* Image */}
                                <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                                    {getBannerImage(banner) ? (
                                        <img
                                            src={getBannerImage(banner)!}
                                            alt={banner.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <ImageIcon size={48} className="text-gray-300" />
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-4 right-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg ${banner.status === BannerStatus.ACTIVE
                                                ? 'bg-green-500 text-white'
                                                : banner.status === BannerStatus.PAUSED
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-gray-500 text-white'
                                                }`}
                                        >
                                            {banner.status}
                                        </span>
                                    </div>

                                    {/* Hover Actions */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => handleToggleStatus(banner.id)}
                                            className="p-3 bg-white rounded-full text-gray-900 hover:bg-[#10B981] hover:text-white transition-colors"
                                            title="Toggle Status"
                                        >
                                            {banner.status === BannerStatus.ACTIVE ? <PowerOff size={18} /> : <Power size={18} />}
                                        </button>
                                        <button
                                            onClick={() => openEditModal(banner)}
                                            className="p-3 bg-white rounded-full text-gray-900 hover:bg-[#10B981] hover:text-white transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBanner(banner.id)}
                                            className="p-3 bg-white rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Banner Info */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-1">{banner.title}</h3>

                                    <div className="space-y-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <LinkIcon size={12} className="text-[#10B981]" />
                                            <span className="truncate">{banner.link}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={12} className="text-[#10B981]" />
                                            <span>{banner.placement.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <BarChart3 size={12} className="text-[#10B981]" />
                                            <span>{banner.totalClicked.toLocaleString()} clicks</span>
                                        </div>
                                    </div>

                                    {/* Device Icons */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                        <div className="flex gap-1.5">
                                            {banner.mobileUrl && (
                                                <div className="p-1.5 bg-blue-50 rounded-md text-blue-500" title="Mobile">
                                                    <Smartphone size={14} />
                                                </div>
                                            )}
                                            {banner.tabletUrl && (
                                                <div className="p-1.5 bg-purple-50 rounded-md text-purple-500" title="Tablet">
                                                    <Tablet size={14} />
                                                </div>
                                            )}
                                            {banner.desktopUrl && (
                                                <div className="p-1.5 bg-green-50 rounded-md text-green-500" title="Desktop">
                                                    <Monitor size={14} />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-gray-400">Priority: {banner.priority}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add New Card */}
                        <div
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center group cursor-pointer hover:border-[#10B981] hover:bg-green-50/10 transition-all min-h-[400px]"
                        >
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-[#10B981] shadow-sm mb-4 transition-colors">
                                <Plus size={32} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 group-hover:text-gray-900 transition-colors">
                                Add New Banner
                            </p>
                            <p className="text-[10px] text-gray-400 mt-2">Recommended: 1920x600px</p>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <Button
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-50"
                            >
                                <ChevronLeft size={18} />
                            </Button>
                            <span className="px-4 text-sm font-medium text-gray-600">
                                Page {currentPage + 1} of {totalPages}
                            </span>
                            <Button
                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={currentPage >= totalPages - 1}
                                className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-50"
                            >
                                <ChevronRight size={18} />
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                {showCreateModal ? 'Create New Banner' : 'Edit Banner'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setShowEditModal(false);
                                    resetForm();
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-4 text-black py-3 border border-gray-200 rounded-xl outline-none focus:border-[#10B981] transition-colors"
                                        placeholder="Summer Sale 50% OFF"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Link *</label>
                                    <input
                                        type="text"
                                        value={formData.link}
                                        onChange={e => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                        className="w-full text-black px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#10B981] transition-colors"
                                        placeholder="/products/summer-sale"
                                    />
                                </div>
                            </div>

                            {/* Placement and Status */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Placement</label>
                                    <select
                                        value={formData.placement}
                                        onChange={e => setFormData(prev => ({ ...prev, placement: e.target.value as BannerPlacement }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#10B981] transition-colors text-gray-900"
                                    >
                                        <option value={BannerPlacement.HOME_TOP}>Home Top</option>
                                        <option value={BannerPlacement.HOME_MIDDLE}>Home Middle</option>
                                        <option value={BannerPlacement.CATEGORY}>Category</option>
                                        <option value={BannerPlacement.PRODUCT}>Product</option>
                                        <option value={BannerPlacement.PROMOTION}>Promotion</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as BannerStatus }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#10B981] transition-colors text-gray-900"
                                    >
                                        <option value={BannerStatus.ACTIVE}>Active</option>
                                        <option value={BannerStatus.PAUSED}>Paused</option>
                                        <option value={BannerStatus.INACTIVE}>Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.priority}
                                        onChange={e => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                                        className="w-full px-4 text-black py-3 border border-gray-200 rounded-xl outline-none focus:border-[#10B981] transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Scheduling */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <Calendar size={14} className="inline mr-2" />
                                        Start Date (Optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.startDate}
                                        onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                        className="w-full text-black px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#10B981] transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <Calendar size={14} className="inline mr-2" />
                                        End Date (Optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.endDate}
                                        onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                        className="w-full px-4 text-black py-3 border border-gray-200 rounded-xl outline-none focus:border-[#10B981] transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Show Days */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Show on Days (Optional, comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.showDays}
                                    onChange={e => setFormData(prev => ({ ...prev, showDays: e.target.value }))}
                                    className="w-full px-4 text-black py-3 border border-gray-200 rounded-xl outline-none focus:border-[#10B981] transition-colors"
                                    placeholder="MON,WED,FRI"
                                />
                                <p className="text-xs text-gray-500 mt-1">Example: MON,TUE,WED (leave empty for all days)</p>
                            </div>


                            {/* Image Uploads */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <Upload size={16} />
                                        {showCreateModal ? 'Upload Banner Images *' : 'Banner Images (Click to Upload/Replace)'}
                                    </h3>
                                    <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                        <p className="text-xs font-bold text-gray-700 mb-2">📐 Recommended Sizes for Best Quality:</p>
                                        <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Smartphone size={12} className="text-blue-500" />
                                                <span><strong>Mobile:</strong> 800x800px (1:1)</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Tablet size={12} className="text-purple-500" />
                                                <span><strong>Tablet:</strong> 1200x600px (2:1)</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Monitor size={12} className="text-green-500" />
                                                <span><strong>Desktop:</strong> 1920x600px (16:5)</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-2">💡 Use WebP or JPG format, max 200KB per image</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(['mobile', 'tablet', 'desktop'] as const).map(deviceType => {
                                        const existingImage = showEditModal && selectedBanner
                                            ? deviceType === 'mobile' ? selectedBanner.mobileUrl
                                                : deviceType === 'tablet' ? selectedBanner.tabletUrl
                                                    : selectedBanner.desktopUrl
                                            : null;

                                        return (
                                            <div key={deviceType} className="space-y-2">
                                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                    {deviceType === 'mobile' && <Smartphone size={14} className="inline mr-1" />}
                                                    {deviceType === 'tablet' && <Tablet size={14} className="inline mr-1" />}
                                                    {deviceType === 'desktop' && <Monitor size={14} className="inline mr-1" />}
                                                    {deviceType}
                                                    {showEditModal && existingImage && (
                                                        <span className="ml-2 text-green-500 text-xs">✓ Uploaded</span>
                                                    )}
                                                </label>
                                                <div className="relative aspect-video border-2 border-dashed border-gray-200 rounded-xl overflow-hidden hover:border-[#10B981] transition-colors group cursor-pointer">
                                                    {imagePreviews[deviceType] || existingImage ? (
                                                        <div className="relative w-full h-full">
                                                            <img
                                                                src={imagePreviews[deviceType] || existingImage!}
                                                                alt={deviceType}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <div className="text-white text-center">
                                                                    <Upload size={24} className="mx-auto mb-1" />
                                                                    <span className="text-xs">
                                                                        {existingImage ? 'Replace Image' : 'Change'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-[#10B981] transition-colors">
                                                            <Upload size={24} />
                                                            <span className="text-xs mt-2">Click to upload</span>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                handleImageChange(deviceType, file);

                                                                if (showEditModal && selectedBanner) {
                                                                    setIsUploading(true);
                                                                    setUploadProgress(0);
                                                                    const progressInterval = setInterval(() => {
                                                                        setUploadProgress(prev => Math.min(prev + 10, 90));
                                                                    }, 150);
                                                                    try {
                                                                        const response = await adminAPI.updateBannerImage(
                                                                            selectedBanner.id,
                                                                            deviceType,
                                                                            file
                                                                        );
                                                                        clearInterval(progressInterval);
                                                                        setUploadProgress(100);
                                                                        if (response.success) {
                                                                            toast.success(`${deviceType.toUpperCase()} image updated!`);
                                                                            fetchBanners();
                                                                            if (deviceType === 'mobile') selectedBanner.mobileUrl = response.data.data.mobileUrl;
                                                                            else if (deviceType === 'tablet') selectedBanner.tabletUrl = response.data.data.tabletUrl;
                                                                            else selectedBanner.desktopUrl = response.data.data.desktopUrl;
                                                                        }
                                                                    } catch (error: any) {
                                                                        clearInterval(progressInterval);
                                                                        toast.error(`Failed to upload ${deviceType} image`);
                                                                    } finally {
                                                                        setIsUploading(false);
                                                                        setUploadProgress(0);
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                        className="absolute inset-0 opacity-0 cursor-pointer text-black"
                                                    />
                                                </div>
                                                {showEditModal && !existingImage && (
                                                    <p className="text-xs text-orange-500">No image uploaded yet</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Upload Progress */}
                            {isUploading && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-700">Uploading...</span>
                                        <span className="font-bold text-[#10B981]">{uploadProgress}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#10B981] to-green-400 transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                            <Button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setShowEditModal(false);
                                    resetForm();
                                }}
                                className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={showCreateModal ? handleCreateBanner : handleUpdateBanner}
                                disabled={isUploading}
                                className="zimpy-btn-primary px-6 py-3 gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        <span>{showCreateModal ? 'Create Banner' : 'Update Banner'}</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
