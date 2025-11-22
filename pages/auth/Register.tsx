import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ChevronRight, ChevronLeft, User, MapPin, Heart, Briefcase, Users, CheckCircle } from 'lucide-react';

const Register: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    locationCity: '',
    locationCountry: '',
    experienceLevel: 'beginner',
    availability: 'weekends',
    causes: [] as string[],
    skills: [] as string[],
    activities: [] as string[],
    lookingFor: [] as string[],
    maxDistance: 50
  });

  const causes = [
    { id: 'climate_change', label: 'Climate Change', icon: '🌡️' },
    { id: 'tree_planting', label: 'Tree Planting', icon: '🌱' },
    { id: 'conservation', label: 'Conservation', icon: '🦋' },
    { id: 'renewable_energy', label: 'Renewable Energy', icon: '⚡' },
    { id: 'waste_reduction', label: 'Waste Reduction', icon: '♻️' },
    { id: 'water_protection', label: 'Water Protection', icon: '💧' },
    { id: 'biodiversity', label: 'Biodiversity', icon: '🐾' },
    { id: 'sustainable_agriculture', label: 'Sustainable Agriculture', icon: '🌾' }
  ];

  const skills = [
    { id: 'leadership', label: 'Leadership', icon: '👑' },
    { id: 'project_management', label: 'Project Management', icon: '📋' },
    { id: 'research', label: 'Research', icon: '🔬' },
    { id: 'communication', label: 'Communication', icon: '💬' },
    { id: 'fundraising', label: 'Fundraising', icon: '💰' },
    { id: 'social_media', label: 'Social Media', icon: '📱' },
    { id: 'event_planning', label: 'Event Planning', icon: '🎉' },
    { id: 'teaching', label: 'Teaching', icon: '🎓' }
  ];

  const activities = [
    { id: 'tree_planting', label: 'Tree Planting', icon: '🌳' },
    { id: 'beach_cleanup', label: 'Beach Cleanup', icon: '🏖️' },
    { id: 'community_gardens', label: 'Community Gardens', icon: '🌻' },
    { id: 'workshops', label: 'Workshops', icon: '🛠️' },
    { id: 'research', label: 'Research', icon: '📊' },
    { id: 'awareness_campaigns', label: 'Awareness Campaigns', icon: '📢' },
    { id: 'mentoring', label: 'Mentoring', icon: '🤝' },
    { id: 'organizing_events', label: 'Organizing Events', icon: '📅' }
  ];

  const lookingForOptions = [
    { id: 'teammates', label: 'Teammates', icon: '👥' },
    { id: 'volunteers', label: 'Volunteers', icon: '🙋' },
    { id: 'mentors', label: 'Mentors', icon: '👨‍🏫' },
    { id: 'mentees', label: 'Mentees', icon: '👨‍🎓' },
    { id: 'collaborators', label: 'Collaborators', icon: '🤝' },
    { id: 'friends', label: 'Friends', icon: '👫' }
  ];

  const handleArrayToggle = (field: keyof typeof formData, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { user } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        location_city: formData.locationCity,
        location_country: formData.locationCountry,
        experience_level: formData.experienceLevel,
        availability: formData.availability,
        looking_for: formData.lookingFor,
        max_distance_km: formData.maxDistance
      });
      
      if (user) {
        // Add user preferences
        const userCauses = formData.causes.map(cause => ({ user_id: user.id, cause }));
        const userSkills = formData.skills.map(skill => ({ user_id: user.id, skill }));
        const userActivities = formData.activities.map(activity => ({ user_id: user.id, activity }));
        
        await Promise.all([
          supabase.from('user_causes').insert(userCauses),
          supabase.from('user_skills').insert(userSkills),
          supabase.from('user_activities').insert(userActivities),
          supabase.from('matchmaking_preferences').insert({
            user_id: user.id,
            match_for: formData.lookingFor,
            is_active: true
          })
        ]);
      }
      navigate('/app/dashboard');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.email && formData.password && formData.confirmPassword && formData.fullName;
      case 2: return formData.locationCity && formData.locationCountry;
      case 3: return formData.causes.length > 0;
      case 4: return formData.skills.length > 0 && formData.activities.length > 0;
      case 5: return formData.lookingFor.length > 0;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-emerald-500 h-2">
          <div 
            className="bg-emerald-600 h-full transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Join the Movement</h1>
            <p className="text-gray-600">Step {currentStep} of 5</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-emerald-600 mb-4">
                  <User className="w-5 h-5" />
                  <span className="font-medium">Basic Information</span>
                </div>
                
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            {/* Step 2: Location & Experience */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-emerald-600 mb-4">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">Location & Experience</span>
                </div>
                
                <input
                  type="text"
                  placeholder="City"
                  value={formData.locationCity}
                  onChange={(e) => setFormData(prev => ({ ...prev, locationCity: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                
                <input
                  type="text"
                  placeholder="Country"
                  value={formData.locationCountry}
                  onChange={(e) => setFormData(prev => ({ ...prev, locationCountry: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="beginner">🌱 Beginner</option>
                  <option value="intermediate">🌿 Intermediate</option>
                  <option value="advanced">🌳 Advanced</option>
                  <option value="expert">🏆 Expert</option>
                </select>
                
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="weekdays">Weekdays</option>
                  <option value="weekends">Weekends</option>
                  <option value="evenings">Evenings</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            )}

            {/* Step 3: Environmental Causes */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-emerald-600 mb-4">
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">What causes do you care about?</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {causes.map(cause => (
                    <button
                      key={cause.id}
                      type="button"
                      onClick={() => handleArrayToggle('causes', cause.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        formData.causes.includes(cause.id)
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="text-lg mb-1">{cause.icon}</div>
                      <div className="text-sm font-medium">{cause.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Skills & Activities */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-emerald-600 mb-4">
                  <Briefcase className="w-5 h-5" />
                  <span className="font-medium">Skills & Preferred Activities</span>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Your Skills</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {skills.map(skill => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => handleArrayToggle('skills', skill.id)}
                        className={`p-2 rounded-lg border text-sm transition-all ${
                          formData.skills.includes(skill.id)
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        {skill.icon} {skill.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Preferred Activities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {activities.map(activity => (
                      <button
                        key={activity.id}
                        type="button"
                        onClick={() => handleArrayToggle('activities', activity.id)}
                        className={`p-2 rounded-lg border text-sm transition-all ${
                          formData.activities.includes(activity.id)
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        {activity.icon} {activity.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Looking For */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-emerald-600 mb-4">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">What are you looking for?</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {lookingForOptions.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleArrayToggle('lookingFor', option.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        formData.lookingFor.includes(option.id)
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum distance for matches (km)
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="500"
                    value={formData.maxDistance}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600 mt-1">
                    {formData.maxDistance} km
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}
              
              <div className="flex-1" />
              
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="flex items-center space-x-2 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !isStepValid()}
                  className="flex items-center space-x-2 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Creating...' : 'Join Now'}</span>
                </button>
              )}
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;