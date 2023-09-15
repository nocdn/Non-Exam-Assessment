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
  const createFloatingElement = () => {
    const element = document.createElement("div");
    element.classList.add("floating");
    element.innerHTML = "Delete Event?";
    const button = document.createElement("button");
    button.innerText = "Yes";
    element.appendChild(button);
    return { element, button };
  };

  const attachEventListeners = (floatingElement, deleteButton) => {
    let isFloatingVisible = false;
    let clickedEvent;

    // Helper function to show the floating element
    const showFloatingElement = (e, eventElement) => {
      clickedEvent = eventElement;
      floatingElement.style.left = `${e.clientX}px`;
      floatingElement.style.top = `${e.clientY}px`;
      floatingElement.style.filter = "blur(20px)";
      floatingElement.style.opacity = "0";
      floatingElement.style.display = "block";

      setTimeout(() => {
        floatingElement.classList.add("show");
        floatingElement.style.filter = "blur(0px)";
        floatingElement.style.opacity = "1";
      }, 0);

      isFloatingVisible = true;
    };

    // Helper function to hide the floating element
    const hideFloatingElement = () => {
      floatingElement.classList.remove("show");
      floatingElement.style.opacity = "0";

      setTimeout(() => {
        floatingElement.style.display = "none";
        floatingElement.style.filter = "blur(20px)";
      }, 500);

      isFloatingVisible = false;
    };

    document.querySelectorAll(".event").forEach((eventElement) => {
      eventElement.addEventListener("click", (e) => {
        e.stopPropagation();
        showFloatingElement(e, eventElement);
      });
    });

    deleteButton.addEventListener("click", (e) => {
      e.stopPropagation();
      if (clickedEvent) {
        clickedEvent.remove();
        hideFloatingElement();
      }
    });

    document.addEventListener("click", () => {
      if (isFloatingVisible) {
        hideFloatingElement();
      }
    });
  };

  const { element: floatingElement, button: deleteButton } =
    createFloatingElement();
  document.body.appendChild(floatingElement);

  attachEventListeners(floatingElement, deleteButton);
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

// picking a random colour for the background of the event
const randomColor = () => {
  // for colors, [first color is the background, second color is the text]
  // const colors = [
  //   ["#E1F5E7", "#475C4C"],
  //   ["#E5D7F9", "#56446F"],
  //   ["#DCEAFC", "#4A596C"],
  // ];

  const colors = [
    ["#E1F5E7", "#475C4C"],
    ["#E5D7F9", "#56446F"],
    ["#DCEAFC", "#4A596C"],
    ["#FFEDD9", "#bd8463"],
    ["#F2F4C3", "#798B5F"],
    ["#D3F3EE", "#4F7B74"],
    ["#FFEEFF", "#B085B5"],
    ["#D1F2EB", "#5D737E"],
  ];

  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

console.log(randomColor());

// iterate over every event and add a background color and a text color
const events = document.querySelectorAll(".event");
events.forEach((event) => {
  let [eventBackgroundColor, eventTextColor] = randomColor();
  event.style.backgroundColor = eventBackgroundColor;
  event.style.color = eventTextColor;
});
