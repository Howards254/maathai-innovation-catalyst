import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Send, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';

interface Message {
  id: string;
  message: string;
  sender_id: string;
  created_at: string;
  offer_amount?: number;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  currency: string;
  images: string[];
  seller: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

const ListingChat: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadListing();
      loadMessages();
      subscribeToMessages();
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadListing = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          seller:profiles!marketplace_listings_seller_id_fkey(id, full_name, avatar_url)
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

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_messages')
        .select('*')
        .eq('listing_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`listing_${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'marketplace_messages',
          filter: `listing_id=eq.${id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !listing) return;

    try {
      const { error } = await supabase
        .from('marketplace_messages')
        .insert({
          listing_id: id,
          sender_id: user.id,
          receiver_id: listing.seller.id,
          message: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const sendOffer = async () => {
    if (!offerAmount || !user || !listing) return;

    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid offer amount');
      return;
    }

    try {
      const { error } = await supabase
        .from('marketplace_messages')
        .insert({
          listing_id: id,
          sender_id: user.id,
          receiver_id: listing.seller.id,
          message: `Made an offer of ${getCurrencySymbol(listing.currency)} ${amount.toLocaleString()}`,
          offer_amount: amount
        });

      if (error) throw error;
      setOfferAmount('');
      setShowOfferInput(false);
      toast.success('Offer sent!');
    } catch (error) {
      console.error('Error sending offer:', error);
      toast.error('Failed to send offer');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      </div>
    );
  }

  const isOwner = user?.id === listing.seller.id;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(`/app/marketplace/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 flex-1">
            {listing.images && listing.images.length > 0 && (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <h2 className="font-bold text-gray-900">{listing.title}</h2>
              <p className="text-sm text-green-600 font-bold">
                {getCurrencySymbol(listing.currency)} {listing.price.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <img
              src={listing.seller.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.seller.full_name)}&background=10b981&color=fff`}
              alt={listing.seller.full_name}
              className="w-10 h-10 rounded-full"
            />
            <span className="text-sm font-medium text-gray-900 hidden sm:block">
              {listing.seller.full_name}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg) => {
            const isSender = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isSender
                      ? 'bg-green-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  {msg.offer_amount && (
                    <div className={`flex items-center gap-2 mb-1 pb-2 border-b ${isSender ? 'border-green-500' : 'border-gray-200'}`}>
                      <DollarSign className="w-4 h-4" />
                      <span className="font-bold">Offer: {getCurrencySymbol(listing.currency)} {msg.offer_amount.toLocaleString()}</span>
                    </div>
                  )}
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${isSender ? 'text-green-100' : 'text-gray-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {!isOwner && (
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            {showOfferInput ? (
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder="Enter offer amount"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  step="0.01"
                  min="0"
                />
                <button
                  onClick={sendOffer}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                >
                  Send Offer
                </button>
                <button
                  onClick={() => setShowOfferInput(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowOfferInput(true)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Make Offer
                </button>
                <form onSubmit={sendMessage} className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingChat;
