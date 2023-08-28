let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let todayDay = today.getDate();

let calendarEventsList = [
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

const inputName = document.getElementById("event-name");
const inputDate = document.getElementById("event-date");
const inputButton = document.getElementById("add-event");

inputButton.addEventListener("click", () => {
  let date = inputDate.value - 1;
  let name = inputName.value;
  calendarEventsList[date] = name;
  updateCalendar(currentMonth, currentYear);
});

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
      // Adding the event to the box
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

document.addEventListener("DOMContentLoaded", () => {
  // Create floating element with a delete button
  let floatingElement = document.createElement("div");
  let deleteButton = document.createElement("button");
  deleteButton.innerText = "Yes";
  floatingElement.innerHTML = "Delete Event?";
  floatingElement.appendChild(deleteButton); // Add the delete button to the floating element
  floatingElement.classList.add("floating"); // for CSS styling
  document.body.appendChild(floatingElement);

  let floating = false;
  let clickedEvent;

  // Attach the onclick event
  document.querySelectorAll(".event").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent event from bubbling up to the document
      item.classList.toggle("event-clicked");
      floatingElement.style.left = `${e.clientX}px`;
      floatingElement.style.top = `${e.clientY}px`;
      floatingElement.style.display = "block";
      floating = true;

      clickedEvent = item; // Remember this event
    });
  });

  deleteButton.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent event from bubbling up to the document
    if (clickedEvent) {
      // Remove the event from the calendarEventsList array
      let eventDay = clickedEvent.parentElement.classList[1].split("-")[1]; // Get the day of the event
      calendarEventsList[eventDay - 1] = ""; // Remove the event from the list

      // Remove the event from the DOM
      clickedEvent.remove();

      // Hide the floating element
      floatingElement.style.display = "none";
      floating = false;
    }
  });

  // Hide floating element when anything other than an .event element is clicked
  document.addEventListener("click", (e) => {
    if (floating && !e.target.classList.contains("event")) {
      floatingElement.style.display = "none";
      floating = false;
    }
  });
});

// Initialize calendar with current month and year
updateCalendar(currentMonth, currentYear);

// Natural language input and OpenAI request

const naturalLanguageInputField = document.querySelector(".natural-language");
let naturalLanguageInput = "";

inputButton.addEventListener("click", () => {
  console.log(naturalLanguageInputField.value);
  naturalLanguageInput = naturalLanguageInputField.value;
});

// const { Configuration, OpenAIApi } = require("openai");

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

// async function runCompletion() {
//   const completion = await openai.createCompletion({
//     model: "gpt-3.5-turbo",
//     prompt: "How are you today?",
//     max_tokens: 4000,
//   });
//   console.log(completion.data.choices[0].text);
// }
// runCompletion();

fetch("/api/query", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    prompt: 'Translate the following English text to French: "{}"',
  }),
})
  .then((response) => response.json())
  .then((data) => {
    console.log(data); // Process the API response
  });
