const fs = require("fs");
const path = require("path");

const mergeEnv = async (featurePath, targetPath) => {
  const envPath = path.join(featurePath, "env.example");
  const destEnv = path.join(targetPath, ".env");

  if (!fs.existsSync(envPath)) return;

  const envContent = fs.readFileSync(envPath, "utf8");
  fs.appendFileSync(destEnv, `\n# From ${path.basename(featurePath)}\n${envContent}`);
};

module.exports = { mergeEnv };
