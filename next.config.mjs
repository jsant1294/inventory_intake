
import createBundleAnalyzer from '@next/bundle-analyzer';
const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "jrtoolsusa.com" }
    ]
  }
};

export default withBundleAnalyzer(nextConfig);
