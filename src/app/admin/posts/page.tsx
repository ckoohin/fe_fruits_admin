'use client';
import React, { useState, useEffect } from 'react';
import PostHeader, { PostTable } from '@/components/posts/PostLayout';
import PostModal from '@/components/posts/PostModel';
import { usePosts } from '@/hooks/usePost';
import { Post, CreatePostRequest } from '@/types/post';

export default function PostsPage() {
  const {
    posts,
    categories,
    loading,
    currentPage,
    searchQuery,
    filteredPosts,
    currentPosts,
    totalPages,
    itemsPerPage,
    xlsxLoaded,
    setSearchQuery,
    setCurrentPage,
    deletePost,
    createPost,
    updatePost,
    handleExportExcel,
    handleImportExcel,
  } = usePosts();

  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<CreatePostRequest>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category_id: '',
    is_published: false,
    published_at: new Date().toISOString(),
    tags: [],
  });

  const resetForm = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      category_id: '',
      is_published: false,
      published_at: new Date().toISOString(),
      tags: [],
    });
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      content: post.content || '',
      excerpt: post.excerpt || '',
      category_id: post.category_id || '',
      is_published: post.is_published || false,
      published_at: post.published_at || new Date().toISOString(),
      tags: [], // Cần lấy từ API nếu có quan hệ
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSend = { ...formData, tags: formData.tags || [] };
    const success = editingPost
      ? await updatePost(editingPost.id, { title: dataToSend.title, is_featured: dataToSend.is_published, tags: dataToSend.tags })
      : await createPost(dataToSend);

    if (success) {
      setShowModal(false);
      resetForm();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      category_id: e.target.value,
    }));
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <PostHeader
          totalCount={posts.length}
          filteredCount={filteredPosts.length}
          searchQuery={searchQuery}
          onSearchChange={(query) => setSearchQuery(query)}
          onImport={handleImportExcel}
          onExport={handleExportExcel}
          onAdd={() => {
            resetForm();
            setShowModal(true);
          }}
          xlsxLoaded={xlsxLoaded}
        />

        <PostTable
          posts={currentPosts}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deletePost}
        />

        <div className="p-4 flex justify-between items-center border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600 font-medium">
            Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredPosts.length)} của {filteredPosts.length} bài viết
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-white'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <PostModal
        showModal={showModal}
        editingPost={editingPost}
        formData={formData}
        categories={categories}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
        onCategoryChange={handleCategoryChange}
      />
    </div>
  );
}