/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configure image domains for external services
  images: {
    domains: [
      'img.clerk.com',           // Clerk authentication user images
      'images.clerk.dev',        // Clerk development images
      'images.clerk.accounts.dev', // Clerk accounts images
      'lh3.googleusercontent.com', // Google OAuth profile images
      'platform-lookaside.fbsbx.com', // Facebook OAuth profile images
      'graph.facebook.com',      // Facebook Graph API images
      'pbs.twimg.com',           // Twitter profile images
      'abs.twimg.com',           // Twitter additional images
      'avatars.githubusercontent.com', // GitHub profile images
      'secure.gravatar.com',     // Gravatar profile images
      'ui-avatars.com',          // UI Avatars service
      'api.dicebear.com',        // DiceBear avatar service
      'robohash.org',            // RoboHash avatar service
      'placehold.co',            // Placeholder images
      'via.placeholder.com',     // Placeholder images
      'picsum.photos',           // Lorem Picsum placeholder images
    ],
    
    // Allow remote patterns for more flexible image sources
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.accounts.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'abs.twimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'robohash.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  },
  
  // Configure webpack if needed
  webpack: (config, { isServer }) => {
    // Add any webpack configurations here
    return config
  },
}

module.exports = nextConfig 