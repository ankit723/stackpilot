#!/usr/bin/env node

const path = require("path");
const fs = require("fs-extra");
const prompts = require("prompts");
const chalk = require("chalk");
const ora = require("ora").default;

const { askQuestions } = require("./utils/prompt");
const { copyBaseTemplate, copyFeatureFiles } = require("./utils/copy");
const { mergeEnv } = require("./utils/merge-env");
const { mergePrismaSchema } = require("./utils/merge-prisma");
const { installDependencies } = require("./utils/install");
const { mergePackageJsonFiles } = require("./utils/merge-package-json");
const { resolveFeatureDependencies } = require("./utils/resolve-dependencies");
const { mergeGlobalsCSS } = require("./utils/theme-merger");
const { setupSEO } = require("./utils/seo-setup");
const { loginUser } = require("./utils/auth");

(async () => {
  console.log(chalk.green.bold("\nCreate Next.js Template CLI\n"));

  const user = await loginUser();
  console.log(`🔧 Authenticated as ${user.email}\n`);


  // Step 1: Ask user prompts
  const answers = await askQuestions();
  let { projectName, features, theme, seo } = answers;
  features = resolveFeatureDependencies(features);

  const targetPath = path.join(process.cwd(), projectName);
  const baseTemplatePath = path.join(__dirname, "template");

  const spinner = ora();

  // Step 2: Copy base template
  spinner.start("Initializing base template...");
  try {
    await copyBaseTemplate(baseTemplatePath, targetPath);
    spinner.succeed("Base template initialized.");
  } catch (err) {
    spinner.fail("Failed to initialize base template.");
    console.error(err);
    process.exit(1);
  }

  // Step 3: Mandatory features
  const mandatoryFeatures = ["middleware", "shadcn"];
  for (const feature of mandatoryFeatures) {
    const featurePath = path.join(__dirname, "features", feature);
    spinner.start(`Adding mandatory feature: ${feature}`);
    try {
      await copyFeatureFiles(featurePath, targetPath);
      await mergeEnv(featurePath, targetPath);
      await mergePrismaSchema(featurePath, targetPath);
      spinner.succeed(`Added mandatory feature: ${feature}`);
    } catch (err) {
      spinner.fail(`Failed to add mandatory feature: ${feature}`);
      console.error(err);
      process.exit(1);
    }
  }

  // Step 4: Optional features selected by user
  for (const feature of features) {
    if (mandatoryFeatures.includes(feature)) continue;
    const featurePath = path.join(__dirname, "features", feature);
    spinner.start(`Adding feature: ${feature}`);
    try {
      await copyFeatureFiles(featurePath, targetPath);
      await mergeEnv(featurePath, targetPath);
      await mergePrismaSchema(featurePath, targetPath);
      spinner.succeed(`Added feature: ${feature}`);
    } catch (err) {
      spinner.fail(`Failed to add feature: ${feature}`);
      console.error(err);
      process.exit(1);
    }
  }

  // Step 5: Merge package.json files (base + all features)
  spinner.start("Gathering package library files...");
  try {
    await mergePackageJsonFiles(baseTemplatePath, mandatoryFeatures, features, targetPath);
    spinner.succeed("Package library files gathered successfully.");
  } catch (err) {
    spinner.fail("Failed to gather package library files.");
    console.error(err);
    process.exit(1);
  }

  // step 6: apply theme colors
  spinner.start("Applying theme colors...");
  try {
    await mergeGlobalsCSS(targetPath, theme);
    spinner.succeed("Theme applied.");
  } catch (err) {
    spinner.fail("Failed to apply theme.");
    console.error(err);
  }

  // step 7: setup seo
  if (seo) {
    spinner.start("Setting up SEO...");
    try {
      await setupSEO(targetPath);
      spinner.succeed("SEO setup complete.");
    } catch (err) {
      spinner.fail("Failed to setup SEO.");
      console.error(err);
    }
  }

  // Step 8: Install dependencies
  spinner.start("Installing dependencies...");
  try {
    await installDependencies(targetPath);
    spinner.succeed("Dependencies installed.");
  } catch (err) {
    spinner.fail("Dependency installation failed.");
    console.error(err);
    process.exit(1);
  }

  console.log(chalk.blue.bold("\n✅ Project setup complete!"));
  console.log(chalk.yellow(`\n➡ cd ${projectName}\n➡ npm run dev\n`));
})();
