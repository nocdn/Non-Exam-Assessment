import {
  createSpinner,
  createSpinnerAsElement,
  removeSpinner,
  setSpinnerSize,
} from "../assets/functions/spinner.js";

function getFormattedMonth(month) {
  // Convert month to a string and add a leading zero to single-digit months
  const monthString = month.toString();
  if (monthString.length === 1) {
    return `0${month}`;
  } else {
    return month;
  }
}

function unformatMonth(month) {
  // Remove leading zero from month
  return parseInt(month);
}

let today = new Date();
let currentMonth = getFormattedMonth(today.getMonth() + 1);

let currentYear = today.getFullYear();
let todayDay = today.getDate();

console.log(`Current month: ${currentMonth}`);
console.log(`Current year: ${currentYear}`);

const joinedDate = `${todayDay}/${currentMonth}/${currentYear}`;

let calendarEventsList = Array(31).fill("");

let eventsList;

function updateCalendar(month, year) {
  let firstDay = new Date(year, unformatMonth(month) - 1).getDay();
  if (firstDay === 0) {
    // If Sunday
    firstDay = 6; // Make it the last day of the week
  } else {
    firstDay--; // Shift other days one place towards the start of the week
  }
  let daysInMonth = 32 - new Date(year, unformatMonth(month) - 1, 32).getDate();

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
    console.log(`Fetched events: ${events}`);
    eventsList = events;

    // Reset and populate the calendarEventsList array with new events
    calendarEventsList = Array(31).fill(null); // Initialize with null indicating no events
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
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          user: event.user,
          color: event.color,
          eventID: event.eventID,
        });
      }
    }

    // Update the calendar after fetching new events
    updateCalendar(currentMonth, currentYear);
    populateCalendar();
  } catch (error) {
    console.error("Error fetching events:", error);
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
        eventElement.classList.add(`event-${event.eventID}`);
        eventElement.innerText = `${event.name}`;
        let eventRemoveIcon = document.createElement("div");
        eventRemoveIcon.innerHTML = `<i class="fa-solid fa-circle-xmark"></i>`;
        eventRemoveIcon.classList.add("event-remove-icon-container");
        eventRemoveIcon.classList.add(`remove-event-${event.eventID}`);
        eventRemoveIcon.style.position = "absolute";
        eventElement.style.position = "relative";

        eventRemoveIcon.style.right = "3px";
        eventRemoveIcon.style.bottom = "3px";
        eventRemoveIcon.style.cursor = "pointer";
        eventRemoveIcon.style.transform = "scale(0)";

        // Only show the remove icon when hovered over the cell
        eventElement.addEventListener("mouseenter", () => {
          eventRemoveIcon.style.transition = "0.2s ease-out";
          eventRemoveIcon.style.transform = "scale(1)";
        });

        eventElement.addEventListener("mouseleave", () => {
          eventRemoveIcon.style.transform = "scale(0)";
          setTimeout(() => {
            eventRemoveIcon.innerHTML = `<i class="fa-solid fa-circle-xmark"></i>`;
          }, 200);
        });

        eventRemoveIcon.addEventListener("click", () => {
          eventRemoveIcon.innerHTML = `<div class="event-confirm-delete-buttons"><i class="fa-solid fa-xmark discard-delete"></i><i class="fa-solid fa-check confirm-delete"></i></div>`;
          const confirmDelete = document.querySelector(".confirm-delete");
          const discardDelete = document.querySelector(".discard-delete");
          confirmDelete.style.cursor = "pointer";
          discardDelete.style.cursor = "pointer";
          confirmDelete.title = "Confirm Delete";
          discardDelete.title = "Discard Delete";

          confirmDelete.addEventListener("click", () => {
            console.log("Deleting event:", event.eventID);
            eventElement.style.opacity = "0";
            deleteEvent(event.eventID);
          });

          discardDelete.addEventListener("click", (e) => {
            // Stop the event from bubbling up, so when I press the confirm discard button, it doesn't also trigger the original delete button, and override the effects of this function
            e.stopPropagation();
            eventRemoveIcon.innerHTML = `<i class="fa-solid fa-circle-xmark"></i>`;
          });
        });

        // Apply background and text color
        if (event.color && event.color.background && event.color.text) {
          eventElement.style.backgroundColor = event.color.background;
          eventElement.style.color = event.color.text;
        }
        eventElement.appendChild(eventRemoveIcon);
        dayCell.appendChild(eventElement);
      });
    }
  }
}

document.getElementById("prevMonth").addEventListener("click", () => {
  // Convert the currentMonth to a number so we can decrement it
  currentMonth = parseInt(currentMonth);
  // If it's 1, make it 12 and subtract 1 from the year
  if (currentMonth === 1) {
    currentMonth = 12;
    currentYear -= 1;
  } else {
    currentMonth -= 1;
  }

  fetchEvents(currentYear, currentMonth);
});

document.getElementById("nextMonth").addEventListener("click", () => {
  // Convert the currentMonth to a number so we can increment it
  currentMonth = parseInt(currentMonth);
  // If it's 12, make it 1 and add 1 to the year
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

// Makes the month switcher the same width as the calendar (to "anchor" the forward and back buttons)
const resizeCalendarNav = () => {
  const calendarWidth = document.querySelector(".calendarAndDays").offsetWidth;
  const calendarNav = document.querySelector(".calendar-navigation");
  calendarNav.style.width = `${calendarWidth}px`;
};

resizeCalendarNav();

/////////////////////////// Modal Management ///////////////////////////

// Select the necessary elements
const openEventIcon = document.querySelector(".add-event-icon");
const modalPlusIcon = document.querySelector("[data-modal] .close-modal-icon");
const modalElement = document.querySelector("[data-modal]");

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

// Event listener for opening the modal when clicking the plus icon
openEventIcon.addEventListener("click", () => {
  modalElement.showModal();
  adjustModalPosition();
  modalPlusIcon.style.transform = "rotate(45deg)";
  openEventIcon.style.transform = "rotate(45deg)";
});

// Event listener for closing the modal when clicking the close icon
modalPlusIcon.addEventListener("click", () => {
  modalElement.close();
  modalPlusIcon.style.transform = "rotate(0deg)";
  openEventIcon.style.transform = "rotate(0deg)";
});

// Event listener for closing the modal when clicking outside of it
modalElement.addEventListener("click", (e) => {
  if (e.target === modalElement) {
    modalElement.close();
    modalPlusIcon.style.transform = "rotate(0deg)";
    openEventIcon.style.transform = "rotate(0deg)";
  }
});

window.addEventListener("resize", () => {
  resizeCalendarNav();
  adjustModalPosition();
});

const enterHandlingInputs = document.querySelectorAll(
  ".modal-adding-event-container .input-fields input"
);
const enterHandlingAddUserInput = document.querySelector(
  ".modal-adding-event-container .input-user"
);
const enterHandlingAddEventButton = document.querySelector(
  ".modal-adding-event-container .add-event-btn"
);

enterHandlingInputs.forEach((input, index) => {
  input.addEventListener("keydown", (e) => {
    // Check if the key pressed is 'Enter'
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default Enter key behavior (like form submission)

      // Special case for the input-user field
      if (input === enterHandlingAddUserInput) {
        // Simulate a click on the 'Add event' button
        enterHandlingAddEventButton.click();
      } else {
        // Focus on the next input field if it exists
        if (index < enterHandlingInputs.length - 1) {
          // Corrected this line
          enterHandlingInputs[index + 1].focus();
        }
      }
    }
  });
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

let calendarColors = {
  blue: { text: "#181C44", background: "#D9E9FD" },
  lightYellow: { text: "#7f693f", background: "#FDF9C9" },
  lightGreen: { text: "#264724", background: "#E2EFE5" },
  green: { text: "#424843", background: "#E2FBE8" },
  purple: { text: "#6326A2", background: "#F1E8FD" },
  Magenta: { text: "#3F1A4B", background: "#EBDFEF" },
  lightOrange: { text: "#8E3B1F", background: "#FCEED8" },
  orange: { text: "#442F1E", background: "#F3E4D6" },
  lightRed: { text: "#8C2822", background: "#F9E3E2" },
  red: { text: "#401B2B", background: "#EAD8E1" },
  lightPink: { text: "#821d40", background: "#F8E8F2" },
  grey: { text: "#212936", background: "#F3F4F6" },
};

const generateRandomColors = () => {
  if (!calendarColors) {
    console.warn("Colors not loaded yet");
    // Returns default colours
    return { text: "#3F1A4B", background: "#EBDFEF" };
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
    console.error("Error fetching OpenAI key:", error);
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
      modalPlusIcon.style.transform = "rotate(0deg)";
      openEventIcon.style.transform = "rotate(0deg)";
      modalElement.close();

      updateCalendar(currentMonth, currentYear);
    }
  } catch (error) {
    console.error("Error posting event:", error);
  }
}

// Global array to store events to be posted
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
  console.log(`Posting event with this data: ${eventToPost}`);

  postEvent(eventToPost, extractedYear, extractedMonth);
});

async function deleteEvent(eventID) {
  try {
    const response = await fetch(
      `https://kaosevxmrvkc2qvjjonfwae4z40bylve.lambda-url.eu-west-2.on.aws/calendarManager?eventID=${eventID}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const responseData = await response.json();
      console.log("Event deleted successfully", responseData);
      modalPlusIcon.style.transform = "rotate(0deg)";
      openEventIcon.style.transform = "rotate(0deg)";
      modalElement.close();
      fetchEvents(currentYear, currentMonth);
    }
  } catch (error) {
    console.error("Error deleting event:", error);
  }
}

const deleteEventButton = document.querySelector(".delete-event-btn");
const deleteEventInputField = document.querySelector(".input-delete");

deleteEventInputField.addEventListener("keydown", function (event) {
  if (event.key === "Enter" || event.keyCode === 13) {
    event.preventDefault();

    const eventIDToDelete = document.querySelector(".input-delete").value;
    deleteEvent(eventIDToDelete);
    deleteEventInputField.value = "";
    fetchEvents(currentYear, currentMonth);
  }
});

deleteEventButton.addEventListener("click", function () {
  const eventIDToDelete = document.querySelector(".input-delete").value;
  deleteEvent(eventIDToDelete);
  fetchEvents(currentYear, currentMonth);
});

const sendToOpenAI = function (textToParse) {
  const startTime = performance.now();
  const prompt = `Today is ${joinedDate}. You are an NLU to calendar converter. Output in JSON with the following keys: “name”, “startDate”, “endDate”, “startTime”, “endTime”, “location”.

  YOU MUST OUTPUT NOTHING BUT THE RAW JSON, NO CODEBLOCKS, NO COMMENTS OR ANYTHING ELSE.
  Instructions:
  - Extract relevant info (morning: 7:00, afternoon: 15:00, evening: 19:00, night: 23:00)
  - Use 24-hour clock
  - Assume current day if no date given
  - Date in format DD/MM/YYYY
  - Assume all-day event if no time given (startTime: "allDay", endTime: "allDay")
  - Never ommit any JSON keys
  - Assume 1-hour duration if no end time
  - You may repeat info in multiple keys, eg. in "location" and "name"
  - Capitalize first letters in "name" and "location"
  - For the "location", use comedic slang if not provided, like "gaff"`;

  const data = {
    model: "gpt-3.5-turbo-1106",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: textToParse,
      },
    ],
  };

  fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAIKey}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      const endTime = performance.now();
      const timeTaken = endTime - startTime;
      console.warn(
        `Response received in ${timeTaken.toFixed(2)} milliseconds.`
      );
      console.log("Successfully fetched OpenAI response:", data);
      const responseMessage = data.choices[0].message.content; // The JSON string from OpenAI

      // Convert JSON string to an object for easier usage
      const eventDetails = JSON.parse(responseMessage);

      const eventData = {
        name: eventDetails.name,
        startDate: eventDetails.startDate,
        endDate: eventDetails.endDate || eventDetails.startDate,
        startTime: eventDetails.startTime,
        endTime: eventDetails.endTime,
        location: eventDetails.location,
        user: "Default User",
        color: generateRandomColors(),
      };
      const [day, month, year] = eventDetails.startDate.split("/");
      postEvent(eventData, year, month);
    })
    .catch((error) => {
      console.error("OpenAI Error:", error);
    });
};

const naturalLanguageButton = document.querySelector(".natural-language-btn");
const naturalLanguageInputField = document.querySelector(".input-natural");

naturalLanguageInputField.addEventListener("keydown", function (event) {
  if (event.key === "Enter" || event.keyCode === 13) {
    event.preventDefault();

    const textToParse = document.querySelector(".input-natural").value;
    sendToOpenAI(textToParse);
    document.querySelector(".input-natural").value = "";
  }
});

naturalLanguageButton.addEventListener("click", function () {
  const textToParse = document.querySelector(".input-natural").value;
  sendToOpenAI(textToParse);
  document.querySelector(".input-natural").value = "";
});
