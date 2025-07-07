/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow worker files to be processed correctly
  webpack: (config, { isServer, dev }) => {
    // Handle WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Handle worker files
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      worker_threads: false,
    };

    // Add rule for worker files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    if (!isServer) {
      config.module.rules.push({
        test: /worker\.(min\.)?js$/,
        type: 'asset/resource',
      });
    }

    return config;
  },
  // Allow loading of wasm files
  output: 'standalone',
};

export default nextConfig;
