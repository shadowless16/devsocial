import { useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';

export function useViewTracker(postId: string, enabled: boolean = true) {
  const hasTracked = useRef(false);

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
      { threshold: 0.5, rootMargin: '0px 0px -100px 0px' }
    );

    const element = document.querySelector(`[data-post-id="${postId}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [postId, enabled]);
}