document.addEventListener("DOMContentLoaded", () => {
  setupGreetingCard();
  setupCarousel();
  animateProgressCircle(75);
  loadDynamicReminders();
  addHoverEffectToStats();
  setupWaterButton();
});

function setupGreetingCard() {
  const greetingEl = document.getElementById("greeting");
  const userDetailsEl = document.getElementById("user-details");
  const currentTimeEl = document.getElementById("current-time");
  const waterStatsEl = document.getElementById("water-stats");

  const userName = "Danny"; // Example: Replace with actual login data
  
  function updateGreeting() {
    const now = new Date();
    const hours = now.getHours();
    let greeting = "Hello";

    if (hours < 12) {
      greeting = "Good Morning";
    } else if (hours < 18) {
      greeting = "Good Afternoon";
    } else {
      greeting = "Good Evening";
    }

    greetingEl.textContent = `${greeting}, ${userName}!`;
    currentTimeEl.textContent = ` ${now.toLocaleTimeString()}`;
  }

  updateGreeting();

  // Update greeting and time every minute
  setInterval(updateGreeting, 60000);
}

// Setup the carousel for auto-slide
function setupCarousel() {
  const carouselSlide = document.querySelector(".carousel-slide");
  const items = document.querySelectorAll(".carousel-item");
  let currentIndex = 0;

  if (!carouselSlide || items.length === 0) return;

  function updateCarousel() {
    carouselSlide.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  // Auto-slide every 3 seconds
  setInterval(() => {
    currentIndex = (currentIndex + 1) % items.length;
    updateCarousel();
  }, 3000);
}

// Animate the progress circle to the given percentage
function animateProgressCircle(percent) {
  const progressCircle = document.querySelector(".progress-circle span");
  if (!progressCircle) return;

  let currentPercent = 0;

  const interval = setInterval(() => {
    currentPercent++;
    progressCircle.textContent = `${currentPercent}%`;
    if (currentPercent >= percent) {
      clearInterval(interval);
    }
  }, 20);
}

// Dynamically load reminders into the reminders list
function loadDynamicReminders() {
  const reminders = [
    { time: "10:30 AM", action: "Drink a glass of water" },
    { time: "12:00 PM", action: "Drink a small bottle" },
    { time: "02:00 PM", action: "Drink two glasses of water" },
  ];

  const remindersList = document.getElementById("reminders-list");
  if (!remindersList) return;

  reminders.forEach((reminder) => {
    const li = document.createElement("li");
    li.textContent = `${reminder.time} - ${reminder.action}`;
    remindersList.appendChild(li);
  });
}

// Add hover effect for stats section
function addHoverEffectToStats() {
  const statsSection = document.querySelector(".stats-section");
  if (!statsSection) return;

  statsSection.addEventListener("mouseenter", () => {
    statsSection.style.backgroundColor = "#e0f7fa";
    statsSection.style.transition = "background-color 0.3s ease";
  });

  statsSection.addEventListener("mouseleave", () => {
    statsSection.style.backgroundColor = "#ffffff";
  });
}

// Setup functionality for the Add Water button
function setupWaterButton() {
  const addWaterBtn = document.querySelector(".add-water-btn");
  const progressText = document.getElementById("progress-text");
  let currentLiters = 0;

  if (!addWaterBtn || !progressText) return;

  addWaterBtn.addEventListener("click", () => {
    const liters = parseFloat(prompt("How many liters did you drink?"));
    if (!isNaN(liters) && liters > 0) {
      currentLiters = Math.min(currentLiters + liters, 2);
      const progressPercent = (currentLiters / 2) * 100;
      animateProgressCircle(progressPercent);
      progressText.textContent = `You drank ${currentLiters.toFixed(1)} liters out of 2 liters`;
    } else {
      alert("Please enter a valid amount.");
    }
  });
}
