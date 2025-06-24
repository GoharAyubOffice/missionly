module.exports = {
  ci: {
    collect: {
      url: [
        'https://bounty-platform.vercel.app/',
        'https://bounty-platform.vercel.app/login',
        'https://bounty-platform.vercel.app/register',
        'https://bounty-platform.vercel.app/bounties',
      ],
      settings: {
        chromeFlags: '--no-sandbox --disable-setuid-sandbox',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': ['warn', { minScore: 0.6 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};