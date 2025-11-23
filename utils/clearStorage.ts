// Utility to clear all localStorage data
export const clearAllLocalStorage = () => {
  const keysToRemove = [
    'campaigns',
    'submissions',
    'discussions',
    'comments',
    'events',
    'innovations',
    'innovation_hub_settings'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Also clear user-specific data
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('user_votes_') || key.startsWith('challenges_')) {
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ All localStorage data cleared');
};

// Check if this is first run after deployment and clear old data
export const clearOldDataOnce = () => {
  const CLEAR_FLAG = 'data_cleared_v1';
  
  if (!localStorage.getItem(CLEAR_FLAG)) {
    clearAllLocalStorage();
    localStorage.setItem(CLEAR_FLAG, 'true');
    console.log('🧹 Old mock data cleared on first run');
  }
};
