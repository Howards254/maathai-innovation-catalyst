import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useUser, useUsers } from '../../contexts/UserContext';
import { supabase } from '../../lib/supabase';
import { User, MapPin, Heart, Briefcase, Users, Globe, FileText } from 'lucide-react';

const ProfileEdit: React.FC = () => {
  const { user: authUser } = useAuth();
  const { user } = useUser();
  const { updateProfile } = useUsers();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    locationCity: '',
    locationCountry: '',
    experienceLevel: 'beginner',
    availability: 'weekends',
    causes: [] as string[],
    skills: [] as string[],
    activities: [] as string[],
    lookingFor: [] as string[],
    maxDistance: 50
  });
  
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [activeSection, setActiveSection] = useState('basic');

  const causes = [
    { id: 'climate_change', label: 'Climate Change', icon: '🌡️' },
    { id: 'tree_planting', label: 'Tree Planting', icon: '🌱' },
    { id: 'conservation', label: 'Conservation', icon: '🦋' },
    { id: 'renewable_energy', label: 'Renewable Energy', icon: '⚡' },
    { id: 'waste_reduction', label: 'Waste Reduction', icon: '♻️' },
    { id: 'water_protection', label: 'Water Protection', icon: '💧' },
    { id: 'biodiversity', label: 'Biodiversity', icon: '🐾' },
    { id: 'sustainable_agriculture', label: 'Sustainable Agriculture', icon: '🌾' }
  ];

  const skills = [
    { id: 'leadership', label: 'Leadership', icon: '👑' },
    { id: 'project_management', label: 'Project Management', icon: '📋' },
    { id: 'research', label: 'Research', icon: '🔬' },
    { id: 'communication', label: 'Communication', icon: '💬' },
    { id: 'fundraising', label: 'Fundraising', icon: '💰' },
    { id: 'social_media', label: 'Social Media', icon: '📱' },
    { id: 'event_planning', label: 'Event Planning', icon: '🎉' },
    { id: 'teaching', label: 'Teaching', icon: '🎓' }
  ];

  const activities = [
    { id: 'tree_planting', label: 'Tree Planting', icon: '🌳' },
    { id: 'beach_cleanup', label: 'Beach Cleanup', icon: '🏖️' },
    { id: 'community_gardens', label: 'Community Gardens', icon: '🌻' },
    { id: 'workshops', label: 'Workshops', icon: '🛠️' },
    { id: 'research', label: 'Research', icon: '📊' },
    { id: 'awareness_campaigns', label: 'Awareness Campaigns', icon: '📢' },
    { id: 'mentoring', label: 'Mentoring', icon: '🤝' },
    { id: 'organizing_events', label: 'Organizing Events', icon: '📅' }
  ];

  const lookingForOptions = [
    { id: 'teammates', label: 'Teammates', icon: '👥' },
    { id: 'volunteers', label: 'Volunteers', icon: '🙋' },
    { id: 'mentors', label: 'Mentors', icon: '👨🏫' },
    { id: 'mentees', label: 'Mentees', icon: '👨🎓' },
    { id: 'collaborators', label: 'Collaborators', icon: '🤝' },
    { id: 'friends', label: 'Friends', icon: '👫' }
  ];

  useEffect(() => {
    if (user) {
      // Load existing profile data from database
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!authUser?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setFormData({
          fullName: data.full_name || '',
          username: data.username || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          locationCity: data.location?.split(',')[0]?.trim() || '',
          locationCountry: data.location?.split(',')[1]?.trim() || '',
          experienceLevel: data.experience_level || 'beginner',
          availability: data.availability || 'weekends',
          causes: data.interests || [], // Load interests as causes
          skills: data.goals?.filter((g: string) => skills.some(s => s.id === g)) || [], // Filter goals that are skills
          activities: data.goals?.filter((g: string) => activities.some(a => a.id === g)) || [], // Filter goals that are activities
          lookingFor: data.social_preferences || [], // Load social preferences
          maxDistance: data.max_distance_km || 50
        });
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const handleArrayToggle = (field: keyof typeof formData, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const checkUsernameAvailability = async (username: string) => {
    if (username === user?.username) return true; // Same username is OK
    if (!username || username.length < 3) return false;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();
      
      return !data; // Available if no data found
    } catch (error) {
      return true; // Assume available if profiles table doesn't exist
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username
    if (formData.username.length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setLoading(true);
    setUsernameError('');
    
    try {
      // Check username availability if changed
      if (formData.username !== user?.username) {
        const isAvailable = await checkUsernameAvailability(formData.username);
        if (!isAvailable) {
          setUsernameError('Username is already taken');
          setLoading(false);
          return;
        }
      }

      // Update Supabase profiles table with all fields including matchmaking data
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          username: formData.username,
          bio: formData.bio,
          location: `${formData.locationCity}, ${formData.locationCountry}`.trim().replace(/^,\s*|,\s*$/g, ''),
          interests: formData.causes, // Environmental causes as interests
          social_preferences: formData.lookingFor, // Social preferences (what they're looking for)
          goals: [...formData.skills, ...formData.activities], // Skills and activities as goals
          latitude: null, // Will be set later via geocoding if needed
          longitude: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id);
      
      if (error) throw error;
      
      // Update user causes, skills, and activities in separate tables if they exist
      // For now, we'll store them in the looking_for field as a combined array
      
      toast.success('Profile updated successfully!');
      navigate(`/app/profile/${formData.username}`);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clean username input
    if (name === 'username') {
      const cleanValue = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
      setUsernameError('');
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'interests', label: 'Interests', icon: Heart },
    { id: 'skills', label: 'Skills & Activities', icon: Briefcase },
    { id: 'social', label: 'Social', icon: Users }
  ];

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600 text-sm mt-1">Update your environmental profile and preferences</p>
            </div>
            <button
              onClick={() => navigate(`/app/profile/${user?.username}`)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-32">
              <nav className="space-y-2">
                {sections.map(section => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeSection === section.id
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {section.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                {/* Profile Picture Section */}
                <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-200">
                  <img 
                    src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'User')}&background=10b981&color=fff&size=200`} 
                    alt={formData.fullName}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-100"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{formData.fullName || 'Your Name'}</h3>
                    <p className="text-sm text-gray-500">Avatar is automatically generated from your name</p>
                    <p className="text-xs text-gray-400 mt-1">Update your name to change your avatar</p>
                  </div>
                </div>

                {/* Basic Information */}
                {activeSection === 'basic' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-green-600 mb-4">
                      <User className="w-5 h-5" />
                      <h2 className="text-lg font-semibold">Basic Information</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username *
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={handleChange}
                          name="username"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            usernameError ? 'border-red-500' : 'border-gray-300'
                          }`}
                          required
                          minLength={3}
                        />
                        {usernameError && (
                          <p className="text-xs text-red-500 mt-1">{usernameError}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Letters, numbers, and underscores only</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Tell us about yourself and your environmental interests..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                )}

                {/* Location & Experience */}
                {activeSection === 'location' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-green-600 mb-4">
                      <MapPin className="w-5 h-5" />
                      <h2 className="text-lg font-semibold">Location & Experience</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.locationCity}
                          onChange={(e) => setFormData(prev => ({ ...prev, locationCity: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Your city"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          value={formData.locationCountry}
                          onChange={(e) => setFormData(prev => ({ ...prev, locationCountry: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Your country"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Experience Level
                        </label>
                        <select
                          value={formData.experienceLevel}
                          onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="beginner">🌱 Beginner</option>
                          <option value="intermediate">🌿 Intermediate</option>
                          <option value="advanced">🌳 Advanced</option>
                          <option value="expert">🏆 Expert</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Availability
                        </label>
                        <select
                          value={formData.availability}
                          onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="weekdays">Weekdays</option>
                          <option value="weekends">Weekends</option>
                          <option value="evenings">Evenings</option>
                          <option value="flexible">Flexible</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum distance for matches: {formData.maxDistance} km
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="500"
                        value={formData.maxDistance}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>5 km</span>
                        <span>500 km</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Environmental Causes */}
                {activeSection === 'interests' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-green-600 mb-4">
                      <Heart className="w-5 h-5" />
                      <h2 className="text-lg font-semibold">Environmental Causes</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {causes.map(cause => (
                        <button
                          key={cause.id}
                          type="button"
                          onClick={() => handleArrayToggle('causes', cause.id)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            formData.causes.includes(cause.id)
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <div className="text-2xl mb-2">{cause.icon}</div>
                          <div className="text-sm font-medium">{cause.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills & Activities */}
                {activeSection === 'skills' && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-2 text-green-600 mb-4">
                      <Briefcase className="w-5 h-5" />
                      <h2 className="text-lg font-semibold">Skills & Activities</h2>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Your Skills</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {skills.map(skill => (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => handleArrayToggle('skills', skill.id)}
                            className={`p-3 rounded-lg border text-sm transition-all ${
                              formData.skills.includes(skill.id)
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-green-300'
                            }`}
                          >
                            <div className="text-lg mb-1">{skill.icon}</div>
                            <div className="font-medium">{skill.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Preferred Activities</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {activities.map(activity => (
                          <button
                            key={activity.id}
                            type="button"
                            onClick={() => handleArrayToggle('activities', activity.id)}
                            className={`p-3 rounded-lg border text-sm transition-all ${
                              formData.activities.includes(activity.id)
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-green-300'
                            }`}
                          >
                            <div className="text-lg mb-1">{activity.icon}</div>
                            <div className="font-medium">{activity.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Social Preferences */}
                {activeSection === 'social' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-green-600 mb-4">
                      <Users className="w-5 h-5" />
                      <h2 className="text-lg font-semibold">What are you looking for?</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {lookingForOptions.map(option => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleArrayToggle('lookingFor', option.id)}
                          className={`p-4 rounded-lg border-2 transition-all text-center ${
                            formData.lookingFor.includes(option.id)
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <div className="text-3xl mb-2">{option.icon}</div>
                          <div className="text-sm font-medium">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex gap-4 pt-8 mt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate(`/app/profile/${user?.username}`)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 font-medium transition-all duration-200"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;