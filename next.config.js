/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  // Ensure pages with Supabase are not statically generated
  experimental: {
    // This helps with dynamic route handling
  },
}

module.exports = nextConfig
