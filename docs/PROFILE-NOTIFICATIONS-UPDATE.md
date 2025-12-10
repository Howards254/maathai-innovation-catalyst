# Profile & Notifications Update Guide

## 1. Run Database Migration
Run `database-notifications-system.sql` in Supabase SQL Editor to create notifications table.

## 2. Add NotificationProvider to App.tsx
```tsx
import { NotificationProvider } from './contexts/NotificationContext';

// Wrap your app with NotificationProvider after AuthProvider
<AuthProvider>
  <NotificationProvider>
    {/* rest of app */}
  </NotificationProvider>
</AuthProvider>
```

## 3. Update Navbar - Add Notification Bell

Add to imports:
```tsx
import { useNotifications } from '../../contexts/NotificationContext';
import { Bell } from 'lucide-react';
```

Add state:
```tsx
const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
const [showNotifications, setShowNotifications] = useState(false);
```

Add notification bell before user dropdown (around line 160):
```tsx
{/* Notification Bell - Desktop */}
<div className="hidden md:block relative">
  <button
    onClick={() => setShowNotifications(!showNotifications)}
    className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
  >
    <Bell className="w-5 h-5" />
    {unreadCount > 0 && (
      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    )}
  </button>

  {/* Notifications Dropdown */}
  {showNotifications && (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            Mark all read
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No notifications yet</p>
        </div>
      ) : (
        notifications.map(notif => (
          <div
            key={notif.id}
            onClick={() => {
              markAsRead(notif.id);
              if (notif.link) navigate(notif.link);
              setShowNotifications(false);
            }}
            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              !notif.is_read ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex gap-3">
              {notif.from_user && (
                <img
                  src={notif.from_user.avatar_url}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                <p className="text-sm text-gray-600">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notif.created_at).toLocaleDateString()}
                </p>
              </div>
              {!notif.is_read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )}
</div>
```

## 4. Fix User Points Display in Navbar

The issue is `user?.impactPoints` - it should come from Supabase profiles table.

Update useUser hook in UserContext.tsx to load from Supabase:
```tsx
const [user, setUser] = useState<any>(null);

useEffect(() => {
  if (authUser) {
    loadUserProfile();
  }
}, [authUser]);

const loadUserProfile = async () => {
  if (!authUser) return;
  
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();
  
  if (data) {
    setUser({
      id: data.id,
      username: data.username,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      impactPoints: data.impact_points || 0,
      bio: data.bio,
      location: data.location,
      website: data.website
    });
  }
};
```

## 5. Update Profile Pages to Use Supabase Data

### UserProfile.tsx
Replace the user finding logic:
```tsx
const [profileUser, setProfileUser] = useState<any>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadProfile();
}, [username]);

const loadProfile = async () => {
  const { data } = await supabase
    .from('profiles')
    .select('*, user_badges(badge_name, earned_at)')
    .eq('username', username)
    .single();
  
  if (data) {
    setProfileUser({
      id: data.id,
      username: data.username,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      impactPoints: data.impact_points || 0,
      bio: data.bio,
      location: data.location,
      website: data.website,
      badges: data.user_badges?.map((b: any) => b.badge_name) || []
    });
  }
  setLoading(false);
};
```

### ProfileEdit.tsx
Update to save to Supabase:
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.fullName,
        username: formData.username,
        bio: formData.bio,
        location: formData.location,
        website: formData.website
      })
      .eq('id', authUser.id);
    
    if (error) throw error;
    
    alert('Profile updated successfully!');
    navigate(`/app/profile/${formData.username}`);
  } catch (error) {
    console.error('Failed to update profile:', error);
    alert('Failed to update profile. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

## Summary
1. ✅ Created notifications system (database + context)
2. 📝 Add NotificationProvider to App.tsx
3. 📝 Add notification bell to Navbar
4. 📝 Fix user points to load from Supabase
5. 📝 Update profile pages to use real Supabase data

All code snippets are ready to copy-paste!
