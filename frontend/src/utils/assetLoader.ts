import { useEffect } from 'react';

/**
 * Asset loading utilities for performance optimization
 *
 * Features:
 * - Preload critical resources
 * - Lazy load non-critical assets
 * - Cache management
 * - Error handling and retry logic
 */

interface PreloadOptions {
  as: 'script' | 'style' | 'image' | 'font' | 'fetch';
  crossorigin?: 'anonymous' | 'use-credentials';
  type?: string;
  priority?: 'high' | 'low';
}

interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  retry?: number;
}

class AssetLoader {
  private preloadedAssets = new Set<string>();
  private loadingPromises = new Map<string, Promise<void>>();
  private retryCount = new Map<string, number>();

  /**
   * Preload a critical resource
   */
  preload(href: string, options: PreloadOptions): Promise<void> {
    if (this.preloadedAssets.has(href)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(href)) {
      return this.loadingPromises.get(href)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = options.as;
      
      if (options.crossorigin) {
        link.crossOrigin = options.crossorigin;
      }
      
      if (options.type) {
        link.type = options.type;
      }

      // Set priority hint if supported
      if (options.priority && 'fetchPriority' in link) {
        (link as any).fetchPriority = options.priority;
      }

      link.onload = () => {
        this.preloadedAssets.add(href);
        resolve();
      };

      link.onerror = () => {
        reject(new Error(`Failed to preload ${href}`));
      };

      document.head.appendChild(link);
    });

    this.loadingPromises.set(href, promise);
    return promise;
  }

  /**
   * Preload multiple assets
   */
  async preloadMultiple(assets: Array<{ href: string; options: PreloadOptions }>): Promise<void> {
    const promises = assets.map(({ href, options }) => 
      this.preload(href, options).catch(error => {
        console.warn(`Failed to preload ${href}:`, error);
      })
    );

    await Promise.allSettled(promises);
  }

  /**
   * Lazy load an image with Intersection Observer
   */
  lazyLoadImage(
    img: HTMLImageElement, 
    src: string, 
    options: LazyLoadOptions = {}
  ): Promise<void> {
    const { threshold = 0.1, rootMargin = '50px', retry = 3 } = options;

    return new Promise((resolve, reject) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              observer.disconnect();
              this.loadImageWithRetry(img, src, retry)
                .then(resolve)
                .catch(reject);
            }
          });
        },
        { threshold, rootMargin }
      );

      observer.observe(img);
    });
  }

  /**
   * Load image with retry logic
   */
  private loadImageWithRetry(
    img: HTMLImageElement, 
    src: string, 
    maxRetries: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const attemptLoad = (attempt: number) => {
        img.onload = () => {
          this.retryCount.delete(src);
          resolve();
        };

        img.onerror = () => {
          if (attempt < maxRetries) {
            console.warn(`Failed to load ${src}, retrying... (${attempt}/${maxRetries})`);
            setTimeout(() => attemptLoad(attempt + 1), 1000 * attempt);
          } else {
            this.retryCount.delete(src);
            reject(new Error(`Failed to load ${src} after ${maxRetries} attempts`));
          }
        };

        img.src = src;
      };

      attemptLoad(1);
    });
  }

  /**
   * Preload critical fonts
   */
  preloadFonts(fonts: Array<{ href: string; type?: string }>): Promise<void[]> {
    return Promise.all(
      fonts.map(({ href, type = 'font/woff2' }) =>
        this.preload(href, {
          as: 'font',
          type,
          crossorigin: 'anonymous',
        }).catch(error => {
          console.warn(`Failed to preload font ${href}:`, error);
        })
      )
    );
  }

  /**
   * Preload critical CSS
   */
  preloadCSS(href: string): Promise<void> {
    return this.preload(href, { as: 'style' });
  }

  /**
   * Preload critical JavaScript
   */
  preloadJS(href: string, priority: 'high' | 'low' = 'high'): Promise<void> {
    return this.preload(href, { as: 'script', priority });
  }

  /**
   * Prefetch resources for future navigation
   */
  prefetch(href: string): void {
    if (this.preloadedAssets.has(href)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    
    link.onload = () => {
      this.preloadedAssets.add(href);
    };

    document.head.appendChild(link);
  }

  /**
   * Preconnect to external domains
   */
  preconnect(href: string, crossorigin = false): void {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    
    if (crossorigin) {
      link.crossOrigin = 'anonymous';
    }

    document.head.appendChild(link);
  }

  /**
   * Get loading statistics
   */
  getStats() {
    return {
      preloadedCount: this.preloadedAssets.size,
      loadingCount: this.loadingPromises.size,
      retryingCount: this.retryCount.size,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.preloadedAssets.clear();
    this.loadingPromises.clear();
    this.retryCount.clear();
  }
}

// Create singleton instance
export const assetLoader = new AssetLoader();

/**
 * Hook for preloading critical assets on app initialization
 */
export const useAssetPreloader = () => {
  useEffect(() => {
    // Preconnect to external services
    assetLoader.preconnect('https://fonts.googleapis.com');
    assetLoader.preconnect('https://fonts.gstatic.com', true);
    assetLoader.preconnect('https://ai-workout-backend-2024.web.app');

    // Preload critical fonts
    assetLoader.preloadFonts([
      { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' }
    ]);

    // Prefetch likely next pages
    assetLoader.prefetch('/dashboard');
    assetLoader.prefetch('/generate');
    assetLoader.prefetch('/profile');

  }, []);
};

export default assetLoader;
