const hasJsxRuntime = (() => {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
    return false;
  }

  try {
    require.resolve('react/jsx-runtime');
    return true;
  } catch (e) {
    return false;
  }
})();

module.exports = (api) => {
  api.cache.using(() => process.env.NODE_ENV);

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['last 2 versions', 'not dead'],
          },
        },
      ],
      ['@babel/preset-react', { runtime: hasJsxRuntime ? 'automatic' : 'classic' }],
    ],
    plugins: ['@babel/plugin-transform-runtime'],
  };
};
