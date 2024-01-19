function getFormattedMonth(month) {
  // Convert month to a string and add a leading zero to single-digit months
  const monthString = month.toString();
  if (monthString.length === 1) {
    return `0${month}`;
  } else {
    return month;
  }
}

let today = new Date();
let currentMonth = getFormattedMonth(today.getMonth() + 1);
let currentYear = today.getFullYear();
let todayDay = today.getDate();

console.log(currentMonth);
console.log(currentYear);

let calendarEventsList = Array(31).fill("");

let eventsList;

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
      dateSpan.classList.add("date"); // Add the class to the span

      cell.appendChild(dateSpan); // Add the span to the cell
      cell.style.height = "100px";
      cell.classList.add("cell");
      cell.classList.add(`day-${date}`);
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
  monthAndYear.innerText = `${getFormattedMonth(month)}/${year}`;
}

async function fetchEvents(year, month) {
  try {
    const response = await fetch(
      `https://kaosevxmrvkc2qvjjonfwae4z40bylve.lambda-url.eu-west-2.on.aws/calendarManager?year=${year}&month=${getFormattedMonth(
        month
      )}`
    );
    const events = await response.json();
    console.log(events);
    eventsList = events;

    // Reset and populate the calendarEventsList array with new events
    calendarEventsList = Array(31).fill(null); // Initialize with null indicating no events
    console.log(calendarEventsList);
    for (let event of eventsList.events) {
      let startDateComponents = event.startDate
        .split("/")
        .map((num) => parseInt(num));
      let endDateComponents = event.endDate
        .split("/")
        .map((num) => parseInt(num));
      let startDay = startDateComponents[0];
      let endDay = endDateComponents[0];

      for (let day = startDay; day <= endDay; day++) {
        // Adjust index for 0-based array
        let index = day - 1;
        if (!calendarEventsList[index]) {
          calendarEventsList[index] = [];
        }

        calendarEventsList[index].push({
          name: event.name,
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          user: event.user,
          color: event.color,
        });
      }
    }

    // Update the calendar after fetching new events
    updateCalendar(currentMonth, currentYear);
    populateCalendar();
  } catch (error) {
    console.error("Error:", error);
    setTimeout(() => {
      fetchEvents(year, month);
    }, 10000);
  }
}

fetchEvents(currentYear, currentMonth).then(() => {});

function populateCalendar() {
  for (let i = 0; i < calendarEventsList.length; i++) {
    if (calendarEventsList[i] !== null) {
      let dayCell = document.querySelector(`.day-${i + 1}`);
      calendarEventsList[i].forEach((event) => {
        let eventElement = document.createElement("div");
        eventElement.classList.add("event");
        eventElement.innerText = `${event.name} - ${event.startTime}-${event.endTime}`;

        // Apply background and text color
        if (event.color && event.color.background && event.color.text) {
          eventElement.style.backgroundColor = event.color.background;
          eventElement.style.color = event.color.text;
        }

        dayCell.appendChild(eventElement);
      });
    }
  }
}

document.getElementById("prevMonth").addEventListener("click", () => {
  // convert the currentMonth to a number
  currentMonth = parseInt(currentMonth);
  // if it's 1, make it 12 and subtract 1 from the year
  if (currentMonth === 1) {
    currentMonth = 12;
    currentYear -= 1;
  } else {
    currentMonth -= 1;
  }

  fetchEvents(currentYear, currentMonth);
});

document.getElementById("nextMonth").addEventListener("click", () => {
  // convert the currentMonth to a number
  currentMonth = parseInt(currentMonth);
  // if it's 12, make it 1 and add 1 to the year
  if (currentMonth === 12) {
    currentMonth = 1;
    currentYear += 1;
  } else {
    currentMonth += 1;
  }

  fetchEvents(currentYear, currentMonth);
});

// Initialize calendar with current month and year
updateCalendar(currentMonth, currentYear);

// makes the month switcher the same width as the calendar (to "anchor" the forward and back buttons)
const resizeCalendarNav = () => {
  const calendarWidth = document.querySelector(".calendarAndDays").offsetWidth;
  const calendarNav = document.querySelector(".calendar-navigation");
  calendarNav.style.width = `${calendarWidth}px`;
};

resizeCalendarNav();

// Select the necessary elements
const openEventIcon = document.querySelector(".add-event-icon");
const modalPlusIcon = document.querySelector("[data-modal] .close-modal-icon");
const modalElement = document.querySelector("[data-modal]");

// add a transition of 0.5s to rotate to the modalPlusIcon with ease out
modalPlusIcon.style.transition = "0.5s ease-out";
openEventIcon.style.transition = "0.5s ease-out";

// Function to calculate the center position of an element
function getCenterPosition(element) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

// Function to adjust the entire modal position
function adjustModalPosition() {
  // Reset the transform property to ensure a clean state
  modalElement.style.transform = "";

  const outsideIconCenter = getCenterPosition(openEventIcon);
  const modalIconCenter = getCenterPosition(modalPlusIcon);

  const translateX = outsideIconCenter.x - modalIconCenter.x;
  let translateY = outsideIconCenter.y - modalIconCenter.y;

  // Apply translation to the entire modal to match the position of the outside icon
  modalElement.style.transform = `translate(${translateX}px, ${translateY}px)`;
}

// Attach event listener to openEventIcon for opening the modal
openEventIcon.addEventListener("click", () => {
  modalElement.showModal();
  adjustModalPosition();
  modalPlusIcon.style.transform = "rotate(45deg)";
  openEventIcon.style.transform = "rotate(45deg)";
});

// Event listener for closing the modal
modalPlusIcon.addEventListener("click", () => {
  modalElement.close();
  modalPlusIcon.style.transform = "rotate(0deg)";
  openEventIcon.style.transform = "rotate(0deg)";
});

// You might want to adjust the position on window resize as the position could change

window.addEventListener("resize", () => {
  resizeCalendarNav();
  adjustModalPosition();
});

/////////////////////////// Event Management ///////////////////////////

let openAIKey = "";

const fetchColors = async () => {
  try {
    const response = await fetch(
      "https://ti4hjowhkzaotsph53dyyv6luq0rqsvb.lambda-url.eu-west-2.on.aws/"
    );
    return response.json();
  } catch (error) {
    console.error("Error fetching the color data:", error);
  }
};

let calendarColors = fetchColors();

const generateRandomColors = () => {
  if (!calendarColors) {
    console.warn("Colors not loaded yet");
    // Return a default color pair or handle this case as appropriate
    return { text: "#000000", background: "#FFFFFF" };
  }
  const colorNames = Object.keys(calendarColors);
  const randomColorName =
    colorNames[Math.floor(Math.random() * colorNames.length)];
  return calendarColors[randomColorName];
};

async function fetchOpenAIKey() {
  try {
    const response = await fetch(
      `https://oh3uau67qoyk7juqhwo75ivyta0hhhcy.lambda-url.eu-west-2.on.aws/`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const responseData = await response.json();
      console.log("Received OpenAI API key:", responseData);
      openAIKey = responseData.key;
    }
  } catch (error) {
    console.error("Error fetching key:", error);
  }
}

fetchOpenAIKey();

async function postEvent(eventData, year, month) {
  try {
    const response = await fetch(
      `https://kaosevxmrvkc2qvjjonfwae4z40bylve.lambda-url.eu-west-2.on.aws/calendarManager?year=${year}&month=${month}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const responseData = await response.json();
      console.log("Event added successfully", responseData);
      fetchEvents(currentYear, currentMonth);

      updateCalendar(currentMonth, currentYear);
      // Use responseData here to get details like the new event ID or confirmation message
    }
  } catch (error) {
    console.error("Error posting event:", error);
  }
}

// Global array to store events
const newEvents = [];

const addEventButton = document.querySelector(".add-event-btn");
addEventButton.addEventListener("click", function () {
  const formatDate = function (date) {
    const day = date.slice(8, 10);
    const month = date.slice(5, 7);
    const year = date.slice(0, 4);
    return `${day}/${month}/${year}`;
  };

  const nameToPost = document.querySelector(".input-title").value;
  let startDateToPost = document.querySelector(".input-start-date").value;
  console.log(startDateToPost);
  if (startDateToPost === "") {
    startDateToPost = joinedDate;
  }
  const endDateToPost = document.querySelector(".input-end-date").value;
  const extractedMonth = startDateToPost.slice(5, 7);
  const extractedYear = startDateToPost.slice(0, 4);
  let userToPost = document.querySelector(".input-user").value;

  if (userToPost === "") {
    userToPost = "Bartek";
  }

  const startTimeToPost = document.querySelector(".input-start").value;
  const endTimeToPost = document.querySelector(".input-end").value;
  const locationToPost = document.querySelector(".input-location").value;

  const eventToPost = {
    name: nameToPost,
    startDate: formatDate(startDateToPost), // Format the start date to DD/MM/YYYY
    endDate: formatDate(endDateToPost), // Format the end date to DD/MM/YYYY
    startTime: startTimeToPost,
    endTime: endTimeToPost,
    location: locationToPost,
    user: userToPost,
    color: generateRandomColors(),
  };

  newEvents.push(eventToPost);
  console.log(eventToPost);

  // console.log(extractedMonth, extractedYear);
  postEvent(eventToPost, extractedYear, extractedMonth);

  console.log(newEvents);
  // updateCalendar(currentMonth, currentYear);
});
