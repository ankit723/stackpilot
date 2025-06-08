const fs = require("fs");
const path = require("path");

const setupSEO = async (targetPath) => {
  try {
    const layoutPath = path.join(targetPath, "app", "layout.tsx");
    const layoutFileToCopy = path.resolve(__dirname, "..", "features", "seo", "layout.tsx");

    // Check if layout.tsx exists
    if (!fs.existsSync(layoutPath)) {
      console.error("Error: layout.tsx not found in target project.");
      return;
    }

    // Merge layout content
    const layoutContent = fs.readFileSync(layoutPath, "utf8");
    const layoutExtraContent = fs.readFileSync(layoutFileToCopy, "utf8");
    const mergedLayout = `${layoutContent}\n\n${layoutExtraContent}`;
    fs.writeFileSync(layoutPath, mergedLayout, "utf8");

    // Copy robots.ts and sitemap.ts into app directory
    const seoFiles = ["robots.ts", "sitemap.ts"];
    for (const file of seoFiles) {
      const src = path.resolve(__dirname, "..", "features", "seo", file);
      const dest = path.join(targetPath, "app", file);
      const content = fs.readFileSync(src, "utf8");
      fs.writeFileSync(dest, content, "utf8");
    }

    console.log("✅ SEO files and layout modifications applied successfully.");
  } catch (err) {
    console.error("❌ Error setting up SEO:", err);
  }
};

module.exports = { setupSEO };
