const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './tests/setup.js',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['routes/**/*.js', 'services/**/*.js', 'middleware/**/*.js', 'utils/**/*.js', 'validators/**/*.js'],
      exclude: ['node_modules/', 'tests/', 'config/'],
    },
  },
});
