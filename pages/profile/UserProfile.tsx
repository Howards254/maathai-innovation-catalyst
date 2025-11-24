import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUsers } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import ActivityFeed from '../../components/ActivityFeed';
import FollowButton from '../../components/FollowButton';

const UserProfile: React.FC = () => {
  const { username } = useParams();
  const { users, updateProfile } = useUsers();
  const { user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', bio: '' });
  
  // Find user and ensure it's a valid User object
  const foundUser = users.find(u => u.username === username);
  const user = foundUser || (currentUser ? {
    id: currentUser.id,
    username: currentUser.user_metadata?.username || 'user',
    fullName: currentUser.user_metadata?.full_name || 'User',
    avatarUrl: currentUser.user_metadata?.avatar_url || 'https://picsum.photos/200',
    impactPoints: currentUser.user_metadata?.impact_points || 0,
    badges: currentUser.user_metadata?.badges || [],
    role: 'user' as const
  } : null);
  
  const isOwnProfile = currentUser?.user_metadata?.username === username;
  
  if (!user) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
      </div>
    );
  }
  
  const handleEditProfile = () => {
    setEditForm({ fullName: user.fullName, bio: user.bio || '' });
    setIsEditing(true);
  };
  
  const handleSaveProfile = async () => {
    await updateProfile(editForm);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-50 min-h-full">
        {/* Header Background */}
        <div className="h-40 bg-gradient-to-r from-green-600 to-emerald-800 w-full"></div>
        
        <div className="px-6 pb-6">
            <div className="relative -mt-16 mb-6 flex flex-col sm:flex-row items-end sm:items-end gap-4">
                <img src={user.avatarUrl} alt={user.username} className="w-32 h-32 rounded-full border-4 border-white bg-white" />
                <div className="mb-1 flex-1">
                    {isEditing ? (
                        <div className="space-y-2">
                            <input 
                                type="text" 
                                value={editForm.fullName}
                                onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                                className="text-2xl font-bold bg-white border border-gray-300 rounded px-2 py-1"
                            />
                            <textarea 
                                value={editForm.bio}
                                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                placeholder="Add a bio..."
                                className="w-full text-gray-600 bg-white border border-gray-300 rounded px-2 py-1"
                                rows={2}
                            />
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{String(user.fullName || 'User')}</h1>
                            <p className="text-gray-600">@{String(user.username || 'user')}</p>
                        </div>
                    )}
                </div>
                <div className="mb-2">
                    {isOwnProfile ? (
                        isEditing ? (
                            <div className="space-x-2">
                                <button 
                                    onClick={handleSaveProfile}
                                    className="px-4 py-2 bg-primary-600 text-white font-bold rounded-full hover:bg-primary-700 transition-colors"
                                >
                                    Save
                                </button>
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleEditProfile}
                                className="px-6 py-2 bg-primary-600 text-white font-bold rounded-full hover:bg-primary-700 transition-colors shadow-sm"
                            >
                                Edit Profile
                            </button>
                        )
                    ) : (
                        <FollowButton userId={user.id} />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Stats & Badges */}
                <div className="space-y-6">
                    {/* Stats Card */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Impact Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-gray-50 rounded">
                                <div className="text-xl font-bold text-gray-900">{Number(user.impactPoints || 0).toLocaleString()}</div>
                                <div className="text-xs text-gray-500">Impact Points</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded">
                                <div className="text-xl font-bold text-gray-900">142</div>
                                <div className="text-xs text-gray-500">Trees Planted</div>
                            </div>
                        </div>
                    </div>

                    {/* Badges Card */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Badges</h3>
                        <div className="flex flex-wrap gap-2">
                            {(Array.isArray(user.badges) ? user.badges : []).map((badge, index) => (
                                <div key={index} className="px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-bold flex items-center gap-1">
                                    <span>🏆</span> {String(badge)}
                                </div>
                            ))}
                            <div className="px-3 py-1 bg-gray-50 text-gray-400 border border-gray-200 border-dashed rounded-full text-xs font-medium">
                                + 3 locked
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm min-h-[400px]">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <div className="flex gap-6">
                            <button className="text-primary-600 font-bold border-b-2 border-primary-600 pb-4 -mb-4.5">Activity</button>
                            <button className="text-gray-500 font-medium hover:text-gray-700">Campaigns</button>
                            <button className="text-gray-500 font-medium hover:text-gray-700">Discussions</button>
                        </div>
                    </div>
                    <div className="p-6">
                        <ActivityFeed user={user} />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default UserProfile;