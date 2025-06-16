const fs = require("fs-extra");
const path = require("path");
const { mergePrismaSchema } = require("./merge-prisma");

const copyBaseTemplate = async (source, destination) => {
  await fs.copy(source, destination);
};

const copyFeatureFiles = async (featurePath, targetPath) => {
  // Copy all contents of the feature directory
  if (fs.existsSync(featurePath)) {
    const items = await fs.readdir(featurePath);
    
    for (const item of items) {
      const src = path.join(featurePath, item);
      const dest = path.join(targetPath, item);
      
      // Special handling for prisma directory
      if (item === "prisma") {
        // Always use merge for prisma to avoid duplication
        // First ensure target prisma directory exists
        await fs.ensureDir(dest);
        
        // Copy non-schema files normally (migrations, etc.)
        const prismaFiles = await fs.readdir(src);
        for (const file of prismaFiles) {
          const fileSrc = path.join(src, file);
          const fileDest = path.join(dest, file);
          
          if (file !== "schema.prisma") {
            await fs.copy(fileSrc, fileDest, { overwrite: true });
          }
        }
        
        // Use merge function for schema content
        await mergePrismaSchema(featurePath, targetPath);
      } else {
        // Copy other items (files or directories) normally with overwrite option
        await fs.copy(src, dest, { overwrite: true });
      }
    }
  }
};

module.exports = { copyBaseTemplate, copyFeatureFiles };
