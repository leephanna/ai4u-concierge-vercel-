/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/footer.js', destination: '/api/footer' }
    ];
  },
};
module.exports = nextConfig;
