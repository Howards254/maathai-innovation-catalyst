import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCampaigns } from '../../contexts/CampaignContext';
import MapPicker from '../../components/MapPicker';
import ImageUpload from '../../components/ImageUpload';

const CreateCampaign: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetTrees: 100,
    location: '',
    latitude: -1.2921,
    longitude: 36.8219,
    imageUrl: '',
    tags: '',
    startDate: '',
    endDate: '',
    isPublic: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { createCampaign } = useCampaigns();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.imageUrl) {
        toast.error('Please upload a campaign image');
        setLoading(false);
        return;
      }

      const campaignData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: 'active' as const
      };
      
      await createCampaign(campaignData);
      toast.success('🌳 Campaign created successfully!');
      navigate('/app/campaigns');
    } catch (err: any) {
      console.error('Campaign creation error:', err);
      const errorMsg = err?.message || 'Failed to create campaign. Please check your database setup.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'targetTrees' ? parseInt(value) || 0 : 
              name === 'isPublic' ? value === 'true' : value
    }));
  };

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              🌱 Create New Campaign
            </h1>
            <p className="text-gray-600 text-sm mt-1">Start your environmental restoration project</p>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  🏷️ Campaign Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                  placeholder="e.g., Reforest the Rift Valley"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  📝 Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                  placeholder="Describe your campaign goals, environmental impact, and how people can contribute..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  🌳 Target Trees
                </label>
                <input
                  type="number"
                  name="targetTrees"
                  value={formData.targetTrees}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  📍 Campaign Location
                </label>
                <MapPicker
                  initialPosition={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : undefined}
                  onLocationSelect={(lat, lng, address) => {
                    setFormData(prev => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                      location: address || prev.location
                    }));
                  }}
                />
                {formData.location && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <span className="font-semibold">Selected:</span> {formData.location}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  🏷️ Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="e.g., Restoration, Water, Community (comma-separated)"
                />
                <p className="text-sm text-gray-500 mt-2">Add relevant tags to help people discover your campaign</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    📅 Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    📆 End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  🌐 Campaign Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.isPublic === true 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="isPublic"
                      value="true"
                      checked={formData.isPublic === true}
                      onChange={handleChange}
                      className="mr-3 text-green-600"
                    />
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        🌐 Public Campaign
                      </div>
                      <div className="text-sm text-gray-600">Anyone can join immediately</div>
                    </div>
                  </label>
                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.isPublic === false 
                      ? 'border-purple-500 bg-purple-50 text-purple-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="isPublic"
                      value="false"
                      checked={formData.isPublic === false}
                      onChange={handleChange}
                      className="mr-3 text-purple-600"
                    />
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        🔒 Private Campaign
                      </div>
                      <div className="text-sm text-gray-600">Requires approval to join</div>
                    </div>
                  </label>
                </div>
              </div>

              <ImageUpload
                label="🖼️ Campaign Banner Image"
                folder="campaigns"
                currentImage={formData.imageUrl}
                onUploadComplete={(url) => {
                  setFormData(prev => ({ ...prev, imageUrl: url }));
                }}
              />

            </div>
            
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/app/campaigns')}
                  className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Creating Campaign...
                    </>
                  ) : (
                    <>
                      🌱 Create Campaign
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;