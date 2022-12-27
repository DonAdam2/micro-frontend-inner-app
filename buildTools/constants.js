const protocol = process.env.HTTPS?.trim() === 'true' ? 'https' : 'http';

module.exports = {
  port: 3001,
  protocol,
  devServer: `${protocol}://localhost`,
  rootDirectory: 'src',
  publicDirectory: 'public',
  outputDirectory: 'dist',
  environmentsDirectory: 'environments',
  jsSubDirectory: 'js/',
  cssSubDirectory: 'css/',
  isCssModules: false,
  remoteDevUrl: 'http://localhost:3002',
  remoteProdUrl: 'http://localhost:8082',
  metaInfo: {
    //max 60 (recommended)
    title: 'Inner app',
    //max 150 (recommended)
    description: 'description',
    url: 'https://example.com',
    keywords: 'add you keywords',
  },
};
