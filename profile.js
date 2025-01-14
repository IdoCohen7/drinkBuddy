document.addEventListener("DOMContentLoaded", () => {
    // Handle personal details form submission
    const personalForm = document.getElementById("personal-form");
    personalForm.addEventListener("submit", (event) => {
      event.preventDefault();
  
      const age = document.getElementById("age").value;
      const weight = document.getElementById("weight").value;
      const activity = document.getElementById("activity").value;
  
      if (age && weight && activity) {
        alert(`פרטים אישיים עודכנו בהצלחה! גיל: ${age}, משקל: ${weight}, רמת פעילות: ${activity}`);
        personalForm.reset();
      } else {
        alert("אנא מלא את כל השדות.");
      }
    });
  
    // Handle settings form submission
    const settingsForm = document.getElementById("settings-form");
    settingsForm.addEventListener("submit", (event) => {
      event.preventDefault();
  
      const dailyGoal = document.getElementById("daily-goal").value;
      const notificationType = document.querySelector('input[name="notification-type"]:checked').value;
      const frequency = document.getElementById("frequency").value;
  
      if (dailyGoal && notificationType && frequency) {
        alert(`הגדרות נשמרו! יעד יומי: ${dailyGoal} ליטר, סוג התראה: ${notificationType}, תדירות: כל ${frequency} שעות.`);
        settingsForm.reset();
      } else {
        alert("אנא מלא את כל השדות.");
      }
    });
  });
  