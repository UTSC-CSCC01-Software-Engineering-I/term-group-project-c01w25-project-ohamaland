const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb" // or higher
    }
  }
};

module.exports = {
  images: {
    domains: ['upload.wikimedia.org'],
  },
};

export default nextConfig;
