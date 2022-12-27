const path = require('path'),
  // __dirname is the absolute path to the root directory of our app
  projectPath = `${path.join(__dirname)}/../`,
  {
    outputDirectory,
    rootDirectory,
    publicDirectory,
    environmentsDirectory,
  } = require('./constants');

module.exports = {
  src: path.join(projectPath, rootDirectory),
  public: path.join(projectPath, publicDirectory),
  outputSrc: path.resolve(projectPath, outputDirectory),
  environments: path.resolve(projectPath, environmentsDirectory),
  packageJson: path.resolve(projectPath, 'package.json'),
};
