import { useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';

export function useViewTracker(postId: string, enabled: boolean = true) {
  const hasTracked = useRef(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !postId || hasTracked.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTracked.current) {
            hasTracked.current = true;
            apiClient.trackPostView(postId).catch(console.error);
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px -50px 0px' }
    );

    // Try multiple ways to find the element
    const element = elementRef.current || document.querySelector(`[data-post-id="${postId}"]`);
    if (element) {
      observer.observe(element);
    } else {
      // Fallback: track view immediately if element not found
      setTimeout(() => {
        if (!hasTracked.current) {
          hasTracked.current = true;
          apiClient.trackPostView(postId).catch(console.error);
        }
      }, 1000);
    }

    return () => {
      observer.disconnect();
    };
  }, [postId, enabled]);

  return elementRef;
}