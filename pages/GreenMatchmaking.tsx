import React, { useState } from 'react';
import { Heart, Users, MapPin, Star, MessageCircle, UserPlus, Search, Filter } from 'lucide-react';
import { useMatchmaking } from '../contexts/MatchmakingContext';
import { formatDistanceToNow } from 'date-fns';

const GreenMatchmaking: React.FC = () => {
  const { matches, teams, loading, findMatches, respondToMatch, createTeam, joinTeam } = useMatchmaking();
  const [activeTab, setActiveTab] = useState<'matches' | 'teams'>('matches');
  const [matchFilter, setMatchFilter] = useState<string>('all');
  const [showCreateTeam, setShowCreateTeam] = useState(false);

  const matchTypes = [
    { id: 'all', label: 'All Matches', icon: '🌍' },
    { id: 'teammate', label: 'Teammates', icon: '👥' },
    { id: 'mentor', label: 'Mentors', icon: '👨🏫' },
    { id: 'mentee', label: 'Mentees', icon: '👨🎓' },
    { id: 'volunteer', label: 'Volunteers', icon: '🙋' },
    { id: 'collaborator', label: 'Collaborators', icon: '🤝' }
  ];

  const teamTypes = [
    { id: 'project', label: 'Project Team', icon: '🚀' },
    { id: 'campaign', label: 'Campaign Team', icon: '📢' },
    { id: 'research', label: 'Research Team', icon: '🔬' },
    { id: 'volunteer', label: 'Volunteer Group', icon: '🙋' },
    { id: 'social', label: 'Social Group', icon: '👫' }
  ];

  const filteredMatches = matchFilter === 'all' 
    ? matches 
    : matches.filter(match => match.match_type === matchFilter);

  const getCompatibilityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const CreateTeamModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Create Green Team</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          createTeam({
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            team_type: formData.get('team_type') as any,
            max_members: parseInt(formData.get('max_members') as string),
            location_city: formData.get('location_city') as string,
            location_country: formData.get('location_country') as string,
            is_remote: formData.get('is_remote') === 'on'
          });
          setShowCreateTeam(false);
        }}>
          <div className="space-y-4">
            <input
              name="name"
              type="text"
              placeholder="Team Name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
            <textarea
              name="description"
              placeholder="Team Description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
            <select
              name="team_type"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              {teamTypes.map(type => (
                <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
              ))}
            </select>
            <input
              name="max_members"
              type="number"
              placeholder="Max Members"
              min="2"
              max="50"
              defaultValue="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                name="location_city"
                type="text"
                placeholder="City"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <input
                name="location_country"
                type="text"
                placeholder="Country"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <label className="flex items-center">
              <input name="is_remote" type="checkbox" className="mr-2" />
              <span className="text-sm">Remote team</span>
            </label>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowCreateTeam(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Heart className="w-8 h-8 text-emerald-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Green Matchmaking</h1>
              <p className="text-gray-600">Connect with like-minded environmentalists</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => findMatches()}
              disabled={loading}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
            >
              {loading ? 'Finding...' : 'Find Matches'}
            </button>
            <button
              onClick={() => setShowCreateTeam(true)}
              className="px-4 py-2 border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50"
            >
              Create Team
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'matches' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Your Matches ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'teams' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Green Teams ({teams.length})
          </button>
        </div>

        {activeTab === 'matches' && (
          <div>
            {/* Match Filters */}
            <div className="flex space-x-2 mb-6 overflow-x-auto">
              {matchTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setMatchFilter(type.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    matchFilter === type.id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>

            {/* Matches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map(match => (
                <div key={match.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <img
                        src={match.matched_user?.avatar_url || `https://ui-avatars.com/api/?name=${match.matched_user?.full_name}&background=10b981&color=fff`}
                        alt={match.matched_user?.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{match.matched_user?.full_name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{match.matched_user?.location_city}, {match.matched_user?.location_country}</span>
                        </div>
                      </div>
                    </div>

                    {/* Compatibility Score */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Compatibility</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompatibilityColor(match.compatibility_score)}`}>
                          {Math.round(match.compatibility_score * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${match.compatibility_score * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Common Interests */}
                    <div className="mb-4">
                      {match.common_causes.length > 0 && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-gray-500">Common Causes:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {match.common_causes.slice(0, 3).map(cause => (
                              <span key={cause} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                                {cause.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {match.distance_km && (
                        <div className="text-xs text-gray-500">
                          📍 {Math.round(match.distance_km)} km away
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {match.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => respondToMatch(match.id, 'accept')}
                          className="flex-1 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-sm"
                        >
                          Connect
                        </button>
                        <button
                          onClick={() => respondToMatch(match.id, 'decline')}
                          className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          Pass
                        </button>
                      </div>
                    )}
                    
                    {match.status === 'accepted' && (
                      <div className="flex space-x-2">
                        <button className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Message
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredMatches.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
                <p className="text-gray-500 mb-4">Try finding new matches or adjusting your preferences</p>
                <button
                  onClick={() => findMatches()}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                >
                  Find Matches
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map(team => (
              <div key={team.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{team.name}</h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {teamTypes.find(t => t.id === team.team_type)?.icon} {teamTypes.find(t => t.id === team.team_type)?.label}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{team.description}</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{team.current_members}/{team.max_members}</span>
                    </div>
                    {!team.is_remote && team.location_city && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{team.location_city}</span>
                      </div>
                    )}
                    {team.is_remote && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Remote</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={team.creator?.avatar_url || `https://ui-avatars.com/api/?name=${team.creator?.full_name}&background=10b981&color=fff`}
                      alt={team.creator?.full_name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-600">Led by {team.creator?.full_name}</span>
                  </div>

                  <button
                    onClick={() => joinTeam(team.id)}
                    disabled={team.current_members >= team.max_members}
                    className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {team.current_members >= team.max_members ? 'Team Full' : 'Join Team'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateTeam && <CreateTeamModal />}
    </div>
  );
};

export default GreenMatchmaking;