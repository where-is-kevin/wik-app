import { useRef, useState, useCallback } from "react";

interface UseScrollDirectionOptions {
  threshold?: number; // Minimum scroll distance before triggering
  initialVisible?: boolean;
  disabled?: boolean; // Disable scroll direction detection
}

export const useScrollDirection = (options: UseScrollDirectionOptions = {}) => {
  const { threshold = 10, initialVisible = true, disabled = false } = options;
  const [isHeaderVisible, setIsHeaderVisible] = useState(initialVisible);
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('up');

  const handleScroll = useCallback(
    (event: any) => {
      // Don't update header visibility if disabled
      if (disabled) {
        return;
      }

      const currentScrollY = event.nativeEvent.contentOffset.y;
      const scrollDifference = currentScrollY - lastScrollY.current;

      // Only update if we've scrolled enough to matter
      if (Math.abs(scrollDifference) < threshold) {
        return;
      }

      // Determine scroll direction
      const newDirection = scrollDifference > 0 ? 'down' : 'up';

      // Always update scroll direction
      scrollDirection.current = newDirection;

      // Show header when scrolling up, hide when scrolling down
      // But always show header when at the top
      if (currentScrollY <= 0) {
        setIsHeaderVisible(true);
      } else {
        setIsHeaderVisible(newDirection === 'up');
      }

      lastScrollY.current = currentScrollY;
    },
    [threshold, disabled]
  );

  const resetHeaderVisibility = useCallback(() => {
    setIsHeaderVisible(true);
    lastScrollY.current = 0;
  }, []);

  return {
    isHeaderVisible,
    handleScroll,
    resetHeaderVisibility,
  };
};