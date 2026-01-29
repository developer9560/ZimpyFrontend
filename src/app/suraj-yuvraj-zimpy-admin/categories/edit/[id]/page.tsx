'use client';

import CategoryFormPage from '@/src/components/admin/CategoryFormPage';
import { categoryAPI } from '@/src/lib/api';
import { CategoryResponse } from '@/src/types';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function EditCategoryPage() {
    const params = useParams();
    const [category, setCategory] = useState<CategoryResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch specific category details? 
        // API.getTree returns whole tree. We might need findById.
        // Backend 'findById' exists in Service? Step 1502: findById calls mapToResponse.
        // But Controller? Step 1445: CategoryUserController 'findbyId'.
        // Admin Controller? It might not expose GET /id?
        // Let's use User's /categories/id if needed, or assume we can find it in tree.
        // But finding in tree is okay.

        // Let's implement fetchById if api.ts doesn't have it.
        // api.ts only has getTree.
        // We can add getById or traverse tree. Traversing tree ensures we have hierarchy too.

        const load = async () => {
            try {
                // Since we need to pre-fill, finding usually best by ID.
                // But wait, api.ts categoryAPI.getTree() is defined.
                // Let's assume we traverse tree to find match for simple edit.
                const tree = await categoryAPI.getTree();

                const findInTree = (nodes: any[], id: number): any => {
                    for (const node of nodes) {
                        if (node.id === id) return node;
                        if (node.children) {
                            const found = findInTree(node.children, id);
                            if (found) return found;
                        }
                    }
                    return null;
                };

                const found = findInTree(tree, Number(params.id));
                // Map tree response to simple response
                if (found) {
                    setCategory({
                        id: found.id,
                        name: found.name,
                        slug: found.slug,
                        level: found.level,
                        imageUrl: found.imageUrl,
                        isActive: found.isActive,
                        priority: found.priority
                    });
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [params.id]);

    if (loading) return <div>Loading...</div>;
    if (!category) return <div>Category not found</div>;

    return <CategoryFormPage initialData={category} />;
}
