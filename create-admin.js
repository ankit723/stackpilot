import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qgcvlvzebzyhehuaiiru.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnY3ZsdnplYnp5aGVodWFpaXJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDAwOTIwNywiZXhwIjoyMDU5NTg1MjA3fQ.NzjY-csYSSuXdx5GJVxJuCpeJzMFzl6uR7ratnOyNvI";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createUserWithSubscription(email, password, isSubscription) {
  const { data, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (userError) {
    console.error("Error creating user:", userError);
    return;
  }

  const authUser = data.user;
  console.log("User created:", authUser);

  // Insert profile info
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .insert({
      id: authUser.id,
      isSubscription: isSubscription,
      email: authUser.email,
      created_at: new Date().toISOString(),
    });

  if (profileError) {
    console.error("Error creating profile:", profileError);
  }

  console.log("Profile created:", profile);
}

// Usage
createUserWithSubscription("admin@stackpilot.com", "00000000", true);
