import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TreePine, Users, TrendingUp, Heart, Sparkles, ArrowRight, Zap, Target, Globe } from 'lucide-react';

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
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 via-green-800/85 to-emerald-900/90" />
        
        {/* Animated Blobs */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
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

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">How We Create Impact</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Every action counts in our mission to restore the planet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <TreePine className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Plant & Track Trees</h3>
              <p className="text-gray-600 mb-6">
                Join campaigns, plant trees, and track your environmental impact with our gamified system.
              </p>
              <Link to="/app/campaigns" className="inline-flex items-center text-green-600 font-medium group-hover:gap-2 transition-all">
                Start Planting <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Build Community</h3>
              <p className="text-gray-600 mb-6">
                Connect with like-minded individuals, share knowledge, and organize local environmental events.
              </p>
              <Link to="/app/discussions" className="inline-flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                Join Discussions <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Innovate Solutions</h3>
              <p className="text-gray-600 mb-6">
                Submit environmental innovations, earn badges, and compete on the global leaderboard.
              </p>
              <Link to="/app/innovation" className="inline-flex items-center text-yellow-600 font-medium group-hover:gap-2 transition-all">
                Innovate Now <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Our Global Impact</h2>
            <p className="text-lg text-gray-600">Together, we're making a measurable difference</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <TreePine className="text-green-600" size={32} />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-green-800 mb-2">1.2M+</h2>
              <p className="text-gray-600 font-medium">Trees Planted</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Users className="text-blue-600" size={32} />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-green-800 mb-2">50K+</h2>
              <p className="text-gray-600 font-medium">Active Members</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Target className="text-emerald-600" size={32} />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-green-800 mb-2">850+</h2>
              <p className="text-gray-600 font-medium">Active Campaigns</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Globe className="text-green-600" size={32} />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-green-800 mb-2">120+</h2>
              <p className="text-gray-600 font-medium">Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-green-800 via-green-700 to-emerald-800 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
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