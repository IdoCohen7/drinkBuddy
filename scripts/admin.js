async function fetchAdminData(token) {
  const adminDataUrl = "https://sfflhd60jb.execute-api.us-east-1.amazonaws.com/Test/Admin";

  try {
    const response = await fetch(adminDataUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch admin data. HTTP Status: ${response.status}`);
    }

    // Parse JSON response
    const data = await response.json();
    console.log("Admin data response:", data);

    if (data.users && data.users.length > 0) {
      renderAdminTable(data.users);
    } else {
      displayNoUsersMessage();
    }

  } catch (error) {
    console.error("Error fetching admin data:", error);
  }
}

// Function to render admin table
function renderAdminTable(users) {
  // Destroy existing DataTable instance if it exists
  if ($.fn.DataTable.isDataTable('#usersTable')) {
    $('#usersTable').DataTable().destroy();
    $("#usersTable tbody").empty();
  }

  // Populate table rows dynamically
  users.forEach((user) => {
    $("#usersTable tbody").append(`
      <tr>
        <td>${user.userId}</td>
        <td>${user.birthdate || 'N/A'}</td>
        <td>${user.currentWater || 0}</td>
        <td>${user.email || 'N/A'}</td>
        <td>${user.familyName || 'N/A'}</td>
        <td>${user.gender || 'N/A'}</td>
        <td>${user.givenName || 'N/A'}</td>
        <td>${user.recommendedWater || 0}</td>
        <td>${new Date(user.signupDate).toLocaleDateString() || 'N/A'}</td>
        <td>${user.streak || 0}</td>
        <td>${user.waterGoal || 0}</td>
      </tr>
    `);
  });

  // Initialize DataTable with responsive settings
  $('#usersTable').DataTable({
    responsive: true,
    paging: true,
    searching: true,
    ordering: true,
    info: true,
    pageLength: 5,
    lengthMenu: [5, 10, 20, 50],
    order: [[8, "desc"]], // Order by Signup Date
    columnDefs: [
      { targets: [0], width: "20%" },  // Adjust specific column widths
      { targets: [3], width: "20%" },
      { targets: "_all", className: "text-center" } // Center align text
    ],
    language: {
      search: "Filter records:",
      lengthMenu: "Show _MENU_ entries",
      info: "Showing _START_ to _END_ of _TOTAL_ users",
      paginate: {
        next: "Next",
        previous: "Prev"
      }
    }
  });
}



// Function to display a message when no users are found
function displayNoUsersMessage() {
  const container = document.getElementById("container");
  container.innerHTML = `<p class="text-center text-muted">No user data available.</p>`;
}

// Fetch admin data immediately, assuming the user is an admin
const token = localStorage.getItem('jwtToken');
if (token) {
  fetchAdminData(token);
} else {
  console.error("No token found in localStorage");
}

function logoutUser() {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("user");
  alert("You have been logged out.");
  window.location.href = 'landing.html';
}

