'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import CategoryTreeChild  from './CategoryTreeChild';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

interface CategoryTreeProps {
  categories: Category[];
  onDelete?: (id: number) => void;
  onToggleStatus?: (id: number, isActive: boolean) => void;
  onEdit?: (id: number) => void;
  level?: number;
}

export function CategoryTree({
  categories,
  onDelete,
  onToggleStatus,
  onEdit,
  level = 0
}: CategoryTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const toggleExpanded = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategory = (category: Category) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const indentClass = level > 0 ? `ml-${level * 4}` : '';

    return (
      <div key={category.id} className={`border-b border-gray-200 last:border-b-0 ${indentClass}`}>
        <div className="flex items-center justify-between p-4 hover:bg-gray-50">
          <div className="flex items-center space-x-3 flex-1">
            {hasChildren && (
              <button
                onClick={() => toggleExpanded(category.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
            )}
            
            {!hasChildren && <div className="w-6" />}
            
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                <Badge color={category.is_active ? 'green' : 'gray'}>
                  {category.is_active ? 'Hoạt động' : 'Ngừng hoạt động'}
                </Badge>
              </div>
              {category.description && (
                <p className="text-sm text-gray-500 mt-1">{category.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Slug: {category.slug}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onToggleStatus && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onToggleStatus(category.id, category.is_active)}
                className={category.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
              >
                {category.is_active ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Ẩn
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Hiện
                  </>
                )}
              </Button>
            )}
            
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(category.id)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Sửa
              </Button>
            )}
            
            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(category.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Xóa
              </Button>
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && category.children && (
          <div className="ml-6">
            <CategoryTreeChild
              categories={category.children}
              onDelete={
                onDelete
                  ? (id: string, hasChildren: boolean) => onDelete(Number(id))
                  : () => {}
              }
              onToggleStatus={onToggleStatus}
              onEdit={
                onEdit
                  ? (category: Category) => onEdit(category.id)
                  : () => {}
              }
              level={level + 1}
            />
          </div>
        )}
      </div>
    );
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Không có danh mục nào</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {categories.map(renderCategory)}
    </div>
  );
}