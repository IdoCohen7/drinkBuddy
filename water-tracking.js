document.addEventListener("DOMContentLoaded", () => {
  const smallCups = document.querySelectorAll('.cup-small');
  const liters = document.getElementById('liters');
  const percentage = document.getElementById('percentage');
  const remained = document.getElementById('remained');
  const customIntakeForm = document.getElementById('custom-intake-form');
  const customAmountInput = document.getElementById('custom-amount');
  let currentIntake = 0; // Current water intake in mL
  const dailyGoal = 2000; // Daily goal in mL

  updateBigCup();

  smallCups.forEach((cup, idx) => {
    cup.addEventListener('click', () => highlightCups(idx));
  });

  function highlightCups(idx) {
    if (
      idx === smallCups.length - 1 &&
      smallCups[idx].classList.contains('full')
    ) {
      idx--;
    } else if (
      smallCups[idx].classList.contains('full') &&
      !smallCups[idx].nextElementSibling?.classList.contains('full')
    ) {
      idx--;
    }

    smallCups.forEach((cup, idx2) => {
      if (idx2 <= idx) {
        cup.classList.add('full');
      } else {
        cup.classList.remove('full');
      }
    });

    updateBigCup();
  }

  function updateBigCup() {
    const fullCups = document.querySelectorAll('.cup-small.full').length;
    const totalCups = smallCups.length;
  
    // עדכון אחוזי המילוי בכוס הגדולה
    if (fullCups === 0) {
      percentage.style.visibility = 'hidden';
      percentage.style.height = 0;
    } else {
      percentage.style.visibility = 'visible';
      percentage.style.height = `${(fullCups / totalCups) * 100}%`;
      percentage.innerText = `${(fullCups / totalCups) * 100}%`;
    }
  
    // עדכון הכמות שנותרה לשתות
    if (fullCups === totalCups) {
      remained.style.visibility = 'hidden';
      remained.style.height = 0;
    } else {
      remained.style.visibility = 'visible';
      liters.innerText = `${2 - (250 * fullCups) / 1000}L`;
    }
  }
  

  customIntakeForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const customAmount = parseInt(customAmountInput.value);
    if (!isNaN(customAmount) && customAmount > 0) {
      currentIntake += customAmount;
      const fullCups = Math.min(Math.floor(currentIntake / 250), 8);
      highlightCups(fullCups - 1);
      customIntakeForm.reset();
    } else {
      alert('Please enter a valid quantity.');
    }
  });
});
