const { exec } = require("child_process");

const installDependencies = (targetPath) => {
  return new Promise((resolve, reject) => {
    exec("npm install", { cwd: targetPath }, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

module.exports = { installDependencies };
