let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    '@mongodb-js/zstd',
    '@napi-rs/snappy-win32-x64-msvc',
    'kerberos',
    'mongodb-client-encryption'
  ],
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    serverComponentsExternalPackages: ['mongodb', 'bcrypt']
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.html$/,
      loader: 'raw-loader'
    });

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "mongodb-client-encryption": false,
        "aws4": false,
        "kerberos": false,
        "supports-color": false,
        "@mongodb-js/zstd": false,
        "@napi-rs/snappy-win32-x64-msvc": false,
        "mongocrypt": false,
        "fs": false,
        "path": false,
        "os": false,
        "crypto": false,
        "stream": false,
        "buffer": false,
        "events": false,
        "assert": false,
        "util": false,
        "net": false,
        "tls": false,
        "child_process": false,
        "bcrypt": false,
        "dns": false,
        "mongodb": false
      };
    }

    // Explicitly mark problematic modules as external
    config.externals = [
      ...(config.externals || []),
      { "@mongodb-js/zstd": "commonjs @mongodb-js/zstd" },
      { "@napi-rs/snappy-win32-x64-msvc": "commonjs @napi-rs/snappy-win32-x64-msvc" },
      { "kerberos": "commonjs kerberos" },
      { "mongodb-client-encryption": "commonjs mongodb-client-encryption" },
      { "mongocrypt": "commonjs mongocrypt" },
      { "bcrypt": "commonjs bcrypt" },
      { "mongodb": "commonjs mongodb" }
    ];

    return config;
  }
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
