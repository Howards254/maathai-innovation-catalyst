import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInnovations } from '../../contexts/InnovationContext';
import { showToast } from '../../utils/toast';

const SubmitInnovation: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Wood-Free Products' as 'Wood-Free Products' | 'DATs' | 'Other',
    fundingGoal: '',
    imageUrl: '',
    tags: '',
    businessPlan: '',
    contactEmail: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { createInnovation, hubSettings } = useInnovations();
  const navigate = useNavigate();

  if (!hubSettings.isOpen) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Submissions Closed</h2>
        <p className="text-gray-600">The Innovation Hub is currently closed for new submissions.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createInnovation({
        ...formData,
        fundingGoal: parseInt(formData.fundingGoal),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      });
      showToast.success('Innovation submitted for review successfully!');
      navigate('/app/innovation');
    } catch (error: any) {
      console.error('Failed to submit innovation:', error);
      showToast.error(error?.message || 'Failed to submit innovation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Submit Your Innovation</h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            📋 Your innovation will be reviewed by our team before being published. Focus on wood-free alternatives and deforestation-addressing technologies.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Innovation Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Bamboo Fiber Building Materials"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe your innovation, its environmental impact, and how it addresses deforestation..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Wood-Free Products">Wood-Free Products</option>
                <option value="DATs">Deforestation Addressing Technologies</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Funding Goal ($)</label>
              <input
                type="number"
                name="fundingGoal"
                value={formData.fundingGoal}
                onChange={handleChange}
                min="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="50000"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Bamboo, Construction, Sustainable, Eco-friendly"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Plan / Implementation Strategy</label>
            <textarea
              name="businessPlan"
              value={formData.businessPlan}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe your business model, implementation timeline, market analysis, and how you plan to scale..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Image URL (optional)</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for a default image</p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/app/innovation')}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitInnovation;