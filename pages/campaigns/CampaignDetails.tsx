import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCampaigns } from '../../contexts/CampaignContext';
import { useAuth } from '../../contexts/AuthContext';
import MapPicker from '../../components/MapPicker';
import ImageUpload from '../../components/ImageUpload';

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getCampaign, 
    joinCampaign, 
    approveMember, 
    rejectMember,
    submitTreePlanting,
    approveSubmission,
    rejectSubmission,
    addUpdate,
    editCampaign,
    cancelCampaign,
    completeCampaign,
    getCampaignSubmissions
  } = useCampaigns();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [plantingData, setPlantingData] = useState({
    treesCount: 1,
    location: '',
    latitude: -1.2921,
    longitude: 36.8219,
    description: '',
    photoUrl: ''
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    title: '',
    description: '',
    imageUrl: ''
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'updates' | 'submissions' | 'members'>('overview');

  const campaign = getCampaign(id!);
  const submissions = getCampaignSubmissions(id!);

  if (!campaign) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h2>
        <button 
          onClick={() => navigate('/app/campaigns')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  const isOrganizer = user?.id === campaign.organizerId;
  const isParticipant = campaign.participants?.includes(user?.id || '') || false;
  const isPending = campaign.pendingParticipants?.includes(user?.id || '') || false;
  const canJoin = user && !isOrganizer && !isParticipant && !isPending && campaign.status === 'active';

  const handleJoin = async () => {
    await joinCampaign(campaign.id);
    setShowJoinModal(false);
  };

  const handlePlantSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!plantingData.photoUrl) {
      toast.warning('Please upload a photo of your tree planting');
      return;
    }
    
    await submitTreePlanting({
      campaignId: campaign.id,
      userId: user!.id,
      ...plantingData
    });
    
    setShowPlantModal(false);
    setPlantingData({
      treesCount: 1,
      location: '',
      latitude: -1.2921,
      longitude: 36.8219,
      description: '',
      photoUrl: ''
    });
  };

  const handleAddUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    await addUpdate(campaign.id, updateData);
    
    setShowUpdateModal(false);
    setUpdateData({ title: '', description: '', imageUrl: '' });
  };

  const handleComplete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const photos = (formData.get('photos') as string).split(',').map(url => url.trim());
    
    await completeCampaign(campaign.id, photos);
    setShowCompleteModal(false);
  };

  const progressPercentage = Math.min((campaign.plantedTrees / campaign.targetTrees) * 100, 100);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="relative h-64">
          <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className={`px-2 py-1 rounded ${
                campaign.status === 'active' ? 'bg-green-600' : 
                campaign.status === 'completed' ? 'bg-blue-600' : 'bg-red-600'
              }`}>
                {campaign.status ? campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1) : 'Unknown'}
              </span>
              <span>{campaign.isPublic ? 'Public' : 'Private'}</span>
              <span>📍 {campaign.location}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <p className="text-gray-600 mb-4">{campaign.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>By {campaign.organizer}</span>
                <span>•</span>
                <span>{campaign.participants?.length || 0} participants</span>
                <span>•</span>
                <span>{campaign.daysLeft} days left</span>
              </div>
            </div>
            
            <div className="flex gap-2 ml-6">
              {canJoin && (
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {campaign.isPublic ? 'Join Campaign' : 'Request to Join'}
                </button>
              )}
              
              {(isParticipant || isOrganizer) && campaign.status === 'active' && (
                <button
                  onClick={() => setShowPlantModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Submit Tree Planting
                </button>
              )}
              
              {isOrganizer && campaign.status === 'active' && (
                <>
                  <button
                    onClick={() => setShowUpdateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Update
                  </button>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Edit Campaign
                  </button>
                  <button
                    onClick={() => setShowCompleteModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => cancelCampaign(campaign.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{campaign.plantedTrees} / {campaign.targetTrees} trees</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-right text-sm text-gray-500 mt-1">{progressPercentage.toFixed(1)}%</div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {campaign.tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'updates', label: `Updates (${campaign.updates?.length || 0})` },
              { key: 'submissions', label: `Submissions (${submissions.length})` },
              { key: 'members', label: `Members (${campaign.participants?.length || 0})` }
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
              <div>
                <h3 className="text-lg font-semibold mb-3">Campaign Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Start Date:</span> {new Date(campaign.startDate).toLocaleDateString()}</div>
                  <div><span className="font-medium">End Date:</span> {new Date(campaign.endDate).toLocaleDateString()}</div>
                  <div><span className="font-medium">Target Trees:</span> {campaign.targetTrees.toLocaleString()}</div>
                  <div><span className="font-medium">Trees Planted:</span> {campaign.plantedTrees.toLocaleString()}</div>
                </div>
              </div>
              
              {isPending && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">Your request to join this private campaign is pending approval.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="space-y-4">
              {(campaign.updates?.length || 0) === 0 ? (
                <p className="text-gray-500 text-center py-8">No updates yet.</p>
              ) : (
                (campaign.updates || []).map(update => (
                  <div key={update.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{update.title}</h4>
                    <p className="text-gray-600 mb-2">{update.description}</p>
                    {update.imageUrl && (
                      <img src={update.imageUrl} alt={update.title} className="w-full h-48 object-cover rounded-lg mb-2" />
                    )}
                    <p className="text-sm text-gray-500">{new Date(update.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="space-y-4">
              {submissions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No submissions yet.</p>
              ) : (
                submissions.map(submission => (
                  <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <img src={submission.userAvatar} alt={submission.userName} className="w-10 h-10 rounded-full" />
                        <div>
                          <h4 className="font-semibold">{submission.userName}</h4>
                          <p className="text-sm text-gray-500">{submission.treesCount} trees • {submission.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                          submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {submission.status}
                        </span>
                        {isOrganizer && submission.status === 'pending' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => approveSubmission(submission.id)}
                              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectSubmission(submission.id)}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{submission.description}</p>
                    <img src={submission.photoUrl} alt="Tree planting" className="w-full h-48 object-cover rounded-lg mb-2" />
                    <p className="text-sm text-gray-500">{new Date(submission.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Organizer</h4>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img src={campaign.organizerAvatar} alt={campaign.organizer} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-medium">{campaign.organizer}</p>
                    <p className="text-sm text-gray-500">Campaign Organizer</p>
                  </div>
                </div>
              </div>

              {(campaign.participants?.length || 0) > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Participants ({campaign.participants?.length || 0})</h4>
                  <div className="space-y-2">
                    {(campaign.participants || []).map(participantId => (
                      <div key={participantId} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                          {participantId.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">Participant</p>
                          <p className="text-sm text-gray-500">Member</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isOrganizer && (campaign.pendingParticipants?.length || 0) > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Pending Requests ({campaign.pendingParticipants?.length || 0})</h4>
                  <div className="space-y-2">
                    {(campaign.pendingParticipants || []).map(userId => (
                      <div key={userId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold">
                            {userId.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">Pending User</p>
                            <p className="text-sm text-gray-500">Awaiting approval</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveMember(campaign.id, userId)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectMember(campaign.id, userId)}
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
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {campaign.isPublic ? 'Join Campaign' : 'Request to Join'}
            </h3>
            <p className="text-gray-600 mb-6">
              {campaign.isPublic 
                ? 'You will be able to participate in tree planting activities immediately.'
                : 'Your request will be sent to the organizer for approval.'
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleJoin}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {campaign.isPublic ? 'Join Now' : 'Send Request'}
              </button>
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showPlantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8">
            <h3 className="text-lg font-semibold mb-4">Submit Tree Planting</h3>
            <form onSubmit={handlePlantSubmission} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Trees</label>
                <input
                  type="number"
                  value={plantingData.treesCount}
                  onChange={(e) => setPlantingData(prev => ({ ...prev, treesCount: parseInt(e.target.value) }))}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Planting Location</label>
                <input
                  type="text"
                  value={plantingData.location}
                  onChange={(e) => setPlantingData(prev => ({ ...prev, location: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2"
                  placeholder="e.g., Karura Forest, Nairobi"
                />
                <MapPicker
                  initialPosition={[plantingData.latitude, plantingData.longitude]}
                  height="300px"
                  onLocationSelect={(lat, lng, address) => {
                    setPlantingData(prev => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                      location: address || prev.location
                    }));
                  }}
                />
                <p className="text-sm text-gray-500 mt-2">Click on the map to mark where you planted</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={plantingData.description}
                  onChange={(e) => setPlantingData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe your tree planting activity..."
                />
              </div>
              
              <ImageUpload
                label="Tree Planting Photo (Required)"
                folder="tree-submissions"
                currentImage={plantingData.photoUrl}
                onUploadComplete={(url) => {
                  setPlantingData(prev => ({ ...prev, photoUrl: url }));
                }}
              />
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!plantingData.photoUrl}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Planting
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPlantModal(false);
                    setPlantingData({
                      treesCount: 1,
                      location: '',
                      latitude: -1.2921,
                      longitude: 36.8219,
                      description: '',
                      photoUrl: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8">
            <h3 className="text-lg font-semibold mb-4">Add Campaign Update</h3>
            <form onSubmit={handleAddUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={updateData.title}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Week 1 Progress Update"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={updateData.description}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Share progress, achievements, or challenges..."
                />
              </div>
              <ImageUpload
                label="Update Image (Optional)"
                folder="campaign-updates"
                currentImage={updateData.imageUrl}
                onUploadComplete={(url) => {
                  setUpdateData(prev => ({ ...prev, imageUrl: url }));
                }}
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setUpdateData({ title: '', description: '', imageUrl: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Mark Campaign Complete</h3>
            <form onSubmit={handleComplete} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Completion Photos (comma-separated URLs)
                </label>
                <textarea
                  name="photos"
                  rows={4}
                  required
                  placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-600">
                This will send your campaign for admin approval. Once approved, all participants will receive impact points.
              </p>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Submit for Approval
                </button>
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetails;