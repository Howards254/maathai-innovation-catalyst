import React, { useState } from 'react';
import { useCampaigns } from '../../contexts/CampaignContext';
import { useUsers } from '../../contexts/UserContext';
import { useDiscussions } from '../../contexts/DiscussionContext';
import { useEvents } from '../../contexts/EventContext';
import { useInnovations } from '../../contexts/InnovationContext';

const AdminDashboard: React.FC = () => {
  const { campaigns, submissions, approveCompletion } = useCampaigns();
  const { users } = useUsers();
  const { discussions } = useDiscussions();
  const { getPendingEvents, approveEvent, rejectEvent } = useEvents();
  const { getPendingInnovations, approveInnovation, rejectInnovation, hubSettings, toggleHub } = useInnovations();
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'users' | 'submissions' | 'discussions' | 'events' | 'innovations'>('overview');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  const pendingEvents = getPendingEvents();
  const pendingInnovations = getPendingInnovations();

  const pendingCompletions = campaigns.filter(c => c.isCompletionPending);
  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const totalTrees = campaigns.reduce((sum, c) => sum + c.plantedTrees, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'campaigns', label: `Campaigns (${campaigns.length})` },
              { key: 'users', label: `Users (${users.length})` },
              { key: 'submissions', label: `Submissions (${pendingSubmissions.length})` },
              { key: 'discussions', label: `Discussions (${discussions.length})` },
              { key: 'events', label: `Events (${pendingEvents.length})` },
              { key: 'innovations', label: `Innovations (${pendingInnovations.length})` }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800">Total Trees</h3>
                  <p className="text-3xl font-bold text-green-600">{totalTrees.toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800">Active Campaigns</h3>
                  <p className="text-3xl font-bold text-blue-600">{campaigns.filter(c => c.status === 'active').length}</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-800">Total Users</h3>
                  <p className="text-3xl font-bold text-purple-600">{users.length}</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-800">Pending Reviews</h3>
                  <p className="text-3xl font-bold text-orange-600">{pendingCompletions.length + pendingSubmissions.length + pendingEvents.length + pendingInnovations.length}</p>
                </div>
              </div>

              {/* Pending Approvals */}
              {pendingCompletions.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-3">Campaigns Pending Completion Approval</h3>
                  <div className="space-y-2">
                    {pendingCompletions.map(campaign => (
                      <div key={campaign.id} className="flex justify-between items-center bg-white p-3 rounded border">
                        <div>
                          <p className="font-medium">{campaign.title}</p>
                          <p className="text-sm text-gray-500">{campaign.plantedTrees} trees planted</p>
                        </div>
                        <button
                          onClick={() => approveCompletion(campaign.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Approve Completion
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingEvents.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-3">Events Pending Approval</h3>
                  <div className="space-y-2">
                    {pendingEvents.map(event => (
                      <div key={event.id} className="flex justify-between items-center bg-white p-3 rounded border">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-gray-500">{event.organizerName} • {new Date(event.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveEvent(event.id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectEvent(event.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Innovation Hub Controls */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-purple-800">Innovation Hub Status</h3>
                  <button
                    onClick={() => toggleHub(!hubSettings.isOpen)}
                    className={`px-4 py-2 rounded font-medium ${
                      hubSettings.isOpen 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {hubSettings.isOpen ? 'Close Hub' : 'Open Hub'}
                  </button>
                </div>
                <p className="text-purple-700 text-sm">
                  Hub is currently {hubSettings.isOpen ? 'open' : 'closed'} for submissions
                </p>
              </div>
            </div>
          )}

          {activeTab === 'innovations' && (
            <div className="space-y-4">
              {pendingInnovations.map(innovation => (
                <div key={innovation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{innovation.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{innovation.description}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>By {innovation.creatorName}</span>
                        <span>Goal: ${innovation.fundingGoal.toLocaleString()}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          innovation.category === 'Wood-Free Products' ? 'bg-green-100 text-green-800' :
                          innovation.category === 'DATs' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {innovation.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => approveInnovation(innovation.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setShowRejectModal(innovation.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="space-y-4">
              {campaigns.map(campaign => (
                <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{campaign.title}</h3>
                      <p className="text-sm text-gray-600">{campaign.description}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>By {campaign.organizer}</span>
                        <span>{campaign.plantedTrees}/{campaign.targetTrees} trees</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                    </div>
                    {campaign.isCompletionPending && (
                      <button
                        onClick={() => approveCompletion(campaign.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <img src={user.avatarUrl} alt={user.fullName} className="w-12 h-12 rounded-full" />
                    <div>
                      <h3 className="font-semibold">{user.fullName}</h3>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                      <p className="text-sm text-gray-500">{user.impactPoints} points • {user.badges.length} badges</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="space-y-4">
              {submissions.map(submission => (
                <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <img src={submission.photoUrl} alt="Tree planting" className="w-20 h-20 object-cover rounded" />
                      <div>
                        <h3 className="font-semibold">{submission.userName}</h3>
                        <p className="text-sm text-gray-600">{submission.treesCount} trees • {submission.location}</p>
                        <p className="text-sm text-gray-500">{submission.description}</p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                          submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                          submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {submission.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'discussions' && (
            <div className="space-y-4">
              {discussions.map(discussion => (
                <div key={discussion.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold">{discussion.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{discussion.content}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>By {discussion.author.fullName}</span>
                    <span>{discussion.upvotes} upvotes</span>
                    <span>{discussion.commentsCount} comments</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      discussion.category === 'General' ? 'bg-gray-100 text-gray-800' :
                      discussion.category === 'Help' ? 'bg-blue-100 text-blue-800' :
                      discussion.category === 'Success Story' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {discussion.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
              {pendingEvents.map(event => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>By {event.organizerName}</span>
                        <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                        <span>{event.location}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          event.type === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {event.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveEvent(event.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectEvent(event.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Innovation</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a reason for rejection..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              rows={4}
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (rejectReason.trim()) {
                    rejectInnovation(showRejectModal, rejectReason);
                    setShowRejectModal(null);
                    setRejectReason('');
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;