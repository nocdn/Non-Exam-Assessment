const createSpinner = (elementToAttach, spinnerSize, side = "right") => {
  // Remove existing spinner if it exists
  removeSpinner();

  // New spinner element
  const spinner = document.createElement("div");
  spinner.className = "spinner";
  spinner.style.position = "absolute";
  spinner.style.zIndex = "9999"; // High z-index to ensure visibility
  spinner.style.fontSize = `${spinnerSize}px`; // Spinner size
  spinner.innerHTML = `
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
  `.trim();

  // Initially append the spinner to the body to measure its dimensions
  document.body.appendChild(spinner);

  // Get the target element
  const element = document.querySelector(elementToAttach);
  if (!element) {
    console.error(`Element to attach to (${elementToAttach}) not found.`);
    return;
  }

  // Calculate position
  const rect = element.getBoundingClientRect();
  const spinnerRect = spinner.getBoundingClientRect();

  // Set top position to align centers
  const topPosition = rect.top + rect.height / 2 - spinnerRect.height / 2;
  spinner.style.top = `${topPosition}px`;

  // Set left or right position
  if (side === "right") {
    spinner.style.left = `${rect.right + 10}px`; // 10px offset from the right side
  } else {
    spinner.style.left = `${rect.left - spinnerRect.width - 10}px`; // 10px offset from the left side
  }
};

const createSpinnerAsElement = function (
  elementToSelector,
  spinnerSize,
  leftMargin = "1rem",
  rightMargin = "1rem"
) {
  // Select the parent element to attach the spinner to
  const parentElement = document.querySelector(elementToSelector);
  if (!parentElement) {
    console.error(`Parent element (${elementToSelector}) not found.`);
    return;
  }

  // Remove existing spinner if it exists within the parent element
  const existingSpinner = parentElement.querySelector(".spinner");
  if (existingSpinner) {
    existingSpinner.remove();
  }

  // New spinner element
  const spinner = document.createElement("div");
  spinner.className = "spinner";
  spinner.style.fontSize = `${spinnerSize}px`; // Spinner size
  spinner.innerHTML = `
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
    <div class="spinner-blade"></div>
  `.trim();

  // Set margins from parameters
  spinner.style.marginLeft = leftMargin;
  spinner.style.marginRight = rightMargin;

  // Append spinner to the parent element
  parentElement.appendChild(spinner);
};

const removeSpinner = () => {
  // Select all spinner elements
  const spinners = document.querySelectorAll(".spinner");
  // Loop through all spinner elements and remove them
  spinners.forEach((spinner) => {
    spinner.parentNode.removeChild(spinner);
  });
};

// Function to set spinner size for a specific spinner
const setSpinnerSize = (spinner, size) => {
  if (spinner) {
    spinner.style.setProperty("--spinner-size", `${size}px`);
  }
};

eventsList = [];
function getFormattedMonth(month) {
  // Convert month to a string and add a leading zero to single-digit months
  const monthString = month.toString();
  if (monthString.length === 1) {
    return `0${month}`;
  } else {
    return month;
  }
}

let openAIKey = "";

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

const clearEventsScreen = function () {
  const events = document.querySelectorAll(".event");
  events.forEach((event) => {
    eventContainer.removeChild(event);
  });

  const noEventsElement = document.querySelector(".no-events");
  if (noEventsElement) {
    eventContainer.removeChild(noEventsElement);
  }
};

async function fetchEvents(year, month) {
  const formattedMonth = getFormattedMonth(month);
  try {
    const response = await fetch(
      `https://kaosevxmrvkc2qvjjonfwae4z40bylve.lambda-url.eu-west-2.on.aws/calendarManager?year=${year}&month=${formattedMonth}`
    );

    const data = await response.json();

    // Handle the case where no events are found or handle the list of event file names
    if (data.events.length === 0) {
      console.log("No events found for this month");
      // Handle no events found
      clearEventsScreen();
      createEventDivs(false);
    } else {
      // Assuming 'data' is an array of events
      eventsList = data; // Update the UI with these events
      console.log(eventsList.events);
      // Update your UI here with the eventsList
      clearEventsScreen();
      createEventDivs(eventsList);
    }
    removeSpinner();
  } catch (error) {
    console.error("Error:", error);
    // Handle errors, possibly with retry logic or user notification
  }
}

const eventContainer = document.querySelector(".events-container");

const createEventDivs = function (eventsFound = true) {
  if (!eventsFound) {
    const noEventsFound = document.createElement("div");
    noEventsFound.classList.add("no-events");
    noEventsFound.textContent = "No events found for this month";
    eventContainer.appendChild(noEventsFound);
    return;
  }
  let count = 0;
  for (let i = 0; i < eventsList.events.length; i++) {
    const eventName = eventsList.events[i]["name"];
    const eventElement = document.createElement("div");
    eventElement.classList.add("event");

    // Add delete icon element
    const deleteIcon = document.createElement("span");
    deleteIcon.classList.add("delete-icon");
    // add a class of "delete-eventID" to the icon
    deleteIcon.classList.add(`delete-${eventsList.events[i]["eventID"]}`);
    deleteIcon.innerHTML = "🗑️"; // Unicode for trash can
    deleteIcon.onclick = function () {
      createSpinner(`.delete-${eventsList.events[i]["eventID"]}`, 18, "right");
      deleteEvent(eventsList.events[i]["eventID"]); // Call the delete function when icon is clicked
      fetchEvents(selectedYear, selectedMonth);
    };

    eventElement.innerHTML = `
            <div class="individual_event event__title">${eventName}</div>
            <div class="individual_event_dates">
              <div class="individual_event event__date">${eventsList.events[i]["start_date"]}</div>
              <div class="individual_event date_divider">---</div>
              <div class="individual_event event__date">${eventsList.events[i]["end_date"]}</div>
            </div>
            <div class="individual_event_times">
              <div class="individual_event style_small event__start">${eventsList.events[i]["start_time"]}</div>
              <div class="individual_event time_divider">---</div>
              <div class="individual_event style_small event__end">${eventsList.events[i]["end_time"]}</div>
            </div>
            <div class="individual_event event__location">${eventsList.events[i]["location"]}</div>
            <div class="individual_event event__id">${eventsList.events[i]["eventID"]}</div>
            <div class="individual_event event__user">User: ${eventsList.events[i]["user"]}</div>

        `;
    eventElement.appendChild(deleteIcon);
    eventContainer.appendChild(eventElement);
    count++;
  }
};

// get current date
const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;
const day = date.getDate();

const joinedDate = `${day}/${month}/${year}`;

fetchEvents(year, getFormattedMonth(month));

const dateElement = document.querySelector(".date");
dateElement.textContent = `${getFormattedMonth(month)}/${year}`;

nextMonthArrow = document.querySelector(".next-month");
previousMonthArrow = document.querySelector(".previous-month");

let selectedMonth = getFormattedMonth(month);
let selectedYear = year;

nextMonthArrow.addEventListener("click", function () {
  selectedMonth++;
  if (selectedMonth > 12) {
    selectedMonth = 1;
    selectedYear++;
  }
  selectedMonth = getFormattedMonth(selectedMonth);
  updateDatePicker(selectedYear, selectedMonth);
  fetchEvents(selectedYear, selectedMonth);
  clearEventsScreen();
  console.log(selectedMonth);
});

previousMonthArrow.addEventListener("click", function () {
  selectedMonth--;
  if (selectedMonth < 1) {
    selectedMonth = 12;
    selectedYear--;
  }
  selectedMonth = getFormattedMonth(selectedMonth);
  updateDatePicker(selectedYear, selectedMonth);
  fetchEvents(selectedYear, selectedMonth);
  clearEventsScreen();
  console.log(selectedMonth);
});

const updateDatePicker = function (year, month) {
  const dateElement = document.querySelector(".date");
  dateElement.textContent = `${month}/${year}`;
};

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
      // Use responseData here to get details like the new event ID or confirmation message
    }
  } catch (error) {
    console.error("Error posting event:", error);
  }
  clearEventsScreen();
  fetchEvents(selectedYear, selectedMonth);
}

const generateRandomColors = function () {
  const backgroundColor =
    "#" + Math.floor(Math.random() * 16777215).toString(16);
  const textColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
  return { background: backgroundColor, text: textColor };
};

// Global array to store events
const newEvents = [];

const addEventButton = document.querySelector(".add-event-btn");
addEventButton.addEventListener("click", function () {
  createSpinner(".add-event-btn", 18, "right");
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
    start_date: formatDate(startDateToPost), // Format the start date to DD/MM/YYYY
    end_date: formatDate(endDateToPost), // Format the end date to DD/MM/YYYY
    start_time: startTimeToPost,
    end_time: endTimeToPost,
    location: locationToPost,
    user: userToPost,
    color: generateRandomColors(),
  };

  newEvents.push(eventToPost);
  console.log(eventToPost);

  // console.log(extractedMonth, extractedYear);
  postEvent(eventToPost, extractedYear, extractedMonth);

  console.log(newEvents);
  fetchEvents(extractedYear, extractedMonth);
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
      // Additional logic to update UI or state as needed
      // clear the events screen
      clearEventsScreen();
      fetchEvents(selectedYear, selectedMonth);
    }
  } catch (error) {
    console.error("Error deleting event:", error);
  }
}

const deleteEventButton = document.querySelector(".delete-event-btn");
deleteEventButton.addEventListener("click", function () {
  const eventIDToDelete = document.querySelector(".input-delete").value;
  deleteEvent(eventIDToDelete);
  fetchEvents(selectedYear, selectedMonth);
});

const OPENAI_API_KEY = "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";
const dateForOpenAI = `${day}/${getFormattedMonth(month)}/${year}`;
console.log(dateForOpenAI);
const sendToOpenAI = function (textToParse) {
  const prompt = `Today is ${joinedDate}. You are an NLU to calendar converter. Output in JSON with the following keys: “name”, “start_date”, “end_date”, “start_time”, “end_time”, “location”.

  Instructions:
  - Extract relevant info (morning: 7:00, afternoon: 15:00, evening: 19:00, night: 23:00)
  - Use 24-hour clock
  - Assume current day if no date given
  - Date in format DD/MM/YYYY
  - Assume all-day event if no time given (start_time: "allDay", end_time: "allDay")
  - Assume 1-hour duration if no end time
  - You may repeat info in multiple keys, eg. in "location" and "name"
  - Capitalize first letters in "name" and "location"`;

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
      Authorization: `Bearer ${openAIKey}`, // Ensure this is securely handled
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      const responseMessage = data.choices[0].message.content; // The JSON string from OpenAI
      // Convert JSON string to an object
      const eventDetails = JSON.parse(responseMessage);

      const eventData = {
        name: eventDetails.name,
        start_date: eventDetails.start_date,
        end_date: eventDetails.end_date,
        start_time: eventDetails.start_time,
        end_time: eventDetails.end_time,
        location: eventDetails.location,
        user: "Default User", // Modify as needed or extract from somewhere
        color: "YourColor", // Modify as needed or generate a color
      };
      const [day, month, year] = eventDetails.start_date.split("/");
      postEvent(eventData, year, month);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

const naturalLanguageButton = document.querySelector(".natural-language-btn");
const outputContainer = document.querySelector(".output-container");
naturalLanguageButton.addEventListener("click", function () {
  createSpinner(".natural-language-btn", 18, "right");
  const textToParse = document.querySelector(".input-natural").value;
  sendToOpenAI(textToParse);
  document.querySelector(".input-natural").value = "";
});
