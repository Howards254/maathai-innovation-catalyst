import React from 'react';
import { Link } from 'react-router-dom';
import { useInnovations } from '../../contexts/InnovationContext';
import { useAuth } from '../../contexts/AuthContext';

const MyProjects: React.FC = () => {
  const { getUserInnovations } = useInnovations();
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
        <p className="text-gray-600">You need to be logged in to view your projects.</p>
      </div>
    );
  }

  const userInnovations = getUserInnovations(user.id);

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Innovation Projects</h1>
          <Link
            to="/app/innovation/submit"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            Submit New Project
          </Link>
        </div>

        {userInnovations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h3>
            <p className="text-gray-600 mb-6">Start by submitting your first innovation project!</p>
            <Link
              to="/app/innovation/submit"
              className="inline-flex px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              Submit Your First Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userInnovations.map(innovation => {
              const fundingPercentage = (innovation.currentFunding / innovation.fundingGoal) * 100;
              
              return (
                <div key={innovation.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="relative h-48">
                    <img src={innovation.imageUrl} alt={innovation.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        innovation.status === 'approved' ? 'bg-green-100 text-green-800' :
                        innovation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {innovation.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{innovation.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{innovation.description}</p>
                    
                    {innovation.status === 'approved' && (
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
                    )}

                    {innovation.status === 'rejected' && innovation.rejectionReason && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-800 text-sm font-medium mb-1">Rejection Reason:</p>
                        <p className="text-red-700 text-sm">{innovation.rejectionReason}</p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {innovation.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-4">
                      Created: {new Date(innovation.createdAt).toLocaleDateString()}
                    </div>
                    
                    <div className="flex gap-2">
                      <Link
                        to={`/app/innovation/${innovation.id}`}
                        className="flex-1 text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        View Details
                      </Link>
                      {innovation.status === 'rejected' && (
                        <Link
                          to={`/app/innovation/edit/${innovation.id}`}
                          className="flex-1 text-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          Edit & Resubmit
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProjects;