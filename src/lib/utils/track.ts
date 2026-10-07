 
// Analytics stub for MVP - no vendor implementation
// Replace with actual analytics provider when ready

export function track(eventName: string, properties?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', eventName, properties);
  }
  
  // TODO: Implement analytics provider
  // Example events:
  // - project_detail_open
  // - demo_click
  // - repository_click
  // - drive_click
  // - cv_click
  // - contact_click
}
