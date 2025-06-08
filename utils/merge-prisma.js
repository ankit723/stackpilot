const fs = require("fs");
const path = require("path");

const mergePrismaSchema = async (featurePath, targetPath) => {
  const prismaModelPath = path.join(featurePath, "prisma");
  const schemaPath = path.join(targetPath, "prisma", "schema.prisma");

  if (!fs.existsSync(prismaModelPath)) return;

  const files = fs.readdirSync(prismaModelPath).filter(f => f !== "schema.prisma");

  for (const file of files) {
    const content = fs.readFileSync(path.join(prismaModelPath, file), "utf8");
    fs.appendFileSync(schemaPath, `\n\n// From ${file}\n${content}`);
  }
};

module.exports = { mergePrismaSchema };
