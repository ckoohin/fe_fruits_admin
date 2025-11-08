'use client';

import { ChevronRight, ChevronDown, Edit2, Trash2, Folder, FolderOpen } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  status: 'active' | 'inactive';
  children?: Category[];
}

interface CategoryTreeChildProps {
  category: Category;
  level: number;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string, hasChildren: boolean) => void;
}

export default function CategoryTreeChild({
  category,
  level,
  expandedIds,
  onToggleExpand,
  onEdit,
  onDelete
}: CategoryTreeChildProps) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedIds.has(category.id);

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2.5 px-3 hover:bg-gray-50 rounded-lg group"
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        <button
          onClick={() => hasChildren && onToggleExpand(category.id)}
          className={`w-5 h-5 flex items-center justify-center ${
            hasChildren ? 'text-gray-600 hover:text-gray-900' : 'invisible'
          }`}
        >
          {hasChildren && (
            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          )}
        </button>

        <div className="text-gray-500">
          {isExpanded ? (
            <FolderOpen className="w-5 h-5" />
          ) : (
            <Folder className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 flex items-center gap-3">
          <span className="font-medium text-gray-900">{category.name}</span>
          <span className="text-sm text-gray-500">/{category.slug}</span>
          
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              category.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {category.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
          </span>

          {hasChildren && (
            <span className="text-xs text-gray-500">
              ({category.children!.length})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
            title="Sửa"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(category.id, hasChildren || false)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {category.children!.map(child => (
            <CategoryTreeChild
              key={child.id}
              category={child}
              level={level + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}