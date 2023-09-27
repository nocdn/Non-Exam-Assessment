let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let todayDay = today.getDate();

console.log(currentMonth);
console.log(currentYear);

export function updateCalendar(month, year) {
  let firstDay = new Date(year, month).getDay();
  if (firstDay === 0) {
    // if Sunday
    firstDay = 6; // make it the last day of the week
  } else {
    firstDay--; // shift other days one place towards the start of the week
  }

  // This line calculates the number of days in the given month and year by creating a new Date object with the value 32 as the day parameter.
  // Since the getDate() method returns the actual date value of the object, subtracting this value from 32 gives us the number of days in the month.
  let daysInMonth = 32 - new Date(year, month, 32).getDate();

  let calendar = document.getElementById("calendar");
  calendar.innerHTML = ""; // Clear previous calendar

  // adding the days of the week (35 to make a 5x7 grid)
  for (let i = 0; i < 35; i++) {
    let cell = document.createElement("div");

    if (i >= firstDay && i < firstDay + daysInMonth) {
      let date = i - firstDay + 1;
      let dateSpan = document.createElement("span");
      dateSpan.innerText = date;
      dateSpan.classList.add("date"); // Add the class to the span

      cell.appendChild(dateSpan); // Add the span to the cell
      cell.style.height = "100px";
      cell.classList.add("cell");
      cell.classList.add(`day-${date}`);
    }

    calendar.appendChild(cell);
  }

  // Highlight current day with a dot
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

export async function fetchEvents(year, month) {
  try {
    const response = await fetch(
      `http://localhost:8000/api/events/${year}/${month}`
    );
    const events = await response.json();
    eventsList = events;

    // Reset and populate the calendarEventsList array with new events
    calendarEventsList = Array(31).fill("");
    for (let i = 0; i < eventsList.events.length; i++) {
      let eventDate = eventsList.events[i].date;
      eventDate = eventDate.split("-");
      eventDate = parseInt(eventDate[2]);
      eventDate = eventDate - 1;
      calendarEventsList[eventDate] = eventsList.events[i].name;
    }

    // Update the calendar after fetching new events
    updateCalendar(currentMonth, currentYear);
    populateCalendar();
  } catch (error) {
    console.error("Error:", error);
    setTimeout(() => {
      fetchEvents(year, month);
    }, 2000);
  }
}
