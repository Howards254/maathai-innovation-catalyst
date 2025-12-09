import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, Eye, Calendar, ArrowLeft, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  condition: string;
  location: string;
  latitude: number;
  longitude: number;
  images: string[];
  status: string;
  views_count: number;
  created_at: string;
  seller: {
    id: string;
    full_name: string;
    avatar_url: string;
    username: string;
  };
}

const ListingDetail: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadListing();
      incrementViewCount();
    }
  }, [id]);

  const loadListing = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          seller:profiles!marketplace_listings_seller_id_fkey(id, full_name, avatar_url, username)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setListing(data);
    } catch (error) {
      console.error('Error loading listing:', error);
      toast.error('Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase.rpc('increment_listing_views', { listing_id: id });
    } catch (error) {
      console.error('Error incrementing views:', error);
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

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'seedlings': '🌱',
      'tools': '🛠️',
      'services': '👷',
      'eco-products': '🌿',
      'other': '📦'
    };
    return icons[category] || '📦';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h2>
        <Link to="/app/marketplace" className="text-green-600 hover:underline">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === listing.seller.id;

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate('/app/marketplace')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Images */}
            <div>
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <div className="aspect-square bg-gray-200 relative">
                  {listing.images && listing.images.length > 0 ? (
                    <>
                      <img
                        src={listing.images[currentImageIndex]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                      {listing.images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {listing.images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {getCategoryIcon(listing.category)}
                    </div>
                  )}
                </div>
                
                {listing.images && listing.images.length > 1 && (
                  <div className="p-4 grid grid-cols-4 gap-2">
                    {listing.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          idx === currentImageIndex ? 'border-green-600' : 'border-gray-200'
                        }`}
                      >
                        <img src={img} alt={`${listing.title} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                    <p className="text-4xl font-bold text-green-600">
                      {getCurrencySymbol(listing.currency)} {listing.price.toLocaleString()}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {listing.views_count} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(listing.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="font-medium text-gray-900">
                      {getCategoryIcon(listing.category)} {listing.category.replace('-', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Condition</p>
                    <p className="font-medium text-gray-900 capitalize">{listing.condition}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {listing.location}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="font-bold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="font-bold text-gray-900 mb-4">Seller Information</h2>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={listing.seller.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.seller.full_name)}&background=10b981&color=fff`}
                    alt={listing.seller.full_name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <Link
                      to={`/app/profile/${listing.seller.username}`}
                      className="font-bold text-gray-900 hover:text-green-600 transition-colors"
                    >
                      {listing.seller.full_name}
                    </Link>
                    <p className="text-sm text-gray-600">@{listing.seller.username}</p>
                  </div>
                </div>

                {!isOwner && (
                  <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium">
                    <MessageCircle className="w-5 h-5" />
                    Contact Seller
                  </button>
                )}

                {isOwner && (
                  <div className="space-y-2">
                    <Link
                      to="/app/marketplace/my-listings"
                      className="block w-full text-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      Manage Listing
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
