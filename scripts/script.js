import { config } from "./config.js";
const clientId = config.CLIENT_ID;
const clientSecret = config.CLIENT_SECRET;
const tokenUrl = config.TOKEN_URL;
const redirectUri = config.REDIRECT_URI;
const container = document.getElementById("container");

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get("code");
    const storedToken = localStorage.getItem("jwtToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      const decodedToken = decodeJWT(storedToken);
      console.log(storedToken);
      
      console.log(decodedToken)
      if (decodedToken && !isTokenExpired(decodedToken)) {
        // Token is valid, fetch the latest user data
        try {
          const userId = decodedToken.sub;
          const updatedUserDetails = await fetchUserDetails(userId);
          localStorage.setItem("user", JSON.stringify(updatedUserDetails));
          // Check if the user is an admin
          const isAdmin = await checkIfAdmin(storedToken);
          if (isAdmin) {
            window.location.href = "admin.html";
            return;
          }

          if (updatedUserDetails.waterGoal !== undefined && updatedUserDetails.waterGoal !== 0) {
            renderHomeScreen(updatedUserDetails);
          } else {
            alert("You are being moved to the form!");
            window.location.href = "index.html";
          }
        } catch (fetchError) {
          console.error("Error fetching updated user details:", fetchError);
          renderLoginButton();
        }
        return;
      } else {
        // Token expired, remove it and ask user to re-login
        console.warn("Token expired. Please log in again.");
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("user");
      }
    }

    // If no valid token and user, check for auth code for authentication
    if (authCode) {
      try {
        const jwtToken = await getJWTToken(authCode);
        const userInfo = decodeJWT(jwtToken);

        localStorage.setItem("jwtToken", jwtToken);

        const userId = userInfo.sub;
        const response = await fetchUserDetails(userId);
        localStorage.setItem("user", JSON.stringify(response));

        // Check if the user is an admin
        const isAdmin = await checkIfAdmin(jwtToken);
        if (isAdmin) {
          window.location.href = "admin.html";
          return;
        }

        if (response.waterGoal === 0) {
          alert("You are being moved to the form!");
          window.location.href = "index.html";
        } else {
          renderHomeScreen(response);
        }
      } catch (error) {
        console.error("Error fetching user info or details:", error);
        renderLoginButton();
      }
    } else {
      renderLoginButton();
    }
  } catch (error) {
    console.error("An error occurred:", error);
    renderLoginButton();
  }
});

async function checkIfAdmin(token) {
  const adminCheckUrl = "https://sfflhd60jb.execute-api.us-east-1.amazonaws.com/Test/Admin";

  try {
    const response = await fetch(adminCheckUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 403) {
      // Handle non-admin users without logging an error
      return false;
    }

    if (!response.ok) {
      console.warn(`Failed to verify admin status. HTTP Status: ${response.status}`);
      return false;
    }

    // Parse JSON response
    const data = await response.json();
    console.log("Admin check response:", data);

    // Check if user is an admin based on the API response
    return data.message === "User is an Admin";

  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}



function renderLoginButton() {
  // Create a wrapper div for better styling and organization
  container.innerHTML = '';
  const wrapper = document.createElement("div");
  wrapper.className = "login-wrapper";

  // Create the welcome message
 const welcomeMessage = document.createElement("h3");
 const img = document.createElement('img');
 img.src = './img/logo.png';
 img.style.width = "150px";
 
 const paragraph = document.createElement('p');
 paragraph.textContent = 'Your water tracker and daily motivator 💧';
 welcomeMessage.textContent = "Welcome to DrinkBuddy!";
 welcomeMessage.style.marginBottom = "10px";  
 welcomeMessage.style.marginTop = "20px";  
 paragraph.style.marginBottom = "40px";


  const loginButton = document.createElement("a");
  loginButton.href =
    'https://us-east-1k3uuybpxr.auth.us-east-1.amazoncognito.com/login?client_id=6k3bof5l7k40ppo8lp3ugafhbg&response_type=code&scope=email+openid+phone&redirect_uri=https%3A%2F%2Fdrink-buddy-s3.s3.us-east-1.amazonaws.com%2Flanding.html';
  loginButton.textContent = "Login 🔑";
  loginButton.className = "login-button";
  wrapper.appendChild(img);
  wrapper.appendChild(welcomeMessage);
  wrapper.appendChild(paragraph);
  wrapper.appendChild(loginButton);

  container.appendChild(wrapper);
}

function decodeJWT(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

function isTokenExpired(token) {
  const currentTime = Math.floor(Date.now() / 1000);
  return token.exp < currentTime;
}

async function getJWTToken(authCode) {
  const credentials = btoa(`${clientId}:${clientSecret}`);

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: authCode,
    client_id: clientId,
    redirect_uri: redirectUri,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error("Failed to get token");
  }

  const data = await response.json();
  return data.id_token;
}

async function fetchUserDetails(userId) {
  const lambdaUrl = "https://fva2an4xhnk53a4rtbmlm3w26q0bqvot.lambda-url.us-east-1.on.aws/";

  const response = await fetch(lambdaUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user details: ${response.status}`);
  }

  const data = await response.json();
  return data.userDetails;
}

function renderHomeScreen(user) {
  if (!user) {
    container.innerHTML = `
      <h1>Error</h1>
      <p>User data not found. Please log in again.</p>
      <button class="next-button" onclick="renderLoginButton()">Login</button>
    `;
    return;
  }

  if (user.waterGoal == 0) {
    container.innerHTML = `
      <h1>Error</h1>
      <p>Please set your daily goal first.</p>
    `;
    return;
  }

  // Initial loading content with a spinner
  container.innerHTML = `
    <h1>Welcome, ${user.givenName} ${user.familyName}</h1>
    <p>Loading your data...</p>
    <div class="spinner"></div>
  `;

  // Simulate data loading delay (can be replaced with actual async data fetching)
  setTimeout(() => {
    const progressPercentage = Math.min((user.currentWater / user.waterGoal) * 100, 100);

    container.innerHTML = `
      <h1>Welcome, ${user.givenName} ${user.familyName}</h1>
      <p>Streak: <strong>${user.streak} days 🏆</strong></p>
      <div class="water-info">
          <p><strong>Recommended Daily Intake:</strong> ${user.recommendedWater} liters</p>
          <p><strong>Your Personal Daily Goal:</strong> ${user.waterGoal} liters</p>
          <p><strong>Your Current Intake:</strong> ${user.currentWater.toFixed(1)} liters</p>
      </div>
      <div class="progress-section">
          <h2>Your Progress</h2>
          <div class="progress-circle">
              <svg class="progress-ring" width="120" height="120">
                  <circle class="progress-ring__background" stroke="#e6e6e6" stroke-width="10" fill="transparent" r="50" cx="60" cy="60"></circle>
                  <circle
                      class="progress-ring__circle"
                      stroke="#42a0f9"
                      stroke-width="10"
                      fill="transparent"
                      r="50"
                      cx="60"
                      cy="60"
                      style="stroke-dasharray: 314; stroke-dashoffset: ${(314 * (100 - progressPercentage)) / 100};">
                  </circle>
              </svg>
          </div>
          <p>${user.currentWater.toFixed(1)} liters / ${user.waterGoal} liters</p>
      </div>
      <div class="intake-input">
                <button class="add-water-button">Add Water Intake 🥤</button>
          <button class="add-water-manually-button">Add Water Manually 🥤</button>
          </div>
      <div class="intake-input">
          <button class="edit-button" >Edit Goal 📝</button>
          <button class="analytics-button" >View Analytics 📊</button>
          <button class="logout-button" >Logout 🚪</button>
      </div>
      <div id="motivationMessage">${getMotivationMessage(user.currentWater, user.waterGoal)}</div>
    `;
    
    document.querySelector(".add-water-manually-button").addEventListener("click", showManualWaterModal);
    document.querySelector(".add-water-button").addEventListener("click", showCupSelection);
    document.querySelector(".analytics-button").addEventListener("click", async function() {
      const waterData = await fetchWeeklyConsumption(user.userId);
      showAnalytics(waterData, user.waterGoal);
    })
    document.querySelector(".logout-button").addEventListener("click", logoutUser);
    document.querySelector(".edit-button").addEventListener("click", function(){
      window.location.href = 'index.html';
    });

  }, 2000); // Simulated loading time (replace with real data fetch)
}


// Function to handle logout
function logoutUser() {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("user");
  alert("You have been logged out.");
  window.location.reload();  
}

// Function to handle analytics button click
function viewAnalytics() {
  window.location.href = "analytics.html";  // Redirect to the analytics page
}


// Function to provide motivational messages based on progress
function getMotivationMessage(currentWater, waterGoal) {
  const progress = (currentWater / waterGoal) * 100;

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


function showCupSelection() {
  const modal = document.createElement("div");
  modal.classList.add("modal");

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");
  modalContent.innerHTML = "<h2>Select Cup Size</h2>";

  const cupGrid = document.createElement("div");
  cupGrid.classList.add("cup-grid");

  cupSizes.forEach((cup) => {
    const cupElement = document.createElement("div");
    cupElement.classList.add("cup");
    cupElement.onclick = () => addWaterFromCup(cup.size);

    const cupImage = document.createElement("img");
    cupImage.src = cup.img;
    cupImage.alt = `${cup.size} ml`;

    const cupText = document.createElement("p");
    cupText.textContent = `${cup.size} ml`;

    cupElement.appendChild(cupImage);
    cupElement.appendChild(cupText);
    cupGrid.appendChild(cupElement);
  });

  modalContent.appendChild(cupGrid);
  const closeModalButton = document.createElement("button");
  closeModalButton.classList.add("close-modal");
  closeModalButton.textContent = "Close ❌";
  closeModalButton.onclick = closeModal;

  modalContent.appendChild(closeModalButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}


function closeModal() {
  const modal = document.querySelector(".modal");
  if (modal) modal.remove();
}

function addWaterFromCup(size) {
  const fixedSize = size / 1000;  // Convert ml to liters
  const user = JSON.parse(localStorage.getItem("user"));

  // Calculate the new intake
  let newWaterIntake = user.currentWater + fixedSize;

  // Prevent exceeding the goal in UI calculations
  if (newWaterIntake > user.waterGoal) {
    newWaterIntake = user.waterGoal;  // Limit the intake to the goal
  }

  // Update user object with new water intake
  user.currentWater += fixedSize;
  localStorage.setItem("user", JSON.stringify(user)); // Save updated user data in local storage

  // Update the displayed water intake dynamically
  const progressPercentage = Math.min((newWaterIntake / user.waterGoal) * 100, 100);
  
  document.querySelector(".progress-ring__circle").style.strokeDashoffset = 
    (314 * (100 - progressPercentage)) / 100;

  document.querySelector(".water-info p:nth-child(2)").innerHTML = 
    `<strong>Your Current Intake:</strong> ${user.currentWater.toFixed(1)} liters`;

  document.querySelector(".progress-section p").innerHTML = 
    `${user.currentWater.toFixed(1)} liters / ${user.waterGoal} liters`;

  document.getElementById("motivationMessage").innerHTML = getMotivationMessage(user.currentWater, user.waterGoal);

  // Call the API to update the backend
  addToCurrentWater(user.userId, fixedSize)
    .then(() => console.log("Water intake updated successfully!"))
    .catch((error) => {
      console.error("Error updating water intake:", error);
      alert("Failed to update water intake. Please try again.");
    });

  closeModal();
}


const cupSizes = [
  { size: 250, img: "./img/cup4.png" },
  { size: 500, img: "./img/cup5.png" },
  { size: 675, img: "./img/cup6.png" },
  { size: 750, img: "./img/cup7.png" },
  { size: 1000, img: "./img/cup8.png" }
];


async function addToCurrentWater(userId, amountToAdd) {
  const lambdaUrl = "https://sfflhd60jb.execute-api.us-east-1.amazonaws.com/Test/User/CurrentWater";
  try {
    const response = await fetch(lambdaUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        currentWater: amountToAdd, // The amount to add to currentWater
      }),
    });

    if (!response.ok) {
      // Attempt to extract the error details from the response
      const errorDetails = await response.text();
      throw new Error(`Error: ${response.status} - ${errorDetails}`);
    }

    const data = await response.json();
    console.log("Response from server:", data);
    return data; // Process the returned data as needed
  } catch (error) {
    console.error("Error updating current water:", error.message);
    throw error; // Re-throw the error for further handling if needed
  }
}

function showAnalytics(response, dailyWaterGoal) {
  // Remove any existing modal
  const existingModal = document.querySelector(".modal");
  if (existingModal) existingModal.remove();

  // Create modal
  const modal = document.createElement("div");
  modal.classList.add("modal");

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");
  modalContent.innerHTML = `
      <h2>Consumption Overview</h2>
      <div id="chart-container" style="width: 100%; height: 300px;"></div>
      <button class="close-modal">Close ❌</button>
  `;

  // Append content and show modal
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Add close button functionality
  document.querySelector(".close-modal").addEventListener("click", closeModal);

  // Check if the response has data before rendering the chart
  if (response && response.consumption && response.consumption.length > 0) {
    const chartContainer = document.getElementById("chart-container");
    chartContainer.innerHTML = '<canvas id="consumptionChart"></canvas>';
    renderConsumptionChart(response, dailyWaterGoal);
  } else {
    const chartContainer = document.getElementById("chart-container");
    chartContainer.innerHTML = "<p>No consumption data available.</p>";
  }
}
  
  function renderConsumptionChart(response, dailyWaterGoal) {
  const consumptionData = response.consumption;
  const dates = consumptionData.map(entry => entry.date);
  const amounts = consumptionData.map(entry => entry.amount);

  // Remove any existing canvas before rendering a new one
  const chartContainer = document.getElementById("chart-container");
  chartContainer.innerHTML = '<canvas id="consumptionChart"></canvas>';
  const ctx = document.getElementById("consumptionChart").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Water Consumption (liters)",
          data: amounts,
          backgroundColor: "rgba(66, 160, 249, 0.6)",
          borderColor: "rgba(66, 160, 249, 1)",
          borderWidth: 1,
        },
        {
          label: "Daily Water Goal",
          data: new Array(dates.length).fill(dailyWaterGoal),
          type: "line",
          borderColor: "rgba(255, 99, 132, 1)",  
          borderWidth: 3,  
          borderDash: [10, 5],  
          fill: false,
          pointRadius: 4,  
          pointBackgroundColor: "rgba(255, 99, 132, 1)",  
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,  
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Liters",
          },
        },
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
    },
  });
}


  
  async function fetchWeeklyConsumption(userId) {
  const lambdaUrl = "https://sfflhd60jb.execute-api.us-east-1.amazonaws.com/Test/User/WeeklyConsumption";

  try {
    console.log("Fetching weekly consumption from Lambda...");
    const response = await fetch(lambdaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch weekly consumption: ${response.status}`);
    }

    const data = await response.json();
    console.log("Weekly consumption fetched:", data);
    return data;
  } catch (error) {
    console.error("Error fetching weekly consumption:", error);
    throw error;
  }
}

function showManualWaterModal() {
  const modal = document.createElement("div");
  modal.classList.add("modal");

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");
  modalContent.innerHTML = `
    <h2>Add Water Manually</h2>
    <label for="manualWaterInput">Enter amount (ml):</label>
    <input type="number" id="manualWaterInput" placeholder="Enter amount in ml" min="1" required />
    <button id="submitManualWater" class="submit-button">Add Water ➕ </button>
    <button class="close-modal">Close ❌</button>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  document.querySelector(".close-modal").addEventListener("click", closeModal);
  document.getElementById("submitManualWater").addEventListener("click", handleManualWaterSubmission);
}

async function handleManualWaterSubmission() {
  const inputElement = document.getElementById("manualWaterInput");
  const waterAmount = parseFloat(inputElement.value);

  if (isNaN(waterAmount) || waterAmount <= 0) {
    alert("Please enter a valid amount of water.");
    return;
  }

  const fixedSize = waterAmount / 1000; // Convert ml to liters
  const user = JSON.parse(localStorage.getItem("user"));

  // Update user object with new water intake
  let newWaterIntake = user.currentWater + fixedSize;

  if (newWaterIntake > user.waterGoal) {
    newWaterIntake = user.waterGoal;  // Limit the intake to the goal
  }

  user.currentWater += fixedSize;
  localStorage.setItem("user", JSON.stringify(user));

  // Update UI
  document.querySelector(".progress-ring__circle").style.strokeDashoffset = 
    (314 * (100 - (newWaterIntake / user.waterGoal) * 100)) / 100;

  document.querySelector(".water-info p:nth-child(3)").innerHTML = 
    `<strong>Your Current Intake:</strong> ${user.currentWater.toFixed(1)} liters`;

  document.querySelector(".progress-section p").innerHTML = 
    `${user.currentWater.toFixed(1)} liters / ${user.waterGoal} liters`;

  document.getElementById("motivationMessage").innerHTML = getMotivationMessage(user.currentWater, user.waterGoal);

  // Call the API to update the backend
  try {
    await addToCurrentWater(user.userId, fixedSize);
    closeModal();
  } catch (error) {
    console.error("Error updating water intake:", error);
    alert("Failed to update water intake. Please try again.");
  }

  closeModal();
}
function launchConfetti() {
  const duration = 2 * 1000; // 2 seconds
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
