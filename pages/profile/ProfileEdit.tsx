import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUser, useUsers } from '../../contexts/UserContext';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../utils/toast';

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
    website: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: String(user.fullName || ''),
        username: String(user.username || ''),
        bio: '',
        location: '',
        website: ''
      });
    }
  }, [user]);

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
        .maybeSingle();
      
      // If error and not a "no rows" error, log it
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking username:', error);
        return true; // Assume available on error
      }
      
      return !data; // Available if no data found
    } catch (error) {
      console.error('Error checking username:', error);
      return true; // Assume available if profiles table doesn't exist
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username
    if (formData.username.length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      showToast.error('Username must be at least 3 characters long');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      showToast.error('Username can only contain letters, numbers, and underscores');
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
          showToast.error('Username is already taken');
          setLoading(false);
          return;
        }
      }

      await updateProfile(formData);
      showToast.success('Profile updated successfully!');
      navigate(`/app/profile/${formData.username}`);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      showToast.error(error?.message || 'Failed to update profile. Please try again.');
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

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6 mb-6">
            <img 
              src={user?.avatarUrl} 
              alt={user?.fullName}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h3 className="font-medium text-gray-900">{user?.fullName}</h3>
              <p className="text-sm text-gray-500">Avatar is automatically assigned</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
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
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Tell us about yourself and your environmental interests..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/app/profile/${user?.username}`)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;