import { lazy } from 'react';

export const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      const pageHasAlreadyBeenForceRefreshed = JSON.parse(
        window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
      );

      if (!pageHasAlreadyBeenForceRefreshed) {
        // Caching the refresh status to avoid infinite loops
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        
        // Use a more robust reload that bypasses cache
        const url = new URL(window.location.href);
        url.searchParams.set('v', Date.now()); // Force cache bypass
        window.location.replace(url.href);
      }
      
      throw error;
    }
  });
