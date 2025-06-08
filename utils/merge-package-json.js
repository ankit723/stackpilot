const fs = require("fs-extra");
const path = require("path");

// Simple deep merge for dependencies and devDependencies
function mergeDeps(baseDeps = {}, newDeps = {}) {
  const merged = { ...baseDeps };
  for (const [pkg, version] of Object.entries(newDeps)) {
    // If package exists with different version, override (or handle smarter)
    merged[pkg] = version;
  }
  return merged;
}

/**
 * Merge base template package.json and features' package.json snippets
 * @param {string} baseTemplatePath - Path to base template folder
 * @param {string[]} mandatoryFeatures - Array of mandatory feature names
 * @param {string[]} selectedFeatures - Array of selected optional feature names
 * @param {string} targetPath - Path to generated project folder
 */
async function mergePackageJsonFiles(baseTemplatePath, mandatoryFeatures, selectedFeatures, targetPath) {
  const basePackageJsonPath = path.join(baseTemplatePath, "package.json");
  const basePackageJson = await fs.readJson(basePackageJsonPath);

  // Collect package.json snippets from features (both mandatory + selected)
  const allFeatures = [...new Set([...mandatoryFeatures, ...selectedFeatures])];

  let finalPackageJson = { ...basePackageJson };

  for (const feature of allFeatures) {
    const featurePackageJsonPath = path.join(__dirname, "..", "features", feature, "package.json");
    if (await fs.pathExists(featurePackageJsonPath)) {
      const featurePackageJson = await fs.readJson(featurePackageJsonPath);

      // Merge dependencies
      finalPackageJson.dependencies = mergeDeps(finalPackageJson.dependencies, featurePackageJson.dependencies);

      // Merge devDependencies
      finalPackageJson.devDependencies = mergeDeps(finalPackageJson.devDependencies, featurePackageJson.devDependencies);
    }
  }

  // Write merged package.json to target path
  await fs.writeJson(path.join(targetPath, "package.json"), finalPackageJson, { spaces: 2 });
}

module.exports = {
  mergePackageJsonFiles,
};
