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

const supabaseUrl = "https://zbudweocjxngitnjautt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidWR3ZW9janhuZ2l0bmphdXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc1ODQxNjUsImV4cCI6MjAyMzE2MDE2NX0.1Wp-nSLyZQ_cXLPJC0uWa4sQpPvxWlTvQNNRMXYacP4";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

let currentUser_id = null;

function initializeUserFromLocalStorage() {
  const tokenString = localStorage.getItem(
    "sb-zbudweocjxngitnjautt-auth-token"
  );
  if (tokenString) {
    const tokenObj = JSON.parse(tokenString);
    currentUser_id = tokenObj.user.id; // Set the global variable with user details
  } else {
    console.log("No authentication token found in localStorage.");
  }
}

window.onload = async function () {
  if (!localStorage.getItem("sb-zbudweocjxngitnjautt-auth-token")) {
    location.href = "./authentication.html";
    return; // Exit if there's no auth token.
  }

  initializeUserFromLocalStorage();

  try {
    const userGroupsString = await getgroup_id(); // Assuming this gets a JSON string of group IDs.
    const userGroupIds = JSON.parse(userGroupsString); // Parse it into an array.

    if (userGroupIds && userGroupIds.length > 0) {
      const currentGroupId = localStorage.getItem("group_id");
      const isValidGroup = userGroupIds.includes(currentGroupId);

      if (!isValidGroup && currentGroupId) {
        console.warn(
          "Current group ID is not valid for the user. Please ensure selection is updated accordingly."
        );
        // Somehow handle invalid group ID (like notify the user, select a valid group)
      } else {
        // localStorage.setItem("group_id", userGroupIds[0]);
        // location.reload();
      }

      localStorage.setItem("all_group_ids", JSON.stringify(userGroupIds)); // Store all group IDs for future reference or validation.
      document.getElementById("group-selector").value = currentGroupId; // Set the group selector to the current group ID.
      fetchEvents(currentYear, currentMonth, currentGroupId); // Use the currentGroupId directly, as it's already been validated.
    } else {
      console.log("No group_id found for the current user.");
    }
  } catch (error) {
    console.error(`Failed loading events or group_id: ${error}`);
  }
};

async function getgroup_id() {
  const { data, error } = await supabaseClient
    .from("groups")
    .select()
    .eq(
      "user_id",
      JSON.parse(localStorage.getItem("sb-zbudweocjxngitnjautt-auth-token"))[
        "user"
      ]["id"]
    );

  if (error) {
    console.error("Error fetching group_id:", error);
    return null;
  }

  if (data.length === 0) {
    console.log("No groups found for the user.");
    return null;
  }

  const group_id = data[0]["group_id"];
  return group_id;
}

const group_id_list = document.getElementById("group-selector");

const positionGroupModal = function () {
  // Reset the modal's transform to ensure its position is calculated from its original state
  document.querySelector(".modal-adding-group").style.transform = "none";

  const selectRect = group_id_list.getBoundingClientRect();
  const modalRect = document
    .querySelector(".modal-adding-group")
    .getBoundingClientRect();
  const selectCenter = selectRect.left + selectRect.width / 2;
  const modalCenter = modalRect.left + modalRect.width / 2;
  const selectTop = selectRect.top;
  const modalTop = modalRect.top;
  const translateX = selectCenter - modalCenter;
  const translateY = selectTop - modalTop;

  // Apply the new transformation to position the modal correctly
  document.querySelector(
    ".modal-adding-group"
  ).style.transform = `translate(${translateX}px, ${translateY}px)`;
};

try {
  var group_id = await getgroup_id();
  group_id = JSON.parse(group_id);
  console.log(group_id[0]);
  localStorage.setItem("group_id", group_id[0]);

  window.parent.postMessage("group_id_set", "*");

  // const group_id_list = document.querySelector(".group_ids");
  group_id.forEach((element) => {
    const option = document.createElement("option");
    option.value = element;
    option.text = element;
    option.classList.add("group_id_option");

    group_id_list.add(option);
  });

  const addNewGroupOption = document.createElement("option");
  addNewGroupOption.value = "Add new group";
  addNewGroupOption.text = "Add new group";
  group_id_list.add(addNewGroupOption);
  group_id_list.addEventListener("change", async function () {
    if (group_id_list.value === "Add new group") {
      document.querySelector(".modal-adding-group").showModal();
      positionGroupModal();
      const addGroupButton = document.querySelector(".add-group-btn");
      addGroupButton.addEventListener("click", async function () {
        let currentGroup_id_list = JSON.parse(
          localStorage.getItem("all_group_ids")
        );
        let newGroup_ids_array = currentGroup_id_list;
        // use the elementSelector to get the value of the input field
        const elementToExtract = document.querySelector(".input-group-id");
        newGroup_ids_array.push(elementToExtract.value);
        console.log(document.querySelector(".input-group-id").value);
        console.log(newGroup_ids_array);
        localStorage.setItem(
          "all_group_ids",
          JSON.stringify(newGroup_ids_array)
        );

        localStorage.setItem("group_id", elementToExtract.value);

        let { addingUserData, addingUserError } = await supabaseClient
          .from("groups")
          .update({
            group_id: localStorage.getItem("all_group_ids"),
          })
          .eq(
            "user_id",
            JSON.parse(
              localStorage.getItem("sb-zbudweocjxngitnjautt-auth-token")
            )["user"]["id"]
          );

        if (addingUserError) {
          console.log(addingUserError);
        } else {
          location.reload();
        }
      });
    } else {
      localStorage.setItem("group_id", parseInt(group_id_list.value));
      fetchEvents(currentYear, currentMonth, localStorage.getItem("group_id"));
    }
  });
} catch (error) {
  console.error(`Failed loading events or groupid ${error}`);
}

document
  .querySelector(".close-group-modal-icon")
  .addEventListener("click", () => {
    document.querySelector(".modal-adding-group").close();
  });

document.querySelector(".signout").addEventListener("click", async function () {
  await supabaseClient.auth.signOut();
  localStorage.clear();
  location.href = "./authentication.html";
});

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
      dateSpan.classList.add(`date-${date}`);
      if (date === todayDay) {
        dateSpan.classList.add("today");
      }

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

const startTime = performance.now();

let xmlString = null;
async function fetchEvents(year, month, group_id) {
  try {
    let eventsList = []; // Initialize eventsList as an empty array
    xmlString = null;
    const url = `https://shared-calendar-bucket.s3.amazonaws.com/?prefix=${group_id}/${year}/${getFormattedMonth(
      month
    )}/`;
    const response = await fetch(url);
    xmlString = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const fetchFiles = async function (key) {
      const url = `https://shared-calendar-bucket.s3.amazonaws.com/${key}`;
      const response = await fetch(url);
      let text = await response.text();
      text = JSON.parse(text);
      eventsList.push(text); // Make sure eventsList is already initialized as an array
    };

    // Extracting <Key> elements
    const keys = xmlDoc.getElementsByTagName("Key");
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i].childNodes[0].nodeValue;
      await fetchFiles(key); // Consider awaiting fetchFiles if the order matters or if you need all files fetched before proceeding
    }
    console.log(eventsList);
    const endTime = performance.now();
    const timeTaken = endTime - startTime;
    console.log(
      `Time taken to fetch and process events: ${timeTaken} milliseconds`
    );

    // Reset and populate the calendarEventsList array with new events
    calendarEventsList = Array(31).fill(null); // Initialize with null indicating no events
    for (let event of eventsList) {
      // Directly iterate over eventsList
      let startDateComponents = event.startDate
        .split("/")
        .map((num) => parseInt(num));
      let endDateComponents = event.endDate
        .split("/")
        .map((num) => parseInt(num));
      let startDay = startDateComponents[0];
      let endDay = endDateComponents[0];

      for (let day = startDay; day <= endDay; day++) {
        let index = day - 1; // Adjust index for 0-based array
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
          user_id: event.user_id,
          group_id: event.group_id,
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
      fetchEvents(year, month, localStorage.getItem("group_id"));
    }, 10000);
  }
}
// async function fetchEvents(year, month, group_id) {
//   try {
//     let fetchURL = `https://kaosevxmrvkc2qvjjonfwae4z40bylve.lambda-url.eu-west-2.on.aws/calendarManager?year=${year}&month=${getFormattedMonth(
//       month
//     )}&group_id=${group_id}`;
//     const response = await fetch(fetchURL);

//     const events = await response.json();
//     console.log(events);
//     eventsList = events;

//     // Reset and populate the calendarEventsList array with new events
//     calendarEventsList = Array(31).fill(null); // Initialize with null indicating no events
//     for (let event of eventsList.events) {
//       let startDateComponents = event.startDate
//         .split("/")
//         .map((num) => parseInt(num));
//       let endDateComponents = event.endDate
//         .split("/")
//         .map((num) => parseInt(num));
//       let startDay = startDateComponents[0];
//       let endDay = endDateComponents[0];

//       for (let day = startDay; day <= endDay; day++) {
//         // Adjust index for 0-based array
//         let index = day - 1;
//         if (!calendarEventsList[index]) {
//           calendarEventsList[index] = [];
//         }

//         calendarEventsList[index].push({
//           name: event.name,
//           startTime: event.startTime,
//           endTime: event.endTime,
//           startDate: event.startDate,
//           endDate: event.endDate,
//           location: event.location,
//           user: event.user,
//           user_id: event.user_id,
//           group_id: event.group_id,
//           color: event.color,
//           eventID: event.eventID,
//         });
//       }
//     }

//     // Update the calendar after fetching new events
//     updateCalendar(currentMonth, currentYear);
//     populateCalendar();
//   } catch (error) {
//     console.error("Error fetching events:", error);
//     setTimeout(() => {
//       fetchEvents(year, month, localStorage.getItem("group_id"));
//     }, 10000);
//   }
// }

// fetchEvents(currentYear, currentMonth, group_id).then(() => {});

function populateCalendar() {
  for (let i = 0; i < calendarEventsList.length; i++) {
    if (calendarEventsList[i] !== null) {
      let dayCell = document.querySelector(`.day-${i + 1}`);
      let eventsOnSameDayCount = 0;

      calendarEventsList[i].forEach((event) => {
        let eventElement = document.createElement("div");
        eventElement.classList.add("event");
        eventElement.classList.add(`event-${event.eventID}`);
        eventElement.innerText = `${event.name}`;
        if (currentUser_id === event.user_id) {
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
            eventRemoveIcon.innerHTML = `<div class="event-confirm-delete-buttons"><i class="fa-solid fa-check confirm-delete"></i><i class="fa-solid fa-xmark discard-delete"></i></div>`;
            const confirmDelete = document.querySelector(".confirm-delete");
            const discardDelete = document.querySelector(".discard-delete");
            confirmDelete.style.cursor = "pointer";
            discardDelete.style.cursor = "pointer";
            confirmDelete.title = "Confirm Delete";
            discardDelete.title = "Discard Delete";

            confirmDelete.addEventListener("click", () => {
              console.log("Deleting event:", event.eventID);
              eventElement.style.opacity = "0";
              deleteEvent(event.eventID, localStorage.getItem("group_id"));
            });

            discardDelete.addEventListener("click", (e) => {
              // Stop the event from bubbling up, so when I press the confirm discard button, it doesn't also trigger the original delete button, and override the effects of this function
              e.stopPropagation();
              eventRemoveIcon.innerHTML = `<i class="fa-solid fa-circle-xmark"></i>`;
            });
          });
          eventElement.appendChild(eventRemoveIcon);
        }

        // Apply background and text color
        if (event.color && event.color.background && event.color.text) {
          eventElement.style.backgroundColor = event.color.background;
          eventElement.style.color = event.color.text;
        }

        // adding a hover tooltip with event details
        eventElement.title = `Start: ${event.startTime}, End: ${event.endTime}, Location: ${event.location}, User: ${event.user}, Event ID: ${event.eventID}, User ID: ${event.user_id}`;
        eventElement.addEventListener("mouseenter", () => {
          // expandCell(eventElement);
        });
        eventElement.addEventListener("mouseleave", () => {
          // shrinkCell("cell-clone");
        });
        dayCell.appendChild(eventElement);
      });

      const eventCells = document.querySelectorAll(".cell");
      eventCells.forEach((cell) => {
        // check how many children elements are in this cell element
        const childCount = cell.children.length;
        if (childCount > 2) {
          cell.classList.add("multiple-events");
          // get all the elements with class "event" inside this cell
          const cellEventElements = cell.querySelectorAll(".event");
          // add a class of "stacked-event" to each cell element selected here to make them stacked later in scss
          cellEventElements.forEach((eventElement) => {
            eventElement.classList.add("stacked-event");
          });
          // move all these elements into a new container with class "events-stack"
          const eventsStack = document.createElement("div");
          eventsStack.classList.add("events-stack");
          cellEventElements.forEach((eventElement) => {
            eventsStack.appendChild(eventElement);
          });
          cell.appendChild(eventsStack);
        }
      });
      stackEvents();
    }
  }

  highlightToday();
  const todaySpan = document.querySelector(`.date-${todayDay}`);
  todaySpan.style.animation = "pulse 0.5s";
}

function expandCell(cell) {
  let cellRect = cell.getBoundingClientRect();
  let cellClone = document.createElement("div");
  cellClone.classList.add("cell-clone");
  cellClone.style.position = "fixed"; // Use fixed to keep it relative to the viewport
  cellClone.style.width = `${cellRect.width}px`;
  cellClone.style.height = `${cellRect.height}px`;
  cellClone.innerHTML = cell.innerHTML;

  // Adjust left and top to center the clone over the original element
  cellClone.style.left = `${cellRect.left + window.scrollX}px`;
  cellClone.style.top = `${cellRect.top + window.scrollY}px`;
  cellClone.style.backgroundColor = cell.style.backgroundColor;
  cellClone.style.color = cell.style.color;
  cellClone.style.zIndex = "1000";
  // cellClone.style.opacity = "0"; // Start with opacity 0 for animation
  cellClone.style.borderRadius = "10px";
  cellClone.style.transition = "opacity 0.2s ease-out, transform 0.2s ease-out";
  cellClone.style.padding = "0.25rem";
  cell.appendChild(cellClone);

  // Delay changes to allow for animation
  setTimeout(() => {
    cellClone.style.opacity = "1";
    cellClone.style.transform = "scale(3)";
    cellClone.style.fontSize = "4.7px";
  }, 10); // Small delay to ensure the transition is rendered
}

function shrinkCell(cell) {
  // shrink the cloned element back to the original cell size and then remove it
  const cellToDelete = document.querySelector(`.${cell}`);
  console.log(`Removing: ${cellToDelete}`);
  setTimeout(() => {
    // cellToDelete.style.opacity = "0";
    cellToDelete.style.transform = "scale(0)";
    setTimeout(() => {
      cellToDelete.remove();
    }, 200);
  }, 200);
}

////// For multi-day events //////

function calculateEventDuration(startDate, endDate) {
  let start = new Date(startDate.split("/").reverse().join("/"));
  let end = new Date(endDate.split("/").reverse().join("/"));
  return (end - start) / (1000 * 60 * 60 * 24) + 1; // +1 to include the start day
}

function createMultiDayEventElement(event, duration) {
  let multiDayElement = document.createElement("div");
  multiDayElement.classList.add("multi-day-event");
  multiDayElement.innerText = event.name;

  // Calculate the grid column start and end
  let startDate = event.startDate.split("/");
  let startDay = parseInt(startDate[0], 10);
  multiDayElement.style.gridColumnStart = startDay;
  multiDayElement.style.gridColumnEnd = `span ${duration}`;

  // Apply event color
  if (event.color && event.color.background && event.color.text) {
    multiDayElement.style.backgroundColor = event.color.background;
    multiDayElement.style.color = event.color.text;
  }

  return multiDayElement;
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

  fetchEvents(currentYear, currentMonth, localStorage.getItem("group_id"));
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

  fetchEvents(currentYear, currentMonth, localStorage.getItem("group_id"));
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
  magenta: { text: "#3F1A4B", background: "#EBDFEF" },
  lightOrange: { text: "#8E3B1F", background: "#FCEED8" },
  orange: { text: "#442F1E", background: "#F3E4D6" },
  lightRed: { text: "#8C2822", background: "#F9E3E2" },
  red: { text: "#401B2B", background: "#EAD8E1" },
  lightPink: { text: "#821d40", background: "#F8E8F2" },
  // grey: { text: "#212936", background: "#F3F4F6" },
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
      openAIKey = responseData.key;
    }
  } catch (error) {
    console.error("Error fetching OpenAI key:", error);
  }
}

fetchOpenAIKey();

const startButton = document.querySelector(".start-changing-text");
const changingText = document.querySelector(".changingText");

const loadingTexts = [
  "Sending prompt",
  "Understanding your request",
  "Generating structured data",
  "Adding event",
];

let originalText = changingText.textContent;
let originalStyle = {
  filter: changingText.style.filter,
  opacity: changingText.style.opacity,
  scale: changingText.style.scale,
};

let animationTimeout = null;

function updateText(index) {
  if (index >= loadingTexts.length) {
    // Reset to original state
    changingText.textContent = originalText;
    changingText.style.filter = originalStyle.filter;
    changingText.style.opacity = originalStyle.opacity;
    changingText.style.scale = originalStyle.scale;
    return;
  }

  changingText.style.filter = "blur(4px)";
  changingText.style.opacity = "0.1";
  changingText.style.scale = "0.975";

  animationTimeout = setTimeout(() => {
    changingText.textContent = loadingTexts[index];
    changingText.style.filter = "blur(0px)";
    changingText.style.opacity = "0.9";
    changingText.style.scale = "1.0";

    let nextIndex = index + 1;
    animationTimeout = setTimeout(() => {
      updateText(nextIndex);
    }, 600);
  }, 300);
}

function stopTextAnimation() {
  if (animationTimeout) {
    clearTimeout(animationTimeout);
    animationTimeout = null;
  }
  changingText.textContent = originalText;
  changingText.style.filter = originalStyle.filter;
  changingText.style.opacity = originalStyle.opacity;
  changingText.style.scale = originalStyle.scale;

  document.querySelector(".natural-language-btn").style.justifyContent =
    "center";
}

startButton.addEventListener("click", () => {
  updateText(0);
});

async function postEvent(eventData, year, month, group_id) {
  try {
    const response = await fetch(
      `https://kaosevxmrvkc2qvjjonfwae4z40bylve.lambda-url.eu-west-2.on.aws/calendarManager?year=${year}&month=${month}&group_id=${group_id}`,
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

      fetchEvents(currentYear, currentMonth, localStorage.getItem("group_id"));
      modalPlusIcon.style.transform = "rotate(0deg)";
      openEventIcon.style.transform = "rotate(0deg)";
      modalElement.close();

      updateCalendar(currentMonth, currentYear);
    }
  } catch (error) {
    console.error("Error posting event:", error);
  }
}

modalElement.addEventListener("close", () => {
  stopTextAnimation();
  removeSpinner();

  removeEmojiGrid();
});

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
  const user_id = JSON.parse(
    localStorage.getItem("sb-zbudweocjxngitnjautt-auth-token").user.id
  );

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
    user_id: user_id,
    group_id: localStorage.getItem("group_id"),
    color: generateRandomColors(),
  };

  newEvents.push(eventToPost);
  console.log(`Posting event with this data: ${eventToPost}`);

  postEvent(
    eventToPost,
    extractedYear,
    extractedMonth,
    localStorage.getItem("group_id")
  );
});

async function deleteEvent(eventID, group_id) {
  try {
    const response = await fetch(
      `https://kaosevxmrvkc2qvjjonfwae4z40bylve.lambda-url.eu-west-2.on.aws/calendarManager?eventID=${eventID}&group_id=${group_id}`,
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
      fetchEvents(currentYear, currentMonth, localStorage.getItem("group_id"));
    }
  } catch (error) {
    console.error("Error deleting event:", error);
  }
}

function stackEvents() {
  let stackedEvents = document.querySelectorAll(".events-stack .stacked-event");
  let baseZIndex = 1000; // Starting Z-index
  let rotation = 0; // Starting rotation angle

  stackedEvents.forEach(function (event, index) {
    event.style.zIndex = baseZIndex - index; // Stack them on top of each other
    event.style.transform = "rotate(" + rotation + "deg)"; // Apply rotation
    event.style.position = "absolute"; // Make them absolute
    rotation += 4; // Increase rotation for the next element
  });

  const cellWidth = document.querySelector(".event").offsetWidth;
  const stackedCells = document.querySelectorAll(".events-stack");
  stackedCells.forEach(function (cell) {
    cell.style.width = cellWidth + "px";
  });
}

const deleteEventButton = document.querySelector(".delete-event-btn");
const deleteEventInputField = document.querySelector(".input-delete");

deleteEventInputField.addEventListener("keydown", function (event) {
  if (event.key === "Enter" || event.keyCode === 13) {
    event.preventDefault();

    const eventIDToDelete = document.querySelector(".input-delete").value;
    deleteEvent(eventIDToDelete, localStorage.getItem("group_id"));
    deleteEventInputField.value = "";
    fetchEvents(currentYear, currentMonth, localStorage.getItem("group_id"));
  }
});

deleteEventButton.addEventListener("click", function () {
  const eventIDToDelete = document.querySelector(".input-delete").value;
  deleteEvent(eventIDToDelete, localStorage.getItem("group_id"));
  fetchEvents(currentYear, currentMonth, localStorage.getItem("group_id"));
});

const todayForPrompt = new Date();
const dayIndex = todayForPrompt.getDay();
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const currentDayForPrompt = daysOfWeek[dayIndex];

const currentTime = new Date();
const currentHour = currentTime.getHours();
const currentMinute = currentTime.getMinutes();
const currentTimeString = `${currentHour}:${currentMinute}`;

const universalPrompt = `Today is ${joinedDate} (DD/MM/YYYY) and it is a ${currentDayForPrompt}. The time is ${currentTimeString}. You are an NLU to calendar converter. Output in JSON with the following keys: “name”, “startDate”, “endDate”, “startTime”, “endTime”, “location”.

Important: YOU MUST THINK STEP BY STEP, BUT ONLY FOR THE DATE, THEN ONLY AFTER GENERATE VALID JSON. BE CONCISE IN YOUR REASONING, USE SHORTHAND AND NOT FULL SENTENCES. Your responses should be in this format: [reasoning step by step for the correct date], [the actual json with curly braces {}]. Instructions: - Extract relevant info (morning: 7:00, afternoon: 15:00, evening: 19:00, night: 23:00) - Use 24-hour clock - Assume current day if no date given - Date in format DD/MM/YYYY - Assume all-day event if no time given (startTime: \"allDay\", endTime: \"allDay\") - Never omit any JSON keys - Assume 1-hour duration if no end time - the Name key should never contain any dates or times - Capitalize any names in the fields  - You may repeat info in multiple keys, if you need to. - If location not given, you can use \"None\" exactly - Capitalize first letters in \"name\" and \"location\" - When the user writes next year or in some amount of years, you should add to the year - ALWAYS count days from the current day - if the user writes \"next...\" always use the current day as a reference`;
const sendToOpenAI = function (textToParse) {
  const startTime = performance.now();
  const data = {
    model: "gpt-3.5-turbo-0125",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: universalPrompt,
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

      const regex = /\{[\s\S]*\}/;
      const match = responseMessage.match(regex);

      if (match) {
        const jsonString = match[0];
        const jsonObject = JSON.parse(jsonString);
        const eventData = {
          name: jsonObject.name,
          startDate: jsonObject.startDate,
          endDate: jsonObject.endDate || jsonObject.startDate,
          startTime: jsonObject.startTime,
          endTime: jsonObject.endTime,
          location: jsonObject.location,
          user_id: currentUser_id,
          group_id: localStorage.getItem("group_id"),
          color: generateRandomColors(),
        };
        const [day, month, year] = eventData.startDate.split("/");
        postEvent(eventData, year, month, localStorage.getItem("group_id"));
      } else {
        console.log("No JSON found");
        return data.choices[0].message.content;
      }
    })
    .catch((error) => {
      console.error("OpenAI Error:", error);
    });
};

const sendToMixtral = function (textToParse) {
  const startTime = performance.now();
  const data = {
    model: "accounts/fireworks/models/mixtral-8x7b-instruct",
    stream: false,
    n: 1,
    messages: [
      {
        role: "user",
        content: universalPrompt,
      },
    ],
    stop: ["<|im_start|>", "<|im_end|>", "<|endoftext|>"],
    top_p: 1,
    top_k: 50,
    presence_penalty: 0,
    frequency_penalty: 0,
    context_length_exceeded_behavior: "truncate",
    temperature: 0.2,
    max_tokens: 256,
  };

  fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer 1kl9aNR9Qn98OGW9wEdLGDk5GawQqFdZwqXliGS4Hdqnfq72`,
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
      console.log("Successfully fetched Mixtral response:", data);
      const responseMessage = data.choices[0].message.content; // The JSON string from OpenAI
    })
    .catch((error) => {
      console.error("Mixtral Error:", error);
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
  createSpinnerAsElement(".natural-language-btn", 18, "1rem", "0rem");
  document.querySelector(".natural-language-btn").style.justifyContent =
    "space-between";
});

/////////// button to add a fake event ///////////

const eventTitles = [
  "Cinema Trip",
  "Road Trip",
  "Dinner Date with Alice",
  "Aquarium Visit",
  "School Performance",
  "Family Reunion",
  "Beach Day Out",
  "Mountain Hiking Adventure",
  "Book Club Meeting",
  "Yoga Class",
  "Cooking Workshop",
  "Garden Party",
  "Art Exhibition Opening",
  "Music Festival",
  "Charity Fundraiser",
  "Science Fair",
  "Technology Conference",
  "Poetry Reading",
  "Ice Skating",
  "Birthday Celebration",
  "Wedding Anniversary",
  "Graduation Ceremony",
  "Job Interview",
  "Business Meeting",
  "Weekend Getaway",
];

// choose a random date between the start of the month and the end of the month
function randomFakeDate() {
  const date = Math.floor(Math.random() * 31) + 1;
  return date;
}

// choose a random event title from the array
function randomFakeTitle() {
  const title = eventTitles[Math.floor(Math.random() * eventTitles.length)];
  return title;
}

// choose a random start time

function randomFakeTime() {
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  return `${hours}:${minutes}`;
}

// choose a random location

function randomFakeLocation() {
  const locations = [
    "London",
    "Paris",
    "New York",
    "Tokyo",
    "Sydney",
    "Cape Town",
    "Rio de Janeiro",
    "Moscow",
    "Berlin",
    "Rome",
    "Athens",
    "Cairo",
    "Mumbai",
    "Beijing",
    "Seoul",
    "Bangkok",
    "Dubai",
    "Los Angeles",
    "Toronto",
    "Vancouver",
  ];
  const location = locations[Math.floor(Math.random() * locations.length)];
  return location;
}

// create a fake event object

function createFakeEvent() {
  const randomFakeDateToUse = randomFakeDate();
  const event = {
    name: randomFakeTitle(),
    startDate: `${randomFakeDateToUse}/${currentMonth}/${currentYear}`,
    endDate: `${randomFakeDateToUse}/${currentMonth}/${currentYear}`,
    startTime: randomFakeTime(),
    endTime: randomFakeTime(),
    location: randomFakeLocation(),
    user_id: currentUser_id,
    group_id: localStorage.getItem("group_id"),
    user: "Bartek",
    color: generateRandomColors(),
  };
  return event;
}

// post the fake event to the calendar

const addFakeEventButton = document.querySelector(".add-fake-event-btn");
addFakeEventButton.addEventListener("click", function () {
  const fakeEvent = createFakeEvent();
  const [day, month, year] = fakeEvent.startDate.split("/");

  postEvent(fakeEvent, year, month, localStorage.getItem("group_id"));
});

const highlightToday = () => {
  const todayCellSpan = document.querySelector(`.date-${todayDay}`);
  const boundingBox = todayCellSpan.getBoundingClientRect();
  const xCenter = (boundingBox.left + boundingBox.right) / 2;
  const yCenter = (boundingBox.top + boundingBox.bottom) / 2;
};

document
  .querySelector(".files-page-button")
  .addEventListener("click", function () {
    location.href = "./files.html";
  });

// Emoji picker

const emojiPickerButton = document.querySelector(".chosen-icon-container");
emojiPickerButton.addEventListener("click", showEmojiPicker);
const emojiPickerContainer = document.querySelector(".icon-choice-container");

function showEmojiPicker() {
  const emojisGrid = document.createElement("div");
  emojisGrid.classList.add("emojis-grid");
  emojisGrid.style.display = "grid";
  emojisGrid.style.rowGap = "1.5rem";
  emojisGrid.style.placeItems = "center";
  emojisGrid.style.gridTemplateColumns = "repeat(5, 20%)";
  emojisGrid.style.height = "fit-content";
  emojisGrid.style.width = "100%";
  emojisGrid.style.paddingTop = "1.5rem";
  emojisGrid.style.paddingBottom = "1.5rem";
  emojiPickerContainer.appendChild(emojisGrid);

  addEmojisToGrid();
  addIconClickHandlers();
}

const icons = [
  "tabler:calendar",
  "tabler:clock",
  "tabler:star",
  "tabler:bell-ringing",
  "tabler:cake",
  "tabler:baby-carriage",
  "tabler:confetti",
  "tabler:lollipop",
  "tabler:briefcase",
  "tabler:pencil",
  "tabler:certificate",
  "tabler:medical-cross",
  "tabler:cross",
  "tabler:pill",
  "tabler:smoking",
  "tabler:device-tv",
  "tabler:movie",
  "tabler:apple",
  "tabler:brand-apple-arcade",
  "tabler:yoga",
  "tabler:bike",
  "tabler:plane-arrival",
  "tabler:plane-departure",
  "tabler:plane-inflight",
  "tabler:planet",
  "tabler:home",
  "tabler:hotel-service",
  "tabler:beach",
  "tabler:air-balloon",
  "tabler:ball-basketball",
  "tabler:ball-football",
  "tabler:ball-volleyball",
  "tabler:ball-tennis",
  "tabler:barbell",
  "tabler:shoe",
  "tabler:mountain",
  "tabler:chess-knight",
  "tabler:meat",
  "tabler:device-laptop",
  "tabler:headphones",
  "tabler:video",
  "tabler:photo-video",
  "tabler:cloud-network",
  "tabler:gift",
  "tabler:music",
  "tabler:book",
];

function addEmojisToGrid() {
  const emojisGrid = document.querySelector(".emojis-grid");
  emojisGrid.innerHTML = "";
  for (let i = 0; i < icons.length; i++) {
    const emoji = icons[i];
    const icon = document.createElement("iconify-icon");
    icon.classList.add("icon");
    icon.setAttribute("icon", emoji);
    icon.setAttribute("width", "1.76rem");
    icon.setAttribute("height", "1.76rem");
    icon.style.color = "#023265";
    icon.style.width = "fit-content";
    icon.style.height = "100%";
    emojisGrid.appendChild(icon);
  }
}

function removeEmojiGrid() {
  const emojisGrid = document.querySelector(".emojis-grid");
  emojisGrid.remove();
}

function addIconClickHandlers() {
  const allIcons = document.querySelectorAll(".icon");
  const previewIcon = document.querySelector(".preview-icon");

  allIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const iconName = icon.getAttribute("icon");
      console.log(iconName);

      previewIcon.setAttribute("icon", iconName);
      removeEmojiGrid();
    });
  });
}
