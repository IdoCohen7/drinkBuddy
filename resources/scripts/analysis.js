document.addEventListener("DOMContentLoaded", () => {
    // Initialize the chart
    const ctx = document.getElementById("waterChart").getContext("2d");
    const waterChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["יום א", "יום ב", "יום ג", "יום ד", "יום ה", "יום ו", "שבת"],
        datasets: [
          {
            label: "צריכת מים יומית (ליטרים)",
            data: [1.8, 2.0, 2.5, 1.9, 2.2, 2.3, 2.0],
            borderColor: "#00bcd4",
            backgroundColor: "rgba(0, 188, 212, 0.2)",
            borderWidth: 2,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 3,
          },
        },
      },
    });
  
    // Share achievements
    const shareButton = document.getElementById("share-achievements");
    shareButton.addEventListener("click", () => {
      alert("ההישגים שלך שותפו בהצלחה!");
    });
  });
  