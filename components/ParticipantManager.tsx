import React, { useState } from 'react';
import { 
  Users, Crown, UserCheck, UserX, Mail, MessageCircle, 
  Award, TreePine, Calendar, Search, Filter, MoreVertical,
  UserPlus, Shield, Star
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: 'organizer' | 'moderator' | 'participant';
  joinedAt: string;
  treesPlanted: number;
  lastActive: string;
  status: 'active' | 'pending' | 'inactive';
  badges: string[];
  contributions: number;
}

interface ParticipantManagerProps {
  campaignId: string;
  isOrganizer: boolean;
  participants: Participant[];
  onApproveParticipant: (userId: string) => void;
  onRejectParticipant: (userId: string) => void;
  onPromoteToModerator: (userId: string) => void;
  onRemoveParticipant: (userId: string) => void;
  onSendMessage: (userId: string) => void;
}

const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  campaignId,
  isOrganizer,
  participants,
  onApproveParticipant,
  onRejectParticipant,
  onPromoteToModerator,
  onRemoveParticipant,
  onSendMessage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'organizer' | 'moderator' | 'participant'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

  // Filter participants
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || participant.role === filterRole;
    const matchesStatus = filterStatus === 'all' || participant.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Group participants by role
  const organizers = filteredParticipants.filter(p => p.role === 'organizer');
  const moderators = filteredParticipants.filter(p => p.role === 'moderator');
  const activeParticipants = filteredParticipants.filter(p => p.role === 'participant' && p.status === 'active');
  const pendingParticipants = filteredParticipants.filter(p => p.status === 'pending');

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'organizer': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'moderator': return <Shield className="w-4 h-4 text-blue-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'organizer': 
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Crown className="w-3 h-3 mr-1" /> Organizer
        </span>;
      case 'moderator':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Shield className="w-3 h-3 mr-1" /> Moderator
        </span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Users className="w-3 h-3 mr-1" /> Participant
        </span>;
    }
  };

  const ParticipantCard: React.FC<{ participant: Participant }> = ({ participant }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-green-200 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={participant.avatar} 
              alt={participant.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            {participant.status === 'active' && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">{participant.name}</h4>
              {participant.badges.includes('top-contributor') && (
                <Star className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <p className="text-sm text-gray-600">@{participant.username}</p>
            <div className="mt-1">{getRoleBadge(participant.role)}</div>
          </div>
        </div>

        {isOrganizer && participant.role !== 'organizer' && (
          <div className="relative">
            <button
              onClick={() => setSelectedParticipant(
                selectedParticipant === participant.id ? null : participant.id
              )}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {selectedParticipant === participant.id && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                <button
                  onClick={() => onSendMessage(participant.id)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send Message
                </button>
                {participant.role === 'participant' && (
                  <button
                    onClick={() => onPromoteToModerator(participant.id)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Make Moderator
                  </button>
                )}
                <button
                  onClick={() => onRemoveParticipant(participant.id)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                >
                  <UserX className="w-4 h-4" />
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 text-center py-3 bg-gray-50 rounded-lg">
        <div>
          <div className="text-lg font-bold text-green-600">{participant.treesPlanted}</div>
          <div className="text-xs text-gray-600">Trees</div>
        </div>
        <div>
          <div className="text-lg font-bold text-blue-600">{participant.contributions}</div>
          <div className="text-xs text-gray-600">Actions</div>
        </div>
        <div>
          <div className="text-lg font-bold text-purple-600">{participant.badges.length}</div>
          <div className="text-xs text-gray-600">Badges</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
        <span>Joined {new Date(participant.joinedAt).toLocaleDateString()}</span>
        <span>Active {participant.lastActive}</span>
      </div>

      {participant.status === 'pending' && isOrganizer && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onApproveParticipant(participant.id)}
            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
          >
            <UserCheck className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={() => onRejectParticipant(participant.id)}
            className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
          >
            <UserX className="w-4 h-4" />
            Reject
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-green-600" />
            Participants ({participants.length})
          </h2>
          <p className="text-gray-600 text-sm mt-1">Manage campaign participants and permissions</p>
        </div>
        
        {isOrganizer && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite People
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
          >
            <option value="all">All Roles</option>
            <option value="organizer">Organizers</option>
            <option value="moderator">Moderators</option>
            <option value="participant">Participants</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingParticipants.length > 0 && isOrganizer && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Pending Approvals ({pendingParticipants.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingParticipants.map(participant => (
              <ParticipantCard key={participant.id} participant={participant} />
            ))}
          </div>
        </div>
      )}

      {/* Organizers */}
      {organizers.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            Organizers ({organizers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizers.map(participant => (
              <ParticipantCard key={participant.id} participant={participant} />
            ))}
          </div>
        </div>
      )}

      {/* Moderators */}
      {moderators.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Moderators ({moderators.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moderators.map(participant => (
              <ParticipantCard key={participant.id} participant={participant} />
            ))}
          </div>
        </div>
      )}

      {/* Active Participants */}
      {activeParticipants.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Active Participants ({activeParticipants.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeParticipants.map(participant => (
              <ParticipantCard key={participant.id} participant={participant} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredParticipants.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No participants found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
              ? 'Try adjusting your filters to see more participants.'
              : 'Invite people to join your campaign and start making an impact together!'
            }
          </p>
          {isOrganizer && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Invite Participants
            </button>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-600" />
                Invite Participants
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Addresses
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Enter email addresses separated by commas or new lines..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Add a personal message to your invitation..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle invite logic
                    setShowInviteModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Send Invites
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantManager;