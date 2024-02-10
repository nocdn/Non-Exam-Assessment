const supabaseUrl = "https://zbudweocjxngitnjautt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidWR3ZW9janhuZ2l0bmphdXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc1ODQxNjUsImV4cCI6MjAyMzE2MDE2NX0.1Wp-nSLyZQ_cXLPJC0uWa4sQpPvxWlTvQNNRMXYacP4";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
async function signUp() {
  let emailInput = document.getElementById("emailSignUp").value;
  let passwordInput = document.getElementById("passwordSignUp").value;
  let { data, error } = await supabaseClient.auth.signUp({
    email: emailInput,
    password: passwordInput,
  });

  if (error) {
    console.log(error);
  } else {
    location.href = "./index.html";
  }
}

async function login() {
  let emailInput = document.getElementById("emailSignIn").value;
  let passwordInput = document.getElementById("passwordSignIn").value;
  let { data, error } = await supabaseClient.auth.signInWithPassword({
    email: emailInput,
    password: passwordInput,
  });

  if (error) {
    console.log(error);
  } else {
    location.href = "./index.html";
  }
}
