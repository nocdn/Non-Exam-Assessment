let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let todayDay = today.getDate();

// list of events, if nothing is happening, then empty string, if something is happening, then string with event name, enough strings for all the days in the month

const calendarEventsList = [
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "Job interview",
  "",
  "",
  "",
  "Meeting with friends",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "Doctor's appointment",
  "",
  "",
];

document.getElementById("prevMonth").addEventListener("click", () => {
  if (currentMonth === 0) {
    currentMonth = 11;
    currentYear -= 1;
  } else {
    currentMonth -= 1;
  }
  updateCalendar(currentMonth, currentYear);
});

document.getElementById("nextMonth").addEventListener("click", () => {
  if (currentMonth === 11) {
    currentMonth = 0;
    currentYear += 1;
  } else {
    currentMonth += 1;
  }
  updateCalendar(currentMonth, currentYear);
});

function updateCalendar(month, year) {
  let firstDay = new Date(year, month).getDay();
  if (firstDay === 0) {
    // if Sunday
    firstDay = 6; // make it the last day of the week
  } else {
    firstDay--; // shift other days one place towards the start of the week
  }

  let daysInMonth = 32 - new Date(year, month, 32).getDate();

  let calendar = document.getElementById("calendar");
  calendar.innerHTML = ""; // Clear previous calendar

  for (let i = 0; i < 35; i++) {
    let cell = document.createElement("div");

    if (i >= firstDay && i < firstDay + daysInMonth) {
      let date = i - firstDay + 1;
      let dateSpan = document.createElement("span");
      dateSpan.innerText = date;
      dateSpan.classList.add("date");

      cell.appendChild(dateSpan); // Add the span to the cell
      cell.style.height = "100px";
      cell.classList.add("cell");
      cell.classList.add(`day-${date}`);
      if (calendarEventsList[date - 1] !== "") {
        let eventSpan = document.createElement("p");
        eventSpan.innerText = calendarEventsList[date - 1];
        eventSpan.classList.add("event");
        cell.appendChild(eventSpan);
      }
    }

    calendar.appendChild(cell);
  }

  // Highlight current day
  if (month === today.getMonth() && year === today.getFullYear()) {
    let currentDayCell = document.querySelector(`.day-${todayDay}`);
    currentDayCell.classList.add("current-day");
    if (currentDayCell) {
      let dateSpan = currentDayCell.querySelector(".date"); // Select the date span within the cell
      dateSpan.classList.add("current-day-span"); // Add the class to the span
    }
  }

  // Update month and year header
  let monthAndYear = document.getElementById("monthAndYear");
  monthAndYear.innerText = `${month + 1}/${year}`;
}

// Initialize calendar with current month and year
updateCalendar(currentMonth, currentYear);
