import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Send, MessageCircle, Users, TreePine, Sparkles, Heart, Globe2 } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
    toast.success('Thank you for your message! We\'ll get back to you soon.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
            <Link to="/about" className="text-gray-600 font-medium hover:text-gray-900 hidden sm:block">About</Link>
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
            <Heart className="w-4 h-4" />
            <span className="text-sm font-semibold">We're Here to Help</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">
            Get in <span className="text-green-200">Touch</span>
          </h1>
          <p className="text-lg sm:text-xl text-green-50 mb-8 max-w-3xl mx-auto">
            Have questions? Want to partner with us? We'd love to hear from you 
            and help you join our environmental restoration mission.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="technical">Technical Support</option>
                    <option value="campaign">Campaign Collaboration</option>
                    <option value="media">Media & Press</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <p className="text-lg text-gray-600 mb-8">
                  We're here to help you make a positive environmental impact. Reach out through any of these channels.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-green-50 rounded-2xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Mail className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
                    <p className="text-gray-600 mb-2">For general inquiries and support</p>
                    <a href="mailto:hello@maathai-catalyst.org" className="text-green-600 font-medium hover:text-green-700">
                      hello@maathai-catalyst.org
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-blue-50 rounded-2xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <MessageCircle className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Community Support</h3>
                    <p className="text-gray-600 mb-2">Join our community discussions</p>
                    <Link to="/app/discussions" className="text-blue-600 font-medium hover:text-blue-700">
                      Visit Discussion Forum
                    </Link>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-purple-50 rounded-2xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Partnerships</h3>
                    <p className="text-gray-600 mb-2">Collaborate with us on environmental initiatives</p>
                    <a href="mailto:partnerships@maathai-catalyst.org" className="text-purple-600 font-medium hover:text-purple-700">
                      partnerships@maathai-catalyst.org
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white p-8 rounded-2xl">
                <h3 className="text-2xl font-bold mb-6">Join Our Impact</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">1.2M+</div>
                    <div className="text-green-100 text-sm">Trees Planted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">50K+</div>
                    <div className="text-green-100 text-sm">Active Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">850+</div>
                    <div className="text-green-100 text-sm">Campaigns</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">120+</div>
                    <div className="text-green-100 text-sm">Countries</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/50" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full mb-4 shadow-sm">
              <Sparkles className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">FAQ</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Quick answers to common questions</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold text-gray-900 mb-3">How do I start a tree planting campaign?</h3>
              <p className="text-gray-600">
                Simply create an account, navigate to the campaigns section, and click "Create Campaign." 
                You'll be guided through setting up your campaign goals, location, and timeline.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Is the platform free to use?</h3>
              <p className="text-gray-600">
                Yes! Our platform is completely free for individuals and communities. We believe environmental 
                action should be accessible to everyone.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold text-gray-900 mb-3">How do I track my environmental impact?</h3>
              <p className="text-gray-600">
                Every tree you plant, event you attend, and discussion you participate in earns impact points. 
                Your dashboard shows your total impact and progress toward badges and achievements.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Can organizations partner with you?</h3>
              <p className="text-gray-600">
                Absolutely! We welcome partnerships with environmental organizations, schools, and businesses. 
                Contact us at partnerships@maathai-catalyst.org to discuss collaboration opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-20 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-10 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
            <Globe2 className="text-white" size={40} />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 text-green-100">
            Join thousands of environmental champions already making an impact on our platform.
          </p>
          <Link to="/register" className="inline-block">
            <button className="group px-8 py-4 bg-white text-green-600 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto">
              Start Your Journey Today
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>
          </Link>
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
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
          <p>© {new Date().getFullYear()} GreenVerse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;