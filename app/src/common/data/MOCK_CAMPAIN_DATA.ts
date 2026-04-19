import type { Campaign } from '../types/campaign'

export const MOCK_CAMPAINS: Campaign[] = [
  // Paid Search
  { rowId: 1, campaign: 'Google Brand Search', channel: 'Paid Search', budget: 8500, impressions: 142000, clicks: 8520, conversions: 680, revenue: 28900 },
  { rowId: 2, campaign: 'Google Non-Brand Search', channel: 'Paid Search', budget: 12000, impressions: 380000, clicks: 9120, conversions: 420, revenue: 18600 },
  { rowId: 3, campaign: 'Bing Ads', channel: 'Paid Search', budget: 3200, impressions: 95000, clicks: 2850, conversions: 142, revenue: 7100 },
  // Paid Social
  { rowId: 4, campaign: 'Facebook Awareness', channel: 'Paid Social', budget: 6200, impressions: 280000, clicks: 5720, conversions: 145, revenue: 7800 },
  { rowId: 5, campaign: 'Instagram Retargeting', channel: 'Paid Social', budget: 4800, impressions: 185000, clicks: 6840, conversions: 312, revenue: 14200 },
  { rowId: 6, campaign: 'LinkedIn B2B', channel: 'Paid Social', budget: 9500, impressions: 95000, clicks: 2850, conversions: 98, revenue: 22400 },
  { rowId: 7, campaign: 'TikTok Awareness', channel: 'Paid Social', budget: 3800, impressions: 320000, clicks: 14800, conversions: 152, revenue: 5320 },
  // Email
  { rowId: 8, campaign: 'Newsletter Campaign', channel: 'Email', budget: 1200, impressions: 68000, clicks: 8160, conversions: 408, revenue: 12800 },
  { rowId: 9, campaign: 'Win-Back Email', channel: 'Email', budget: 800, impressions: 24000, clicks: 3840, conversions: 192, revenue: 9600 },
  // Display
  { rowId: 10, campaign: 'Programmatic Display', channel: 'Display', budget: 5500, impressions: 480000, clicks: 4800, conversions: 96, revenue: 4800 },
  { rowId: 11, campaign: 'Retargeting Display', channel: 'Retargeting', budget: 3200, impressions: 180000, clicks: 5400, conversions: 216, revenue: 10800 },
  // Video
  { rowId: 12, campaign: 'YouTube Pre-Roll', channel: 'Video', budget: 7800, impressions: 310000, clicks: 12400, conversions: 186, revenue: 11200 },
  { rowId: 13, campaign: 'CTV Campaign', channel: 'CTV / OTT', budget: 11000, impressions: 180000, clicks: 6400, conversions: 128, revenue: 9600 },
  // Organic
  { rowId: 14, campaign: 'SEO Content Hub', channel: 'Organic Search', budget: 3500, impressions: 285000, clicks: 14250, conversions: 570, revenue: 24600 },
  { rowId: 15, campaign: 'Google My Business', channel: 'Organic Search', budget: 500, impressions: 42000, clicks: 5040, conversions: 252, revenue: 8400 },
  // Affiliate & Influencer
  { rowId: 16, campaign: 'Partner Network', channel: 'Affiliate', budget: 4200, impressions: 156000, clicks: 7800, conversions: 390, revenue: 19500 },
  { rowId: 17, campaign: 'Micro-Influencer Push', channel: 'Influencer', budget: 6800, impressions: 410000, clicks: 12300, conversions: 246, revenue: 15400 },
  // Push & Native
  { rowId: 18, campaign: 'Web Push Re-engagement', channel: 'Push Notifications', budget: 600, impressions: 38000, clicks: 7600, conversions: 380, revenue: 11400 },
  { rowId: 19, campaign: 'Native Content Ads', channel: 'Native Ads', budget: 4100, impressions: 290000, clicks: 8700, conversions: 174, revenue: 8700 },
  // Podcast & Audio
  { rowId: 20, campaign: 'Podcast Mid-Roll', channel: 'Podcast', budget: 5200, impressions: 95000, clicks: 2850, conversions: 104, revenue: 7020 },
  // Referral
  { rowId: 21, campaign: 'Referral Program', channel: 'Referral', budget: 2000, impressions: 48000, clicks: 9600, conversions: 480, revenue: 21600 },
]
