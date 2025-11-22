import React, { useState } from 'react';
import { useDiscussions } from '../contexts/DiscussionContext';

interface CreateDiscussionFormProps {
  onClose: () => void;
}

const CreateDiscussionForm: React.FC<CreateDiscussionFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General' as 'General' | 'Help' | 'Success Story' | 'Tech'
  });
  const [loading, setLoading] = useState(false);
  const { createDiscussion } = useDiscussions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createDiscussion(formData);
      onClose();
    } catch (error) {
      console.error('Failed to create discussion:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              ✨ Create New Discussion
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'General', emoji: '💬', label: 'General' },
                  { value: 'Help', emoji: '❓', label: 'Help & Support' },
                  { value: 'Success Story', emoji: '🎆', label: 'Success Story' },
                  { value: 'Tech', emoji: '💻', label: 'Technology' }
                ].map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({...formData, category: cat.value as any})}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.category === cat.value
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.emoji}</div>
                    <div className="font-medium text-sm">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-lg"
                placeholder="What's your question or topic?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                placeholder="Share your thoughts, ask questions, or tell your story..."
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? 'Posting...' : 'Post Discussion'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDiscussionForm;