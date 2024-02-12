const supabaseUrl = "https://zbudweocjxngitnjautt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidWR3ZW9janhuZ2l0bmphdXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc1ODQxNjUsImV4cCI6MjAyMzE2MDE2NX0.1Wp-nSLyZQ_cXLPJC0uWa4sQpPvxWlTvQNNRMXYacP4";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
async function signUp() {
  let emailInput = document.getElementById("emailSignUp").value;
  let passwordInput = document.getElementById("passwordSignUp").value;

  // Attempt to sign up the user
  let { error } = await supabaseClient.auth.signUp({
    email: emailInput,
    password: passwordInput,
  });

  if (error) {
    console.log(error);
    return; // Stop execution if there's an error
  } else {
    // Assuming signup was successful, now attempt to insert the user into the "groups" table
    // First, safely attempt to extract the user ID from localStorage
    const authData = JSON.parse(
      localStorage.getItem("sb-zbudweocjxngitnjautt-auth-token")
    );
    if (authData && authData.user && authData.user.id) {
      const userId = authData.user.id;
      let groupIdInput = document.getElementById("group_id").value;

      let { error: addingUserError } = await supabaseClient
        .from("groups")
        .insert({
          user_id: userId,
          group_id: [groupIdInput],
        });

      if (addingUserError) {
        console.log(addingUserError);
      } else {
        location.href = "./index.html";
      }
    } else {
      console.log("User ID not found in localStorage.");
    }
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

/// background animation

const blob = document.getElementById("blob");

document.body.onmousemove = (event) => {
  const { clientX, clientY } = event;

  // follow mouse instantly
  // blob.style.left = `${clientX}px`
  // blob.style.top = `${clientY}px`

  // follow mouse with delay
  blob.animate(
    {
      left: `${clientX}px`,
      top: `${clientY}px`,
    },
    { duration: 15000, fill: "forwards" }
  );
};

// add scaling animation

document.querySelectorAll(".input").forEach(function (element) {
  // Function to add and remove 'animate' class
  function triggerAnimation() {
    element.classList.add("animate");

    // Remove the class after the animation completes to reset the animation
    setTimeout(() => {
      element.classList.remove("animate");
    }, 1000); // Match the animation duration
  }

  // Activate animation on click
  element.addEventListener("click", triggerAnimation);

  // Activate animation on focus (e.g., when selected with Tab key)
  element.addEventListener("focus", triggerAnimation);
});

function updatePasswordProgress() {
  const passwordInput = document.getElementById("passwordSignUp");
  const password = passwordInput.value;
  const passwordLength = password.length;
  const passwordFillBar = document.querySelector(".passwordFillBar");
  passwordFillBar.style.transition = "opacity 0.25s, width 0.25s";
  console.log(passwordLength);
  if (passwordLength < 6) {
    passwordFillBar.style.opacity = "0.6";

    let percentage = Math.min((passwordLength / 6) * 100, 100);

    passwordFillBar.style.width = `${percentage}%`;
  } else if (passwordLength === 6) {
    passwordFillBar.style.width = `100%`;
    setTimeout(function () {
      passwordFillBar.style.opacity = "0";
    }, 200);
  } else {
    passwordFillBar.style.opacity = "0";
  }
}
