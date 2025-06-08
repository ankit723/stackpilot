// utils/resolve-dependencies.js
const deps = require("./feature-deps");

function resolveFeatureDependencies(selected) {
  const all = new Set(selected);

  let added = true;
  while (added) {
    added = false;
    for (const feature of Array.from(all)) {
      const requires = deps[feature] || [];
      for (const req of requires) {
        if (!all.has(req)) {
          all.add(req);
          added = true;
          console.log(`⚠️  Adding required dependency "${req}" for "${feature}".`);
        }
      }
    }
  }

  return Array.from(all);
}

module.exports = { resolveFeatureDependencies };
