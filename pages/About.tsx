import { Link } from 'react-router-dom';
import { TreePine, Users, Heart, Award, Globe2, MessageCircle, Camera, UserPlus, Zap, Calendar, Sparkles, Target } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
              🌱
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900 hidden sm:block">GreenVerse</span>
            <span className="text-lg font-bold text-gray-900 sm:hidden">MIC</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/contact" className="text-gray-600 font-medium hover:text-gray-900 hidden sm:block">Contact</Link>
            <Link to="/login" className="text-gray-600 font-medium hover:text-gray-900 text-sm sm:text-base">Log In</Link>
            <Link to="/register" className="px-3 py-1.5 sm:px-6 sm:py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors text-sm sm:text-base">
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Our Story</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">
            About Our <span className="text-green-200">Mission</span>
          </h1>
          <p className="text-lg sm:text-xl text-green-50 mb-8 max-w-3xl mx-auto">
            Inspired by Nobel Peace Prize winner Wangari Maathai, we're building a social platform 
            for environmental restoration through community, innovation, and collective action.
          </p>
        </div>
      </section>

      {/* Wangari Maathai Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Inspired by Wangari Maathai</h2>
              <p className="text-lg text-gray-600 mb-6">
                "It's the little things citizens do. That's what will make the difference. My little thing is planting trees."
              </p>
              <p className="text-gray-600 mb-6">
                Wangari Maathai founded the Green Belt Movement in 1977, which has planted over 51 million trees 
                across Kenya. Her work demonstrated that environmental conservation and social empowerment go hand in hand.
              </p>
              <p className="text-gray-600">
                Our platform continues her legacy by connecting people worldwide to plant trees, share knowledge, 
                and create sustainable solutions for our planet's future.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6">
                  🌳
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Green Belt Movement Legacy</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-600">51M+</div>
                    <div className="text-sm text-gray-600">Trees Planted</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">30K+</div>
                    <div className="text-sm text-gray-600">Women Trained</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600">The principles that guide our environmental mission</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6">
                <TreePine className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Environmental Restoration</h3>
              <p className="text-gray-600">
                We believe in taking direct action to restore our planet's ecosystems through tree planting and conservation efforts.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
                <Users className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Community Empowerment</h3>
              <p className="text-gray-600">
                Environmental change happens when communities come together. We facilitate connections and knowledge sharing.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-2xl mb-6">
                <Zap className="text-yellow-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation & Impact</h3>
              <p className="text-gray-600">
                We encourage innovative solutions and measure real impact through gamification and transparent tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">Platform Features</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Social Tools for Environmental Action</h2>
            <p className="text-lg text-gray-600">Everything you need to make an impact</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white hover:scale-105 transition-all shadow-lg">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                <TreePine size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Tree Campaigns</h3>
              <p className="text-green-50 text-sm">Create and join tree planting campaigns with progress tracking</p>
            </div>
            
            <div className="group bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl text-white hover:scale-105 transition-all shadow-lg">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                <MessageCircle size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Direct Messaging</h3>
              <p className="text-blue-50 text-sm">Chat with friends and share environmental updates</p>
            </div>
            
            <div className="group bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl text-white hover:scale-105 transition-all shadow-lg">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                <Camera size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Stories & Reels</h3>
              <p className="text-purple-50 text-sm">Share your journey with TikTok-style stories</p>
            </div>
            
            <div className="group bg-gradient-to-br from-pink-500 to-rose-600 p-6 rounded-2xl text-white hover:scale-105 transition-all shadow-lg">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                <UserPlus size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Green Matchmaking</h3>
              <p className="text-pink-50 text-sm">Find eco-conscious friends with shared interests</p>
            </div>
            
            <div className="group bg-gradient-to-br from-yellow-500 to-orange-600 p-6 rounded-2xl text-white hover:scale-105 transition-all shadow-lg">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Badges & Rewards</h3>
              <p className="text-yellow-50 text-sm">Earn achievements and climb the leaderboard</p>
            </div>
            
            <div className="group bg-gradient-to-br from-teal-500 to-cyan-600 p-6 rounded-2xl text-white hover:scale-105 transition-all shadow-lg">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                <Calendar size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Events & Meetups</h3>
              <p className="text-teal-50 text-sm">Organize local environmental events</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Join Our Growing Community</h2>
          <p className="text-xl mb-8 text-green-100">
            Be part of a global movement working toward a sustainable future. Every tree planted makes a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-block">
              <button className="px-8 py-4 bg-white text-green-600 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Start Planting Today
              </button>
            </Link>
            <Link to="/contact" className="inline-block">
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/40 text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-green-600 hover:scale-105 transition-all duration-300">
                Get in Touch
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-gray-400">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">🌱</div>
            <span className="text-lg font-bold text-white">GreenVerse</span>
          </div>
          <p className="mb-4">Inspired by Wangari Maathai's legacy of environmental restoration and community empowerment.</p>
          <div className="flex justify-center gap-6 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
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

export default About;