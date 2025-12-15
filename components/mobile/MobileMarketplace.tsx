import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, MapPin } from 'lucide-react';

const MobileMarketplace: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', icon: '🛒' },
    { id: 'seedlings', label: 'Seedlings', icon: '🌱' },
    { id: 'tools', label: 'Tools', icon: '🛠️' },
    { id: 'eco-products', label: 'Eco Products', icon: '🌿' },
    { id: 'services', label: 'Services', icon: '👷' }
  ];

  // Mock listings data
  const listings = [
    {
      id: '1',
      title: 'Organic Tree Seedlings',
      price: 500,
      currency: 'KES',
      location: 'Nairobi, Kenya',
      images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'],
      seller: { name: 'John Doe', avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=10b981&color=fff' }
    },
    {
      id: '2',
      title: 'Garden Tools Set',
      price: 2500,
      currency: 'KES',
      location: 'Mombasa, Kenya',
      images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'],
      seller: { name: 'Jane Smith', avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=10b981&color=fff' }
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-14 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">Marketplace</h1>
          <Link
            to="/app/marketplace/create"
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-full text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Sell
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3 pb-20">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              to={`/app/marketplace/${listing.id}`}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-green-300 transition-colors"
            >
              <div className="aspect-square bg-gray-200">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                  {listing.title}
                </h3>
                
                <p className="text-lg font-bold text-green-600 mb-2">
                  KSh {listing.price.toLocaleString()}
                </p>
                
                <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                  <MapPin className="w-3 h-3" />
                  {listing.location}
                </div>
                
                <div className="flex items-center gap-2">
                  <img
                    src={listing.seller.avatar}
                    alt={listing.seller.name}
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-xs text-gray-600 truncate">
                    {listing.seller.name}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileMarketplace;