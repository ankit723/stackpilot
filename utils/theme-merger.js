const fs = require("fs");
const path = require("path");

const mergeGlobalsCSS = async (targetPath, themeName) => {
  const globalsPath = path.join(targetPath, "app", "globals.css");
  const themePath = path.join(__dirname, "..", "features", "theming", themeName, "globals.css");

  const baseCSS = fs.readFileSync(globalsPath, "utf8");
  const themeCSS = fs.readFileSync(themePath, "utf8");

  const merged = `${baseCSS}\n\n/* --- THEME COLORS --- */\n${themeCSS}`;
  fs.writeFileSync(globalsPath, merged, "utf8");
};

module.exports = { mergeGlobalsCSS };