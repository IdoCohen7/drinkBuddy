document.addEventListener("DOMContentLoaded", () => {
    const notificationForm = document.getElementById("notification-form");
    const motivationalMessage = document.getElementById("motivational-message");
  
    // Handle notification settings form submission
    notificationForm.addEventListener("submit", (event) => {
      event.preventDefault();
  
      const startTime = document.getElementById("start-time").value;
      const endTime = document.getElementById("end-time").value;
      const frequency = parseInt(document.getElementById("frequency").value);
      const muteNotifications = document.getElementById("mute-notifications").checked;
  
      if (startTime && endTime && frequency > 0) {
        alert(`תזכורות נשמרו! התחלה: ${startTime}, סיום: ${endTime}, תדירות: ${frequency} דקות.`);
        if (muteNotifications) {
          alert("התראות יושתקו במהלך ישיבות.");
        }
        notificationForm.reset();
      } else {
        alert("אנא מלא את כל השדות.");
      }
    });
  
    // Rotating motivational messages
    const messages = [
      "זכור לשתות מים ולשמור על הבריאות!",
      "שתייה מספקת תעזור לך להתרכז!",
      "מים הם מקור החיים, שתה עוד כוס!",
      "שתייה מספקת משפרת את מצב הרוח!"
    ];
  
    let currentMessageIndex = 0;
  
    setInterval(() => {
      currentMessageIndex = (currentMessageIndex + 1) % messages.length;
      motivationalMessage.textContent = messages[currentMessageIndex];
    }, 5000); // Change message every 5 seconds
  });
  