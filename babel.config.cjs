module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    // allow rolling up TypeScript source in packages that rely on Babel
    '@babel/preset-typescript',
  ],
};
