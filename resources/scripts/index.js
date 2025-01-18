const container = document.getElementById("container");

// Questions data
const steps = [
  { question: "What's your gender? 👫", options: ["Male 👨", "Female 👩", "Prefer not to say ❓"] },
  { question: "How tall are you? 📏", type: "scrollable", options: [...Array(201).keys()].map((i) => `${i} cm`) },
  { question: "How much do you weigh? ⚖️", type: "scrollable", options: [...Array(201).keys()].map((i) => `${i} kg`) },
  { question: "What's your age? 🎂", type: "scrollable", options: [...Array(100).keys()].map((i) => `${i + 1} years`) },
  { question: "What time do you usually wake up? ⏰", type: "scrollable", options: generateTimeOptions() },
  { question: "What time do you usually go to bed? 🌙", type: "scrollable", options: generateTimeOptions() },
  { question: "What's your activity level? 🏃", options: ["Sedentary 🛋️", "Light Activity 🚶", "Moderate Active 🏃‍♂️", "Very Active 🏋️‍♀️"] },
  { question: "What's the climate/weather like in your area?", options: ["Hot 🔥", "Temperate ⛅", "Cold ❄️"] },
];

let currentStep = 0;
let recommendedWaterIntake = 0;
let userDailyGoal = 0;
let userIntake = 0;
const notifications = [];
const answers = [];

// Generate time options for wake-up and bedtime
function generateTimeOptions() {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 15) {
      times.push(`${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`);
    }
  }
  return times;
}

// Render current step
function renderStep() {
  container.innerHTML = "";

  // Progress bar
  const progressBar = document.createElement("div");
  progressBar.classList.add("progress");
  progressBar.innerHTML = `<div class="progress-bar" style="width: ${(currentStep / steps.length) * 100}%"></div>`;
  container.appendChild(progressBar);

  // Question
  const question = document.createElement("div");
  question.classList.add("question");
  question.innerText = steps[currentStep].question;
  container.appendChild(question);

  // Options or Scrollable Wheel
  const optionsContainer = document.createElement("div");
  optionsContainer.classList.add("options");

  if (steps[currentStep].type === "scrollable") {
    const scrollableContainer = document.createElement("div");
    scrollableContainer.classList.add("scrollable-container");

    const scrollableList = document.createElement("ul");
    scrollableList.classList.add("scrollable");

    steps[currentStep].options.forEach((option) => {
      const li = document.createElement("li");
      li.innerText = option;
      li.onclick = () => {
        document.querySelectorAll(".scrollable li").forEach((el) => el.classList.remove("active"));
        li.classList.add("active");
        document.querySelector(".next-button").style.display = "inline-block";
      };
      scrollableList.appendChild(li);
    });

    scrollableContainer.appendChild(scrollableList);
    optionsContainer.appendChild(scrollableContainer);
  } else {
    steps[currentStep].options.forEach((option) => {
      const optionElement = document.createElement("div");
      optionElement.classList.add("option");
      optionElement.innerText = option;
      optionElement.onclick = () => {
        document.querySelectorAll(".option").forEach((el) => el.classList.remove("selected"));
        optionElement.classList.add("selected");
        document.querySelector(".next-button").style.display = "inline-block";
      };
      optionsContainer.appendChild(optionElement);
    });
  }

  container.appendChild(optionsContainer);

  // Next button
  const nextButton = document.createElement("button");
  nextButton.classList.add("next-button");
  nextButton.innerText = currentStep === steps.length - 1 ? "Finish ✅" : "Next➡️";
  nextButton.onclick = () => {
    const selectedOption = document.querySelector(".option.selected") || document.querySelector(".scrollable .active");
    if (selectedOption) {
      answers[currentStep] = selectedOption.innerText;
      if (currentStep < steps.length - 1) {
        currentStep++;
        renderStep();
      } else {
        showResults();
      }
    }
  };
  container.appendChild(nextButton);
}

// Calculate water intake
function calculateWaterIntake(answers) {
  let weight = parseInt(answers[2]); // משקל
  let activityLevel = answers[6]; // רמת פעילות
  let weather = answers[7]; // מזג אוויר

  // בסיס לצריכת מים (30 מ"ל לק"ג משקל)
  let waterIntake = weight * 30; // במיליליטרים

  // התאמות על סמך רמת פעילות
  switch (activityLevel) {
    case "Light Activity 🚶":
      waterIntake += 300;
      break;
    case "Moderate Active 🏃‍♂️":
      waterIntake += 500;
      break;
    case "Very Active 🏋️‍♀️":
      waterIntake += 800;
      break;
  }

  // התאמות על סמך מזג אוויר
  switch (weather) {
    case "Hot 🔥":
      waterIntake += 500;
      break;
    case "Temperate ⛅":
      waterIntake += 200;
      break;
    case "Cold ❄️":
      // אין שינוי במזג אוויר קר
      break;
  }

  // החזרת התוצאה בליטרים (מעגלים לשני מקומות אחרי הנקודה)
  return (waterIntake / 1000).toFixed(2);
}

// Show results
function showResults() {
  recommendedWaterIntake = calculateWaterIntake(answers);

  container.innerHTML = `
    <h1>Your Daily Water Intake</h1>
    <p>You should drink approximately <strong>${recommendedWaterIntake} liters</strong> of water per day.</p>
    <p>Set your personal daily water goal:</p>
    <div class="goal-input">
      <input type="number" id="dailyGoal" min="0" step="0.1" placeholder="Enter your goal in liters" />
      <button class="save-button" onclick="saveGoal()">Save Goal✔️</button>
    </div>
    <div id="goalMessage"></div>
    <div class="navigation-buttons">
      <button class="next-button" onclick="renderNotificationSettings()">Next➡️</button>
    </div>
  `;
}

// Save goal
function saveGoal() {
  const dailyGoalInput = document.getElementById("dailyGoal");
  const goalMessage = document.getElementById("goalMessage");

  if (dailyGoalInput.value) {
    userDailyGoal = parseFloat(dailyGoalInput.value).toFixed(1);
    goalMessage.innerHTML = `<p>Your daily water goal has been set to <strong>${userDailyGoal} liters 🚀</strong></p>`;
  } else {
    goalMessage.innerHTML = `<p style="color: red;">Please enter a valid daily water goal.</p>`;
  }
}

function renderNotificationSettings() {
  container.innerHTML = `
    <h1>Notification Settings</h1>
    <p>Set up your daily reminders to stay hydrated:</p>
    <div class="notification-input">
      <label for="reminderTime">Reminder Time:</label>
      <input type="time" id="reminderTime" required />
      <label for="reminderMessage">Reminder Message:</label>
      <input type="text" id="reminderMessage" placeholder="Enter your message" />
      <button class="save-button" onclick="saveNotification()">Add Notification🔔</button>
    </div>
    <div id="notificationMessage"></div>
    <ul id="notificationList" class="notification-list"></ul>
    <div class="navigation-buttons">
      <button class="next-button" onclick="renderHomeScreen()">Next➡️</button>
    </div>
  `;

  renderNotificationList();
}

function saveNotification() {
  const reminderTimeInput = document.getElementById("reminderTime");
  const reminderMessageInput = document.getElementById("reminderMessage");
  const notificationMessage = document.getElementById("notificationMessage");

  const time = reminderTimeInput.value;
  const message = reminderMessageInput.value;

  if (!time || !message) {
    notificationMessage.innerHTML = `<p style="color: red;">Please fill in both fields.</p>`;
    return;
  }

  notifications.push({ time, message });
  reminderTimeInput.value = "";
  reminderMessageInput.value = "";
  notificationMessage.innerHTML = `<p style="color: green;">Notification added successfully!</p>`;
  renderNotificationList();
}

function renderNotificationList() {
  const notificationList = document.getElementById("notificationList");

  if (!notificationList) return;

  notificationList.innerHTML = "";
  notifications.forEach((notification, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${notification.time}</strong> - ${notification.message}
      <button class="delete-button" onclick="deleteNotification(${index})">Delete❌</button>
    `;
    notificationList.appendChild(li);
  });
}

function deleteNotification(index) {
  notifications.splice(index, 1);
  renderNotificationList();
}

function renderHomeScreen() {
  // בדיקה שהמשתמש הגדיר יעד אישי
  if (!userDailyGoal) {
    container.innerHTML = `
          <h1>Error</h1>
          <p>Please set your daily goal first.</p>
          <button class="next-button" onclick="showResults()">Set Goal</button>
      `;
    return;
  }

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();
  const formattedTime = currentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const progressPercentage = Math.min((userIntake / userDailyGoal) * 100, 100);

  container.innerHTML = `
      <h1>Welcome to Your Hydration Tracker</h1>
      <p><strong>${formattedDate}</strong> | <strong>${formattedTime}</strong></p>
      <div class="water-info">
          <p><strong>Recommended Daily Intake:</strong> ${recommendedWaterIntake} liters</p>
          <p><strong>Your Daily Goal:</strong> ${userDailyGoal} liters</p>
      </div>
      <div class="progress-section">
          <h2>Your Progress</h2>
          <div class="progress-circle">
              <svg class="progress-ring" width="120" height="120">
                  <circle class="progress-ring__background" stroke="#e6e6e6" stroke-width="10" fill="transparent" r="50" cx="60" cy="60" />
                  <circle
                      class="progress-ring__circle"
                      stroke="#42a0f9"
                      stroke-width="10"
                      fill="transparent"
                      r="50"
                      cx="60"
                      cy="60"
                      style="stroke-dasharray: 314; stroke-dashoffset: ${(314 * (100 - progressPercentage)) / 100};"
                  />
              </svg>
          </div>
          <p>${userIntake.toFixed(1)} liters / ${userDailyGoal} liters</p>
      </div>
      <div class="intake-input">
          <button class="add-water-button" onclick="showCupSelection()">Add Water Intake</button>
      </div>
      <div id="motivationMessage">${getMotivationMessage()}</div>
  `;
}

const cupSizes = [
  { size: 100, img: "../resources/img/cup1.png" },
  { size: 125, img: "../resources/img/cup2.png" },
  { size: 150, img: "../resources/img/cup3.png" },
  { size: 200, img: "../resources/img/cup4.png" },
  { size: 250, img: "../resources/img/cup5.png" },
  { size: 300, img: "../resources/img/cup6.png" },
  { size: 400, img: "../resources/img/cup7.png" },
  { size: 500, img: "../resources/img/cup8.png" },
  { size: 600, img: "../resources/img/cup9.png" },
];


// הצגת התמונות לחלון הבחירה
function showCupSelection() {
  const selectionModal = document.createElement("div");
  selectionModal.classList.add("modal");

  const cupGrid = document.createElement("div");
  cupGrid.classList.add("grid");

  cupSizes.forEach(cup => {
    const cupItem = document.createElement("div");
    cupItem.classList.add("cup-item");

    const img = document.createElement("img");
    img.src = cup.img;
    img.alt = `${cup.size} ml`;

    const label = document.createElement("span");
    label.innerText = `${cup.size} ml`;

    cupItem.appendChild(img);
    cupItem.appendChild(label);
    cupGrid.appendChild(cupItem);
  });

  selectionModal.appendChild(cupGrid);
  document.body.appendChild(selectionModal);

  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = `
      <div class="modal-content">
          <h2>Select Cup Size</h2>
          <div class="cup-selection">
              ${cupSizes
      .map(
        (cup) => `
                  <div class="cup" onclick="addWaterFromCup(${cup.size})">
                      <img src="${cup.img}" alt="${cup.size} ml">
                      <p>${cup.size} ml</p>
                  </div>
              `
      )
      .join("")}
          </div>
          <button class="close-modal" onclick="closeModal()">Close</button>
      </div>
  `;

  document.body.appendChild(modal);
}

function addWaterFromCup(size) {
  const sizeInLiters = size / 1000;
  if (userIntake + sizeInLiters > userDailyGoal) {
    alert(`You can't exceed your daily goal of ${userDailyGoal} liters!`);
    return;
  }
  userIntake += sizeInLiters;
  closeModal();
  renderHomeScreen();
}

function closeModal() {
  const modal = document.querySelector(".modal");
  if (modal) {
    modal.remove();
  }
}


// Motivation message function
function getMotivationMessage() {
  const progress = (userIntake / userDailyGoal) * 100;

  if (progress >= 100) {
    return `<p style="color: green;">Great job! You've reached your daily goal! 🎉</p>`;
  } else if (progress >= 75) {
    return `<p style="color: green;">You're almost there! Keep going! 💪</p>`;
  } else if (progress >= 50) {
    return `<p style="color: blue;">Halfway there! You're doing great! 🌟</p>`;
  } else if (progress >= 25) {
    return `<p style="color: orange;">Good start! Keep it up! 🌟</p>`;
  } else {
    return `<p style="color: gray;">Stay motivated! You can do this! 🚀</p>`;
  }
}

// Initialize
renderStep();
