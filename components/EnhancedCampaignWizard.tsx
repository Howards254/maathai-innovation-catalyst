import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCampaigns } from '../contexts/CampaignContext';
import { useUser } from '../contexts/UserContext';
import MapPicker from './MapPicker';
import ImageUpload from './ImageUpload';
import { 
  ArrowLeft, ArrowRight, Check, TreePine, MapPin, 
  Calendar, Users, Target, Image as ImageIcon, 
  Globe, Lock, Sparkles, Eye
} from 'lucide-react';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const steps: WizardStep[] = [
  { id: 'basics', title: 'Campaign Basics', description: 'Title, description, and goals', icon: TreePine },
  { id: 'location', title: 'Location & Timeline', description: 'Where and when', icon: MapPin },
  { id: 'settings', title: 'Campaign Settings', description: 'Privacy and participation', icon: Users },
  { id: 'media', title: 'Media & Launch', description: 'Images and final review', icon: ImageIcon }
];

interface CampaignFormData {
  title: string;
  description: string;
  targetTrees: number;
  location: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  imageUrl: string;
  tags: string[];
  isPublic: boolean;
  maxParticipants?: number;
  requireApproval: boolean;
  milestones: Array<{ trees: number; reward: string }>;
}

interface EnhancedCampaignWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedCampaignWizard: React.FC<EnhancedCampaignWizardProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const { createCampaign } = useCampaigns();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    targetTrees: 100,
    location: '',
    latitude: -1.2921,
    longitude: 36.8219,
    startDate: '',
    endDate: '',
    imageUrl: '',
    tags: [],
    isPublic: true,
    requireApproval: false,
    milestones: [
      { trees: 25, reward: '25% Complete Badge' },
      { trees: 50, reward: 'Halfway Hero Badge' },
      { trees: 75, reward: 'Almost There Badge' },
      { trees: 100, reward: 'Campaign Champion Badge' }
    ]
  });

  const suggestedTags = [
    'reforestation', 'urban-forestry', 'climate-action', 'biodiversity',
    'community', 'education', 'restoration', 'conservation', 'sustainability'
  ];

  const campaignTemplates = [
    {
      title: 'Community Forest Restoration',
      description: 'Restore degraded forest areas in our local community through native tree planting and community engagement.',
      targetTrees: 500,
      tags: ['reforestation', 'community', 'restoration']
    },
    {
      title: 'School Green Initiative',
      description: 'Transform our school grounds into a green oasis while educating students about environmental stewardship.',
      targetTrees: 100,
      tags: ['education', 'community', 'urban-forestry']
    },
    {
      title: 'Urban Canopy Expansion',
      description: 'Increase urban tree cover to combat heat islands and improve air quality in our city.',
      targetTrees: 1000,
      tags: ['urban-forestry', 'climate-action', 'sustainability']
    }
  ];

  const applyTemplate = (template: typeof campaignTemplates[0]) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      description: template.description,
      targetTrees: template.targetTrees,
      tags: template.tags
    }));
  };

  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Basics
        return !!(formData.title.trim() && formData.description.trim() && formData.targetTrees > 0);
      case 1: // Location & Timeline
        return !!(formData.location.trim() && formData.startDate && formData.endDate);
      case 2: // Settings
        return true; // All optional
      case 3: // Media
        return !!formData.imageUrl;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast.error('Please complete all required fields');
      return;
    }

    setLoading(true);
    try {
      await createCampaign({
        title: formData.title,
        description: formData.description,
        targetTrees: formData.targetTrees,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        startDate: formData.startDate,
        endDate: formData.endDate,
        imageUrl: formData.imageUrl,
        tags: formData.tags,
        isPublic: formData.isPublic,
        status: 'active',
        organizer: user?.fullName || ''
      });
      
      toast.success('🌳 Campaign created successfully!');
      onClose();
      navigate('/app/campaigns');
    } catch (error) {
      console.error('Campaign creation error:', error);
      toast.error('Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TreePine className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Create Campaign</h2>
                <p className="text-xs md:text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              ×
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 ${index <= currentStep ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentStep ? 'bg-green-600 text-white' :
                    index === currentStep ? 'bg-green-100 text-green-600 border-2 border-green-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <div className="hidden md:block">
                    <div className="font-medium text-xs">{step.title}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${index < currentStep ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Basics */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <TreePine className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Campaign Basics</h3>
                <p className="text-gray-600">Let's start with the fundamentals of your tree planting campaign</p>
              </div>

              {/* Templates */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Quick Start Templates
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {campaignTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => applyTemplate(template)}
                      className="p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all text-left"
                    >
                      <h5 className="font-medium text-sm mb-1">{template.title}</h5>
                      <p className="text-xs text-gray-600 mb-2">{template.targetTrees} trees</p>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="e.g., Restore the Rift Valley Forest"
                    maxLength={100}
                  />
                  <div className="text-xs text-gray-500 mt-1">{formData.title.length}/100</div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Describe your campaign goals, environmental impact, and how people can contribute..."
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 mt-1">{formData.description.length}/500</div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Target Trees *</label>
                  <input
                    type="number"
                    value={formData.targetTrees}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetTrees: parseInt(e.target.value) || 0 }))}
                    min="1"
                    max="10000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {suggestedTags.slice(0, 6).map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          disabled={formData.tags.includes(tag)}
                          className={`text-xs px-2 py-1 rounded-full transition-colors ${
                            formData.tags.includes(tag)
                              ? 'bg-green-100 text-green-700 cursor-not-allowed'
                              : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="text-green-600 hover:text-green-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location & Timeline */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <MapPin className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Location & Timeline</h3>
                <p className="text-gray-600">Where and when will your campaign take place?</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Campaign Location *</label>
                <MapPicker
                  initialPosition={[formData.latitude, formData.longitude]}
                  onLocationSelect={(lat, lng, address) => {
                    setFormData(prev => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                      location: address || prev.location
                    }));
                  }}
                />
                {formData.location && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <span className="font-semibold">Selected:</span> {formData.location}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {formData.startDate && formData.endDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Campaign Duration</span>
                  </div>
                  <p className="text-blue-700 text-sm mt-1">
                    {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Settings */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Users className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Campaign Settings</h3>
                <p className="text-gray-600">Configure privacy and participation settings</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Campaign Visibility</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.isPublic ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        checked={formData.isPublic}
                        onChange={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium">Public Campaign</div>
                          <div className="text-sm text-gray-600">Anyone can discover and join</div>
                        </div>
                      </div>
                    </label>
                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      !formData.isPublic ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        checked={!formData.isPublic}
                        onChange={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="font-medium">Private Campaign</div>
                          <div className="text-sm text-gray-600">Invite-only participation</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Maximum Participants (Optional)</label>
                  <input
                    type="number"
                    value={formData.maxParticipants || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value ? parseInt(e.target.value) : undefined }))}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Media & Launch */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <ImageIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Media & Launch</h3>
                <p className="text-gray-600">Add a compelling image and review your campaign</p>
              </div>

              <ImageUpload
                label="Campaign Banner Image *"
                folder="campaigns"
                currentImage={formData.imageUrl}
                onUploadComplete={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
              />

              {/* Preview */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Campaign Preview</span>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="Campaign" className="w-full h-32 object-cover" />
                  )}
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 mb-2">{formData.title || 'Campaign Title'}</h4>
                    <p className="text-sm text-gray-600 mb-3">{formData.description || 'Campaign description...'}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600 font-medium">🌳 {formData.targetTrees} trees</span>
                      <span className="text-gray-500">📍 {formData.location || 'Location'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !validateStep(3)}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <TreePine className="w-4 h-4" />
                      Launch Campaign
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCampaignWizard;