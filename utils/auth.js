const inquirer = require("inquirer");
const { createClient } = require("@supabase/supabase-js");
const chalk = require("chalk");

const SUPABASE_URL = "https://bslwgxmivwokvlfadqcw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzbHdneG1pdndva3ZsZmFkcWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NDYyNjgsImV4cCI6MjA2NDQyMjI2OH0.Co-FjNFn1Gh6RvU_M043xOAwp94dpdID6i5Gf15-KHg";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginUser = async () => {
  const { email, password } = await inquirer.prompt([
    {
      type: "input",
      name: "email",
      message: "📧 Enter your email:",
    },
    {
      type: "password",
      name: "password",
      message: "🔒 Enter your password:",
      mask: "*",
    },
  ]);

  // Step 1: Sign in with Supabase
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error(chalk.red("❌ Login failed:"), authError.message);
    process.exit(1);
  }

  const userId = authData.user.id;

  console.log(userId);

  // Step 2: Fetch user subscription status from DB
  const { data: userDetails, error: userError } = await supabase
  .from("users")
  .select("*")
  .eq("id", userId)
  .single();

  if (userError) {
    console.error(chalk.red("❌ Failed to fetch user details:"), userError.message);
    process.exit(1);
  }

  console.log(userDetails);

  if (!userDetails.isSubscription) {
    console.log(
      chalk.yellow(
        "⚠️ Your account does not have an active subscription.\nPlease subscribe to unlock StackPilot project generator."
      )
    );
    process.exit(1);
  }

  console.log(chalk.green(`✅ Login successful! Welcome ${userDetails.email}`));

  return {
    email: userDetails.email,
    isSubscription: userDetails.isSubscription,
    token: authData.session.access_token,
  };
};

module.exports = { loginUser };
