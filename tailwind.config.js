module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  purge: ['./src/**/*.html', './src/**/*.jsx', './src/**/*.js'],
  theme: {
    extend: {}
  },
  variants: {},
  corePlugins: { preflight: true },
  plugins: []
}
