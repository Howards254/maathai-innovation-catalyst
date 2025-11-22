import React from 'react';
import { Link } from 'react-router-dom';
import { useInnovations } from '../../contexts/InnovationContext';
import { useAuth } from '../../contexts/AuthContext';

const InnovationHub: React.FC = () => {
  const { getApprovedInnovations, hubSettings, loading } = useInnovations();
  const { user } = useAuth();
  const innovations = getApprovedInnovations();

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Innovation Hub...</p>
        </div>
      </div>
    );
  }

  if (!hubSettings.isOpen) {
    return (
      <div className="p-6 bg-gray-50 min-h-full">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Innovation Hub Temporarily Closed</h1>
            <p className="text-gray-600 text-lg mb-6">
              The Innovation Hub is currently closed for new submissions. Please check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🚀 Innovation Hub</h1>
          <p className="text-xl text-gray-600 mb-6">{hubSettings.description}</p>
          <div className="flex justify-center gap-4">
            <Link
              to="/app/innovation/submit"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              Submit Innovation
            </Link>
            {user && (
              <Link
                to="/app/innovation/my-projects"
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
              >
                My Projects
              </Link>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Guidelines</h3>
          <ul className="space-y-2 text-blue-800">
            {hubSettings.guidelines.map((guideline, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>{guideline}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Innovations</h2>
          
          {innovations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Innovations Yet</h3>
              <p className="text-gray-600 mb-6">Be the first to submit an innovative solution!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {innovations.map(innovation => {
                const fundingPercentage = (innovation.currentFunding / innovation.fundingGoal) * 100;
                
                return (
                  <div key={innovation.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-48">
                      <img src={innovation.imageUrl} alt={innovation.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          innovation.category === 'Wood-Free Products' ? 'bg-green-100 text-green-800' :
                          innovation.category === 'DATs' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {innovation.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{innovation.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{innovation.description}</p>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Funding</span>
                          <span className="font-medium">${innovation.currentFunding.toLocaleString()} / ${innovation.fundingGoal.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {innovation.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-4">By {innovation.creatorName}</div>
                      
                      <Link
                        to={`/app/innovation/${innovation.id}`}
                        className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InnovationHub;