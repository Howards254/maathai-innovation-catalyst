import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Resource {
  id: string;
  title: string;
  type: 'PDF' | 'Video' | 'Article';
  category: string;
  url: string;
}

const ResourcesList: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([
    { id: 'r1', title: 'Tree Planting Guide 101', type: 'PDF', category: 'Guides', url: '#' },
    { id: 'r2', title: 'Soil Health Analysis', type: 'Video', category: 'Science', url: '#' },
    { id: 'r3', title: 'Community Organizing Handbook', type: 'Article', category: 'Community', url: '#' },
    { id: 'r4', title: 'Indigenous Species Selection', type: 'PDF', category: 'Guides', url: '#' },
    { id: 'r5', title: 'Water Conservation Techniques', type: 'Video', category: 'Science', url: '#' },
    { id: 'r6', title: 'Fundraising for Environmental Projects', type: 'Article', category: 'Community', url: '#' }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In the future, load resources from Supabase
    // loadResources();
  }, []);

  return (
    <div className="p-6 bg-white min-h-full">
      <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resources Library</h1>
          <p className="text-gray-500">Guides, scientific papers, and tutorials to help you plant smarter.</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Loading resources...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map(resource => (
            <div key={resource.id} className="border border-gray-200 rounded-lg p-6 hover:border-primary-500 transition-colors group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                        {resource.type === 'PDF' ? '📄' : resource.type === 'Video' ? '▶️' : '📰'}
                    </div>
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {resource.category}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{resource.title}</h3>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span>View {resource.type}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesList;