const container = document.getElementById("container");

// Questions data
const steps = [
  { question: "What's your gender? 👫", options: ["Male 👨", "Female 👩", "Prefer not to say ❓"] },
  { question: "How tall are you? 📏", type: "scrollable", options: [...Array(201).keys()].map((i) => `${i} cm`), image: "./img/tall.png" },
  { question: "How much do you weigh? ⚖️", type: "scrollable", options: [...Array(201).keys()].map((i) => `${i} kg`), image: "./img/weigh.png" },
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
  
    if (steps[currentStep].image) {
    const image = document.createElement("img");
    image.src = steps[currentStep].image; // Add the `image` key to your questions
    image.alt = "Question Illustration";
    image.classList.add("question-image");
    image.style.width = '50px';
    container.appendChild(image);
  }

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
  let weight = parseInt(answers[2]); 
  let activityLevel = answers[6]; 
  let weather = answers[7]; 

  
  let waterIntake = weight * 30; 

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

  switch (weather) {
    case "Hot 🔥":
      waterIntake += 500;
      break;
    case "Temperate ⛅":
      waterIntake += 200;
      break;
    case "Cold ❄️":
      break;
  }

  return (waterIntake / 1000).toFixed(2);
}

// Show results
function showResults() {
  recommendedWaterIntake = calculateWaterIntake(answers);
  const user = JSON.parse(localStorage.getItem("user"));
  setWaterRecommendation(user.userId, recommendedWaterIntake);

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
    const user = JSON.parse(localStorage.getItem("user"));
    setWaterGoal(user.userId, userDailyGoal);
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
      <select id="reminderTime">
        ${generateHourlyTimeOptions()}
      </select>
      <br>
      <label for="reminderMessage">Reminder Message:</label>
      <input type="text" id="reminderMessage" placeholder="Enter your message" />
      <button class="save-button" onclick="saveNotification()">Add Notification🔔</button>
    </div>
    <div id="notificationMessage"></div>
    <ul id="notificationList" class="notification-list"></ul>
    <p>Skip to proceed with the selected hours or opt out of notifications</p>
    <div class="navigation-buttons">
      <button class="next-button" id="finalNext">Next➡️</button>
    </div>
  `;
 document.getElementById('finalNext').addEventListener("click", async function () {
  console.log("Button clicked");

  if (notifications != null) {
    console.log("Sending notifications...");
    const lambdaUrl = "https://sfflhd60jb.execute-api.us-east-1.amazonaws.com/Test/User/Notifications";
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const response = await fetch(lambdaUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.userId,
          reminders: notifications,
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error: ${response.status} - ${errorDetails}`);
      }

      const data = await response.json();
      console.log("Response from server:", data);
    } catch (error) {
      console.error("Error sending user notifications:", error.message);
    }
  }
  
  console.log("Redirecting to landing page...");
  window.location.href = 'landing.html';
});

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
  console.log(notifications);
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


// Initialize
renderStep();

async function setWaterGoal(userId, waterGoal) {
  const lambdaUrl = "https://sfflhd60jb.execute-api.us-east-1.amazonaws.com/Test/User/WaterGoal";
  try {
    const response = await fetch(lambdaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        waterGoal: waterGoal, // Set the user's water goal
      }),
    });

    if (!response.ok) {
      // Attempt to extract error details from the response
      const errorDetails = await response.text();
      throw new Error(`Error: ${response.status} - ${errorDetails}`);
    }

    const data = await response.json();
    return data; // Return the response data
  } catch (error) {
    console.error("Error setting water goal:", error.message);
    throw error; // Re-throw the error for further handling
  }
}

async function setWaterRecommendation(userId, waterRecommendation) {
  const lambdaUrl = "https://sfflhd60jb.execute-api.us-east-1.amazonaws.com/Test/User/RecommendedWater";
  try {
    const response = await fetch(lambdaUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        recommendedWater: waterRecommendation, // Set the user's water goal
      }),
    });

    if (!response.ok) {
      // Attempt to extract error details from the response
      const errorDetails = await response.text();
      throw new Error(`Error: ${response.status} - ${errorDetails}`);
    }

    const data = await response.json();
    console.log("Response from server:", data);
    return data; // Return the response data
  } catch (error) {
    console.error("Error setting water recommended:", error.message);
    throw error; // Re-throw the error for further handling
  }
}

function generateHourlyTimeOptions() {
  let options = "";
  for (let hour = 0; hour < 24; hour++) {
    const time = `${hour.toString().padStart(2, "0")}:00`;
    options += `<option value="${time}">${time}</option>`;
  }
  return options;
}