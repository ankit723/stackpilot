const inquirer = require("inquirer");
const { createClient } = require("@supabase/supabase-js");
const chalk = require("chalk");


const NEXT_PUBLIC_SUPABASE_URL = "https://qgcvlvzebzyhehuaiiru.supabase.co";
const NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnY3ZsdnplYnp5aGVodWFpaXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMDkyMDcsImV4cCI6MjA1OTU4NTIwN30.Bp0kzwdMDRUu5GjP8xol6qF7_wAA85kE8WYyuTfwbBQ";


const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);

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

  console.log(authData.user);

  // Step 2: Fetch user subscription status from DB
  const { data: userDetails, error: userError } = await supabase
  .from("users")
  .select("*")
  .eq("id", userId)
  .single();

  if (userError) {
    console.error(chalk.red("❌ Failed to fetch user details:"), userError.message);
    console.log(userDetails)
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
