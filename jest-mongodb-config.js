module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      version: '6.0.4', // Use a smaller, faster version
      skipMD5: true,
    },
    instance: {
      dbName: 'jest',
    },
    autoStart: false,
  },
}