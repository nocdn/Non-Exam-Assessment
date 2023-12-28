const signupOrLoginScreen = document.querySelector(".signup-or-login");
const chooseLoginButton = document.querySelector(".choose-login");
const chooseSignupButton = document.querySelector(".choose-signup");

const loginScreen = document.querySelector(".login-screen");
const signupScreen = document.querySelector(".signup-screen");

chooseLoginButton.addEventListener("click", () => {
  signupOrLoginScreen.style.display = "none";
  loginScreen.style.display = "flex";
});

chooseSignupButton.addEventListener("click", () => {
  signupOrLoginScreen.style.display = "none";
  signupScreen.style.display = "flex";
});

const loginButton = document.querySelector(".login-btn");
const signupButton = document.querySelector(".signup-btn");

loginButton.addEventListener("click", () => {
  const username = document.querySelector(".input-username").value;
  const password = document.querySelector(".input-password").value;
  console.log(`Logged in with username: ${username} and password: ${password}`);
});

signupButton.addEventListener("click", () => {
  const username = document.querySelector(".signup-input-username").value;
  const password = document.querySelector(".signup-input-password").value;
  console.log(`Signed up with username: ${username} and password: ${password}`);
});
