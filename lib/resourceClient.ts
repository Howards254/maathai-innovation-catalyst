// Environmental resource client for tree planting guidance
// Provides expert advice and recommendations

interface ResourceResponse {
  text: string;
  confidence: number;
}

class EnvironmentalResourceClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateAdvice(prompt: string): Promise<ResourceResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerPrompt = prompt.toLowerCase();

    // Tree species and planting advice
    if (lowerPrompt.includes('tree') || lowerPrompt.includes('plant') || lowerPrompt.includes('species')) {
      const responses = [
        "For Kenya, I recommend indigenous species like Acacia (drought-resistant), Baobab (iconic and long-living), Moringa (nutritious leaves), or Mukwa (excellent timber). These provide soil conservation, carbon sequestration, and community benefits.",
        "Consider native trees like Meru Oak, African Olive, or Croton for highland areas. For coastal regions, try Coconut palms, Casuarina, or Mangroves. Always match species to your local climate and soil conditions.",
        "Fast-growing options include Eucalyptus (though use carefully), Grevillea, or Bamboo. For fruit trees, try indigenous varieties like Baobab fruit, Marula, or Tamarind which are adapted to local conditions."
      ];
      return { text: responses[Math.floor(Math.random() * responses.length)], confidence: 0.90 };
    }

    // Campaign and organizing advice
    if (lowerPrompt.includes('campaign') || lowerPrompt.includes('organize') || lowerPrompt.includes('event')) {
      const responses = [
        "Start your campaign by: 1) Identifying degraded land or areas needing trees, 2) Partnering with local communities and schools, 3) Securing quality seedlings from certified nurseries, 4) Planning for rainy season planting, 5) Organizing follow-up care and monitoring.",
        "Successful campaigns need community buy-in. Hold meetings with local leaders, involve schools and youth groups, provide training on proper planting techniques, and create a maintenance schedule. Consider starting small and scaling up.",
        "Key steps: Site assessment, species selection, community engagement, seedling procurement, planting event organization, and long-term care planning. Partner with local environmental groups and government forestry departments."
      ];
      return { text: responses[Math.floor(Math.random() * responses.length)], confidence: 0.88 };
    }

    // Soil and preparation
    if (lowerPrompt.includes('soil') || lowerPrompt.includes('preparation') || lowerPrompt.includes('dig')) {
      return {
        text: "Soil preparation is critical! Test pH (6.0-7.5 ideal), ensure good drainage, add organic compost or manure. Dig holes 2-3x wider than root ball, same depth. Plant at start of rainy season. Water regularly first 2 years until established.",
        confidence: 0.92
      };
    }

    // Environmental benefits
    if (lowerPrompt.includes('benefit') || lowerPrompt.includes('environment') || lowerPrompt.includes('carbon')) {
      return {
        text: "Trees provide amazing benefits: carbon sequestration (1 tree absorbs ~48lbs CO2/year), soil erosion prevention, water cycle regulation, biodiversity habitat, air purification, and temperature cooling. Plus economic benefits like timber, fruits, and eco-tourism!",
        confidence: 0.89
      };
    }

    // Maintenance and care
    if (lowerPrompt.includes('care') || lowerPrompt.includes('maintain') || lowerPrompt.includes('water')) {
      return {
        text: "Tree care essentials: Water regularly for first 2 years (deep, infrequent watering is best), mulch around base to retain moisture, prune dead branches, protect from livestock, and monitor for pests/diseases. Survival rate improves dramatically with proper care!",
        confidence: 0.87
      };
    }

    // Seasonal advice
    if (lowerPrompt.includes('season') || lowerPrompt.includes('when') || lowerPrompt.includes('time')) {
      return {
        text: "Best planting time in Kenya is start of long rains (March-May) or short rains (October-December). Avoid dry seasons. Seedlings need consistent moisture for establishment. Plan your campaign timing around these natural cycles!",
        confidence: 0.91
      };
    }

    // Wangari Maathai inspiration
    if (lowerPrompt.includes('maathai') || lowerPrompt.includes('inspiration') || lowerPrompt.includes('green belt')) {
      return {
        text: "Wangari Maathai showed us that environmental restoration starts with small actions. The Green Belt Movement planted over 51 million trees! Her approach: empower communities, focus on indigenous species, combine environmental and social justice. Every tree counts!",
        confidence: 0.95
      };
    }

    // Default helpful response
    const defaultResponses = [
      "I'm here to help with tree planting, environmental restoration, and campaign organization! Ask me about tree species, soil preparation, planting techniques, or how to organize community events.",
      "As your environmental assistant, I can help with: choosing the right tree species for your area, planning planting campaigns, soil preparation tips, seasonal timing, and maintenance advice. What would you like to know?",
      "Let's make an environmental impact together! I can advise on indigenous tree species, sustainable planting practices, community engagement strategies, and ecological restoration techniques. How can I help your green mission?"
    ];
    
    return {
      text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
      confidence: 0.80
    };
  }

  async getSuggestions(context: string): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const suggestions = [
      "What are the best indigenous trees for my region?",
      "How do I prepare soil for tree planting?",
      "What's the best time of year to plant trees?",
      "How can I organize a community tree planting event?",
      "What are the environmental benefits of different tree species?"
    ];

    return suggestions.slice(0, 3);
  }
}

// Initialize client
const apiKey = 'environmental-resource-client';
export const resourceClient = new EnvironmentalResourceClient(apiKey);

// Helper functions
export const getTreeRecommendations = async (location: string, soilType?: string) => {
  const prompt = `Recommend indigenous tree species for ${location}${soilType ? ` with ${soilType} soil` : ''}. Focus on environmental benefits and sustainability.`;
  return await resourceClient.generateAdvice(prompt);
};

export const getCampaignAdvice = async (campaignType: string, location: string) => {
  const prompt = `Provide advice for organizing a ${campaignType} tree planting campaign in ${location}. Include practical tips for success.`;
  return await resourceClient.generateAdvice(prompt);
};

export const getPlantingTips = async (treeSpecies: string, season: string) => {
  const prompt = `Give specific planting and care tips for ${treeSpecies} trees during ${season}. Include soil preparation and maintenance advice.`;
  return await resourceClient.generateAdvice(prompt);
};