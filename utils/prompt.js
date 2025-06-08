const prompts = require("prompts");
const { themeChoices } = require("./theme-choices");

const askQuestions = async () => {
  const response = await prompts([
    {
      type: "text",
      name: "projectName",
      message: "Project name:",
      initial: "my-next-app"
    },
    {
      type: "multiselect",
      name: "features",
      message: "Select optional features to include:",
      choices: [
        { title: "Authentication (NextAuth)", value: "auth" },
        { title: "Stripe Payments", value: "stripe" },
        { title: "Razorpay Payments", value: "razorpay" },
        { title: "CI/CD (GitHub Actions)", value: "ci-cd" },
        { title: "Storybook", value: "storybook" },
        { title: "Code Quality (ESLint + Prettier)", value: "linting" },
      ],
      hint: "- Space to select. Enter to submit"
    },
    {
      type: "select",
      name: "theme",
      message: "Choose Theme",
      choices: themeChoices
    },
    {
      type: "confirm",
      name: "seo",
      message: "Setup SEO?",
      initial: true
    }
  ]);

  // Middleware and shadcn are mandatory, add them automatically
  const mandatoryFeatures = ["middleware", "shadcn"];

  // Merge selected + mandatory features uniquely
  response.features = Array.from(new Set([...(response.features || []), ...mandatoryFeatures]));

  return response;
};

module.exports = { askQuestions };
