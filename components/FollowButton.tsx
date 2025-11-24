import { UserPlus, UserMinus, Users } from 'lucide-react';
import { useFollow } from '../contexts/FollowContext';
import { useAuth } from '../contexts/AuthContext';

interface FollowButtonProps {
  userId: string;
  size?: 'sm' | 'md';
}

export default function FollowButton({ userId, size = 'md' }: FollowButtonProps) {
  const { user } = useAuth();
  const { followUser, unfollowUser, isFollowing, areFriends } = useFollow();

  if (!user || userId === user.id) return null;

  const following = isFollowing(userId);
  const friends = areFriends(userId);

  const handleClick = () => {
    if (following) {
      unfollowUser(userId);
    } else {
      followUser(userId);
    }
  };

  const sizeClasses = size === 'sm' ? 'px-3 py-1 text-sm' : 'px-4 py-2';

  if (friends) {
    return (
      <button
        onClick={handleClick}
        className={`${sizeClasses} bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2`}
      >
        <Users className="w-4 h-4" />
        Friends
      </button>
    );
  }

  if (following) {
    return (
      <button
        onClick={handleClick}
        className={`${sizeClasses} bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2`}
      >
        <UserMinus className="w-4 h-4" />
        Following
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses} bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2`}
    >
      <UserPlus className="w-4 h-4" />
      Follow
    </button>
  );
}
