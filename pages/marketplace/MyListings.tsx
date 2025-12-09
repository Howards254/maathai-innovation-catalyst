import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

interface Listing {
  id: string;
  title: string;
  price: number;
  currency: string;
  category: string;
  status: string;
  images: string[];
  views_count: number;
  created_at: string;
}

const MyListings: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyListings();
  }, []);

  const loadMyListings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error loading listings:', error);
      toast.error('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Listing deleted successfully');
      setListings(listings.filter(l => l.id !== id));
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Listing marked as ${status}`);
      loadMyListings();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      'KES': 'KSh',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'ZAR': 'R',
      'NGN': '₦',
      'GHS': '₵'
    };
    return symbols[currency] || currency;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
                <p className="text-gray-600 text-sm">Manage your marketplace items</p>
              </div>
              <Link
                to="/app/marketplace/create"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Listing
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-500 mb-4">Create your first listing to start selling</p>
              <Link
                to="/app/marketplace/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Listing
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map(listing => (
                <div key={listing.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {listing.images && listing.images.length > 0 ? (
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{listing.title}</h3>
                          <p className="text-green-600 font-bold text-xl">
                            {getCurrencySymbol(listing.currency)} {listing.price.toLocaleString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                          {listing.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {listing.views_count} views
                        </span>
                        <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/app/marketplace/${listing.id}`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          View
                        </Link>
                        
                        <Link
                          to={`/app/marketplace/${listing.id}/edit`}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Link>
                        
                        {listing.status === 'available' && (
                          <button
                            onClick={() => updateStatus(listing.id, 'sold')}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                          >
                            Mark as Sold
                          </button>
                        )}
                        
                        {listing.status === 'sold' && (
                          <button
                            onClick={() => updateStatus(listing.id, 'available')}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                          >
                            Mark as Available
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteListing(listing.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyListings;
