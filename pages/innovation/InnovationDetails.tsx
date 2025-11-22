import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInnovations } from '../../contexts/InnovationContext';
import { useAuth } from '../../contexts/AuthContext';

const InnovationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { innovations } = useInnovations();

  const innovation = innovations.find(i => i.id === id);

  if (!innovation) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Innovation Not Found</h2>
        <button 
          onClick={() => navigate('/app/innovation')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to Innovation Hub
        </button>
      </div>
    );
  }

  if (innovation.status !== 'approved' && innovation.creatorId !== user?.id) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Innovation Not Available</h2>
        <p className="text-gray-600 mb-4">This innovation is not yet approved for public viewing.</p>
        <button 
          onClick={() => navigate('/app/innovation')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to Innovation Hub
        </button>
      </div>
    );
  }

  const fundingPercentage = (innovation.currentFunding / innovation.fundingGoal) * 100;
  const isOwner = user?.id === innovation.creatorId;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="relative h-64">
          <img src={innovation.imageUrl} alt={innovation.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-3xl font-bold mb-2">{innovation.title}</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className={`px-2 py-1 rounded ${
                innovation.category === 'Wood-Free Products' ? 'bg-green-600' :
                innovation.category === 'DATs' ? 'bg-blue-600' : 'bg-purple-600'
              }`}>
                {innovation.category}
              </span>
              <span className={`px-2 py-1 rounded ${
                innovation.status === 'approved' ? 'bg-green-600' :
                innovation.status === 'rejected' ? 'bg-red-600' : 'bg-yellow-600'
              }`}>
                {innovation.status}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <p className="text-gray-600 mb-4">{innovation.description}</p>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>👤 Created by {innovation.creatorName}</span>
                <span>📅 {new Date(innovation.createdAt).toLocaleDateString()}</span>
                <span>📧 {innovation.contactEmail}</span>
              </div>
            </div>
          </div>

          {/* Funding Progress */}
          {innovation.status === 'approved' && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-gray-700">Funding Progress</span>
                <span className="text-lg font-bold text-primary-600">
                  ${innovation.currentFunding.toLocaleString()} / ${innovation.fundingGoal.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-primary-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                />
              </div>
              <div className="text-right text-sm text-gray-500 mt-1">{fundingPercentage.toFixed(1)}% funded</div>
            </div>
          )}

          {/* Rejection Reason */}
          {innovation.status === 'rejected' && innovation.rejectionReason && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Rejection Reason</h3>
              <p className="text-red-700">{innovation.rejectionReason}</p>
              {isOwner && (
                <div className="mt-3">
                  <button
                    onClick={() => navigate(`/app/innovation/edit/${innovation.id}`)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Edit & Resubmit
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {innovation.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Business Plan */}
      {innovation.businessPlan && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Business Plan & Implementation Strategy</h3>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{innovation.businessPlan}</p>
          </div>
        </div>
      )}

      {/* Contact Information */}
      {innovation.status === 'approved' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4">Get Involved</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Contact the Innovator</h4>
              <p className="text-gray-600 mb-3">
                Interested in investing or collaborating? Reach out directly to discuss opportunities.
              </p>
              <a
                href={`mailto:${innovation.contactEmail}?subject=Interest in ${innovation.title}`}
                className="inline-flex px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Contact via Email
              </a>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Investment Opportunity</h4>
              <p className="text-gray-600 mb-3">
                This project is seeking ${innovation.fundingGoal.toLocaleString()} in funding to bring this innovation to market.
              </p>
              <div className="text-sm text-gray-500">
                Current funding: {fundingPercentage.toFixed(1)}% of goal
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InnovationDetails;