export default {
  compiler: {
    styledComponents: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    // Disable NextJS normal WASM loading pipeline so onigasm can load properly
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
      generator: {
        filename: "static/wasm/[name].wasm",
      },
    })
    return config
  },
}
