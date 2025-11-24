import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../../contexts/EventContext';
import { showToast } from '../../utils/toast';

const CreateEvent: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'In-Person' as 'Online' | 'In-Person',
    maxAttendees: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { createEvent } = useEvents();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createEvent({
        ...formData,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined
      });
      showToast.success('Event submitted for review successfully!');
      navigate('/app/events');
    } catch (error: any) {
      console.error('Failed to create event:', error);
      showToast.error(error?.message || 'Failed to create event. Please try again.');
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
    <div className="bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              🎨 Create New Event
            </h1>
            <p className="text-gray-600 text-sm mt-1">Organize environmental events and bring the community together</p>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="text-2xl">📋</div>
            <p className="text-yellow-800 text-sm">
              Your event will be submitted for admin review and approval before being published.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  🏷️ Event Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                  placeholder="e.g., Community Tree Planting Day"
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
                  placeholder="Describe your event goals, activities, and what participants can expect..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    📅 Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    ⏰ Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  📍 Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="e.g., Central Park, Nairobi or Online via Zoom"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    🌐 Event Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.type === 'In-Person' 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="type"
                        value="In-Person"
                        checked={formData.type === 'In-Person'}
                        onChange={handleChange}
                        className="mr-3 text-green-600"
                      />
                      <div>
                        <div className="font-semibold">🏢 In-Person</div>
                      </div>
                    </label>
                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.type === 'Online' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="type"
                        value="Online"
                        checked={formData.type === 'Online'}
                        onChange={handleChange}
                        className="mr-3 text-blue-600"
                      />
                      <div>
                        <div className="font-semibold">💻 Online</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    👥 Max Attendees
                  </label>
                  <input
                    type="number"
                    name="maxAttendees"
                    value={formData.maxAttendees}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Leave empty for unlimited"
                  />
                  <p className="text-sm text-gray-500 mt-2">Optional capacity limit</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  🖼️ Event Image
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                  💡 Leave empty for a beautiful auto-generated image
                </p>
              </div>

            </div>
            
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/app/events')}
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
                      Creating Event...
                    </>
                  ) : (
                    <>
                      🎨 Submit for Review
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

export default CreateEvent;