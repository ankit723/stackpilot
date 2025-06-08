const fs = require("fs-extra");
const path = require("path");

const copyBaseTemplate = async (source, destination) => {
  await fs.copy(source, destination);
};

const copyFeatureFiles = async (featurePath, targetPath) => {
  const filesToCopy = ["app", "lib", "hooks", "prisma", "middleware"];

  for (const folder of filesToCopy) {
    const src = path.join(featurePath, folder);
    if (fs.existsSync(src)) {
      await fs.copy(src, path.join(targetPath, folder), { overwrite: true });
    }
  }
};

module.exports = { copyBaseTemplate, copyFeatureFiles };
