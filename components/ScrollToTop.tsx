import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls the window to the top
 * whenever the location (route) changes
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when the pathname changes
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Add smooth scrolling effect
    });
  }, [pathname]);

  // This component doesn't render anything
  return null;
};

export default ScrollToTop;
