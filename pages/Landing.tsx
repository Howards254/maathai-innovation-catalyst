import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TreePine, Users, Heart, Sparkles, ArrowRight, Zap, MessageCircle, Camera, UserPlus, Globe2, Award, Calendar } from 'lucide-react';

const Landing = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1920&q=80'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 py-4 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold border border-white/30">
              🌱
            </div>
            <span className="text-lg sm:text-xl font-bold text-white hidden sm:block">GreenVerse</span>
            <span className="text-lg font-bold text-white sm:hidden">MIC</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/about" className="text-white/90 font-medium hover:text-white transition-colors hidden sm:block">About</Link>
            <Link to="/contact" className="text-white/90 font-medium hover:text-white transition-colors hidden sm:block">Contact</Link>
            <Link to="/login" className="text-white/90 font-medium hover:text-white transition-colors text-sm sm:text-base">Log In</Link>
            <Link to="/register" className="px-3 py-1.5 sm:px-6 sm:py-2 bg-white/20 backdrop-blur-sm text-white rounded-full font-medium hover:bg-white/30 transition-all border border-white/30 text-sm sm:text-base">
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Carousel */}
      <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
        {/* Background Image Carousel */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center animate-ken-burns"
                style={{ backgroundImage: `url(${image})` }}
              />
            </div>
          ))}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/95 via-emerald-900/90 to-teal-900/95" />
        
        {/* Animated Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-400/20 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-400/20 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-teal-400/20 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000" />
          
          {/* Floating Icons */}
          <div className="absolute top-1/4 left-1/4 animate-float">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <TreePine className="w-6 h-6 text-green-300" />
            </div>
          </div>
          <div className="absolute top-1/3 right-1/4 animate-float animation-delay-1000">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-blue-300" />
            </div>
          </div>
          <div className="absolute bottom-1/3 left-1/3 animate-float animation-delay-2000">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-purple-300" />
            </div>
          </div>
          <div className="absolute bottom-1/4 right-1/3 animate-float animation-delay-3000">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-pink-300" />
            </div>
          </div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 animate-fade-in-down">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Inspired by Wangari Maathai</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up leading-tight">
            Planting Seeds of <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">Change</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Join a global community restoring our planet through tree planting campaigns, environmental innovation, and collective action.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Link to="/register" className="inline-block">
              <button className="group px-8 py-4 bg-white text-green-800 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2">
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/app/campaigns" className="inline-block">
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/40 text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-green-800 hover:scale-105 transition-all duration-300 shadow-xl">
                Explore Campaigns
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-12 sm:mt-16 max-w-2xl mx-auto animate-fade-in-up animation-delay-600">
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold text-green-300 mb-1">1.2M+</div>
              <div className="text-xs sm:text-sm text-green-200">Trees Planted</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold text-green-300 mb-1">50K+</div>
              <div className="text-xs sm:text-sm text-green-200">Members</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold text-green-300 mb-1">850+</div>
              <div className="text-xs sm:text-sm text-green-200">Campaigns</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Social Features Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">Social Environmental Platform</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Connect. Share. Impact.</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A social platform designed for environmental action with features you love
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="group relative bg-gradient-to-br from-green-500 to-emerald-600 p-8 rounded-3xl text-white hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="absolute inset-0 bg-black/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                <TreePine className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Plant Trees</h3>
              <p className="text-green-50 mb-4">Join campaigns and track your environmental impact with gamification</p>
              <Link to="/app/campaigns" className="inline-flex items-center font-semibold group-hover:gap-2 transition-all">
                Explore <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-3xl text-white hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="absolute inset-0 bg-black/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Direct Messaging</h3>
              <p className="text-blue-50 mb-4">Chat with friends, share media, and coordinate environmental actions</p>
              <Link to="/app/messages" className="inline-flex items-center font-semibold group-hover:gap-2 transition-all">
                Message <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-purple-500 to-pink-600 p-8 rounded-3xl text-white hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="absolute inset-0 bg-black/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                <Camera className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Stories & Reels</h3>
              <p className="text-purple-50 mb-4">Share your environmental journey with TikTok-style stories</p>
              <Link to="/app/stories" className="inline-flex items-center font-semibold group-hover:gap-2 transition-all">
                Create <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-pink-500 to-rose-600 p-8 rounded-3xl text-white hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="absolute inset-0 bg-black/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                <UserPlus className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Green Matchmaking</h3>
              <p className="text-pink-50 mb-4">Find eco-conscious friends based on shared interests and goals</p>
              <Link to="/app/matchmaking" className="inline-flex items-center font-semibold group-hover:gap-2 transition-all">
                Match <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-yellow-500 to-orange-600 p-8 rounded-3xl text-white hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="absolute inset-0 bg-black/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Badges & Rewards</h3>
              <p className="text-yellow-50 mb-4">Earn points, unlock achievements, and climb the leaderboard</p>
              <Link to="/app/leaderboard" className="inline-flex items-center font-semibold group-hover:gap-2 transition-all">
                Compete <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-teal-500 to-cyan-600 p-8 rounded-3xl text-white hover:scale-105 transition-all duration-300 shadow-xl">
            <div className="absolute inset-0 bg-black/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Events & Meetups</h3>
              <p className="text-teal-50 mb-4">Organize and join local environmental events in your area</p>
              <Link to="/app/events" className="inline-flex items-center font-semibold group-hover:gap-2 transition-all">
                Join <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats with Animation */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/50" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Our Global Impact</h2>
            <p className="text-lg text-gray-600">Together, we're making a measurable difference</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                <TreePine className="text-white" size={36} />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">1.2M+</h2>
              <p className="text-gray-600 font-semibold">Trees Planted</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                <Users className="text-white" size={36} />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">50K+</h2>
              <p className="text-gray-600 font-semibold">Active Members</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                <Zap className="text-white" size={36} />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">850+</h2>
              <p className="text-gray-600 font-semibold">Active Campaigns</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                <Globe2 className="text-white" size={36} />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">120+</h2>
              <p className="text-gray-600 font-semibold">Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-10 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Join the Movement</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Plant Your Legacy?</h2>
          <p className="text-xl mb-10 text-green-100 max-w-2xl mx-auto">
            Every tree planted is a step toward a sustainable future. Start your environmental journey today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-block">
              <button className="group px-8 py-4 bg-white text-green-800 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2">
                Create Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/app/campaigns" className="inline-block">
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/40 text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-green-800 hover:scale-105 transition-all duration-300 shadow-xl">
                Browse Campaigns
              </button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 py-12 text-gray-400 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">🌱</div>
            <span className="text-lg font-bold text-white">GreenVerse</span>
          </div>
          <p className="mb-4">Inspired by Wangari Maathai's legacy of environmental restoration and community empowerment.</p>
          <div className="flex justify-center gap-6 mb-6">
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
          <p>© {new Date().getFullYear()} GreenVerse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;