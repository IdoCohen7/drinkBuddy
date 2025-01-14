document.addEventListener("DOMContentLoaded", () => {
  const registerSection = document.getElementById("register-section");
  const loginSection = document.getElementById("login-section");
  const toLoginLink = document.getElementById("to-login");
  const toRegisterLink = document.getElementById("to-register");
  const createAccountBtn = document.getElementById("create-account-btn");

  toLoginLink.addEventListener("click", (event) => {
    event.preventDefault();
    registerSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
  });

  toRegisterLink.addEventListener("click", (event) => {
    event.preventDefault();
    loginSection.classList.add("hidden");
    registerSection.classList.remove("hidden");
  });

  createAccountBtn.addEventListener("click", (event) => {
    event.preventDefault();

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const phone = document.getElementById("register-phone").value.trim();
    const password = document.getElementById("register-password").value.trim();

    if (!name || !email || !phone || !password) {
      alert("Please fill in all fields before creating an account.");
      return;
    }

    alert("Account created successfully!");
    registerSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
  });

  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (email && password) {
      window.location.href = "home.html";
    } else {
      alert("Please enter your email and password.");
    }
  });
});
