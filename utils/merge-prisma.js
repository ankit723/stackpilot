const fs = require("fs");
const path = require("path");

const mergePrismaSchema = async (featurePath, targetPath) => {
  const featurePrismaPath = path.join(featurePath, "prisma");
  const targetSchemaPath = path.join(targetPath, "prisma", "schema.prisma");
  const featureSchemaPath = path.join(featurePrismaPath, "schema.prisma");

  if (!fs.existsSync(featurePrismaPath)) return;

  // If feature has a schema.prisma file, merge its content
  if (fs.existsSync(featureSchemaPath)) {
    const featureContent = fs.readFileSync(featureSchemaPath, "utf8");
    
    // If target schema doesn't exist, create it with basic structure first
    if (!fs.existsSync(targetSchemaPath)) {
      const baseSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
`;
      fs.writeFileSync(targetSchemaPath, baseSchema);
    }
    
    // Extract only models, enums, and types (skip generator and datasource blocks)
    const modelsAndEnums = extractModelsAndEnums(featureContent);
    
    if (modelsAndEnums.trim()) {
      // Check if this content already exists to avoid duplicates
      const existingContent = fs.readFileSync(targetSchemaPath, "utf8");
      const featureName = path.basename(featurePath);
      
      if (!existingContent.includes(`// From ${featureName} feature`)) {
        fs.appendFileSync(targetSchemaPath, `\n\n// From ${featureName} feature\n${modelsAndEnums}`);
      }
    }
  }

  // Handle other prisma files (if any)
  const files = fs.readdirSync(featurePrismaPath).filter(f => f !== "schema.prisma");

  for (const file of files) {
    const content = fs.readFileSync(path.join(featurePrismaPath, file), "utf8");
    const existingContent = fs.existsSync(targetSchemaPath) ? fs.readFileSync(targetSchemaPath, "utf8") : "";
    
    if (!existingContent.includes(`// From ${file}`)) {
      fs.appendFileSync(targetSchemaPath, `\n\n// From ${file}\n${content}`);
    }
  }
};

const extractModelsAndEnums = (content) => {
  const lines = content.split('\n');
  const result = [];
  let inBlock = false;
  let blockType = '';
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and comments at the beginning
    if (!inBlock && (line === '' || line.startsWith('//'))) {
      continue;
    }
    
    // Check if line starts a model, enum, or type block
    if (!inBlock && (line.startsWith('model ') || line.startsWith('enum ') || line.startsWith('type '))) {
      inBlock = true;
      blockType = line.split(' ')[0];
      result.push(lines[i]);
      
      // Count opening braces
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
      
      continue;
    }
    
    // If we're in a block, add the line and track braces
    if (inBlock) {
      result.push(lines[i]);
      braceCount += (lines[i].match(/{/g) || []).length;
      braceCount -= (lines[i].match(/}/g) || []).length;
      
      // If brace count is 0, we've closed all blocks
      if (braceCount === 0) {
        inBlock = false;
        result.push(''); // Add empty line after block
      }
    }
  }
  
  return result.join('\n');
};

module.exports = { mergePrismaSchema };
