/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://bounty-platform.vercel.app',
  generateRobotsTxt: true,
  exclude: [
    '/dashboard/*',
    '/messages/*',
    '/settings/*',
    '/onboarding',
    '/api/*',
  ],
  robotsTxtOptions: {
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://bounty-platform.vercel.app'}/sitemap.xml`,
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/messages/',
          '/settings/',
          '/onboarding',
          '/api/',
          '/_next/',
          '/admin/',
        ],
      },
    ],
  },
  transform: async (config, path) => {
    // Custom priority based on path
    let priority = 0.7;
    let changefreq = 'weekly';

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.includes('/bounties')) {
      priority = 0.9;
      changefreq = 'daily';
    } else if (path.includes('/login') || path.includes('/register')) {
      priority = 0.8;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};