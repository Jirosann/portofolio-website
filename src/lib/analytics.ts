/**
 * Analytics tracking stub
 * 
 * Provides a unified interface for event tracking. 
 * To be replaced with an actual analytics provider (e.g., Google Analytics, Vercel Analytics) in the future.
 */

export type EventName = 
  | 'project_detail_open'
  | 'demo_click'
  | 'repo_click'
  | 'cv_download'
  | 'contact_click';

export function track(eventName: EventName, properties?: Record<string, string | number | boolean>) {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[Analytics Stub] ${eventName}`, properties || '');
  }
  
  // Implementation for the analytics vendor will go here
}
