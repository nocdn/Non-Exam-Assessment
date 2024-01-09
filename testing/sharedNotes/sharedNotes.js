async function fetchNotes() {
  try {
    const response = await fetch(
      `https://eopcsfkmlwkil4fzaqz6u4nqam0unwxc.lambda-url.eu-west-2.on.aws/`
    );
    const data = await response.json();
    // Handle the case where no notes are found or handle the list of note file names
    if (data.notes.length === 0) {
      removeSpinner();
      console.log("No notes found");
      // Clear existing notes if any
      const pinnedContainer = document.querySelector(".pinnedNotesContainer");
      const regularContainer = document.querySelector(".regularNotesContainer");
      pinnedContainer.innerHTML = "";
      regularContainer.innerHTML = "";
    } else {
      removeSpinner();
      displayNotes(data.notes); // Call function to display notes
      console.log("Notes found:", data.notes);
    }
  } catch (error) {
    console.error("Error:", error);
    // Handle errors, possibly with retry logic or user notification
  }
}

function displayNotes(notes) {
  const pinnedContainer = document.querySelector(".pinnedNotesContainer");
  const regularContainer = document.querySelector(".regularNotesContainer");

  clearExistingNotes(pinnedContainer, regularContainer);

  notes.forEach((note) => {
    const noteElement = createNoteElement(note);

    if (note.is_pinned === 1) {
      pinnedContainer.appendChild(noteElement);
    } else {
      regularContainer.appendChild(noteElement);
    }
  });
}

function clearExistingNotes(pinnedContainer, regularContainer) {
  pinnedContainer.innerHTML = "";
  regularContainer.innerHTML = "";
}

function createNoteElement(note) {
  const noteElement = document.createElement("div");
  noteElement.classList.add("note");

  const noteText = createNoteTextElement(note);
  const creationDateTime = createCreationDateTimeElement(note);
  noteElement.appendChild(noteText);
  noteElement.appendChild(creationDateTime);

  if (note.updated_date) {
    const updatedDateTime = createUpdatedDateTimeElement(note);
    noteElement.appendChild(updatedDateTime);
  }

  const iconContainer = createIconContainer();
  const deleteIcon = createDeleteIcon(note);
  const editIcon = createEditIcon(note);
  iconContainer.appendChild(deleteIcon);
  iconContainer.appendChild(editIcon);

  noteElement.appendChild(iconContainer);

  return noteElement;
}

function createNoteTextElement(note) {
  const noteText = document.createElement("p");
  noteText.innerHTML = note.note_text.replace(/\n/g, "<br>");
  noteText.classList.add(note.note_id, "note-text");
  return noteText;
}

function createCreationDateTimeElement(note) {
  const creationDateTime = document.createElement("span");
  creationDateTime.classList.add("creation-date-time");
  creationDateTime.textContent = `Created on: ${note.creation_date} at ${note.creation_time}`;
  return creationDateTime;
}

function createUpdatedDateTimeElement(note) {
  const updatedDateTime = document.createElement("span");
  updatedDateTime.classList.add("updated-date-time");
  updatedDateTime.textContent = `Updated on: ${note.updated_date} at ${note.updated_time}`;
  return updatedDateTime;
}

function createIconContainer() {
  const iconContainer = document.createElement("div");
  iconContainer.style.display = "flex";
  iconContainer.style.justifyContent = "space-between";
  iconContainer.style.alignItems = "center";
  iconContainer.style.marginTop = "8px";
  return iconContainer;
}

function createDeleteIcon(note) {
  const deleteIcon = document.createElement("i");
  deleteIcon.className = `fa-solid fa-trash delete-icon-${note.note_id}`;
  deleteIcon.style.cursor = "pointer";
  deleteIcon.title = "Delete note";
  deleteIcon.style.color = "red";
  deleteIcon.onclick = function () {
    console.log("Delete action clicked");
    deleteNote(note.note_id);

    // Create spinner next to this specific delete icon
    createSpinner(`.delete-icon-${note.note_id}`, 15, "right", 3);
  };
  return deleteIcon;
}

function createEditIcon(note) {
  const editIcon = document.createElement("i");
  editIcon.className = `fa-solid fa-pen edit-icon-${note.note_id}`;
  editIcon.style.cursor = "pointer";
  editIcon.title = "Edit note";
  editIcon.classList.add(note.note_id);
  editIcon.onclick = function () {
    handleEditClick(note, editIcon.parentElement);
  };
  return editIcon;
}

function handleEditClick(note, iconContainer) {
  console.log("Edit action clicked for note ID: ", note.note_id);

  // Hide the edit icon when editing starts
  const editIcon = iconContainer.querySelector(
    `.fa-pen.edit-icon-${note.note_id}`
  );
  editIcon.style.display = "none";

  const noteTextElement = document.querySelector(`.note-text.${note.note_id}`);
  const noteTextToEdit = noteTextElement.innerHTML.replace(/<br>/g, "\n");

  // Replace the p element with a textarea
  const textarea = document.createElement("textarea");
  textarea.className = `${note.note_id} textarea-editable`;
  textarea.value = noteTextToEdit;
  textarea.style.width = "100%";
  textarea.style.padding = "0.5rem";
  noteTextElement.replaceWith(textarea);

  // Create and add buttons
  const confirmButton = createButton(
    `fa-solid fa-circle-check ${note.note_id}`,
    "Confirm changes",
    "green",
    () => {
      if (noteTextToEdit === textarea.value) {
        revertToParagraph(note.note_id, noteTextToEdit, iconContainer);
        return;
      }
      updateNote(note.note_id, textarea.value);
      fetchNotes();
    }
  );

  const discardButton = createButton(
    "fa-solid fa-circle-xmark",
    "Discard changes",
    "red",
    () => {
      revertToParagraph(note.note_id, noteTextToEdit, iconContainer);
    }
  );

  const pinButton = createButton(
    `fa-solid fa-thumbtack ${note.note_id}`,
    "Pin note",
    "blue",
    () => {
      createSpinner(`.fa-thumbtack.${note.note_id}`, 15, "right", 3);
      if (note.is_pinned === 1) {
        updateNote(note.note_id, textarea.value, false);
      } else {
        updateNote(note.note_id, textarea.value, true);
      }
      fetchNotes();
    }
  );

  iconContainer.appendChild(pinButton);
  iconContainer.appendChild(discardButton);
  iconContainer.appendChild(confirmButton);
}

function createButton(iconClass, title, color, onClickHandler) {
  const button = document.createElement("i");
  button.className = iconClass;
  button.style.cursor = "pointer";
  button.title = title;
  button.style.color = color;
  button.onclick = onClickHandler;
  return button;
}

function revertToParagraph(noteId, noteTextToEdit, iconContainer) {
  // Show the edit icon again when editing is discarded or confirmed
  const editIcon = iconContainer.querySelector(`.fa-pen`);
  if (editIcon) {
    editIcon.style.display = "inline-block"; // Ensure the display matches initial style
  }

  const textarea = document.querySelector(`.${noteId}.textarea-editable`);
  if (!textarea) {
    console.error("Textarea for editing not found");
    return;
  }

  // Create a new p element to replace the textarea
  const newNoteTextElement = document.createElement("p");
  newNoteTextElement.className = `note-text ${noteId}`;
  newNoteTextElement.innerHTML = noteTextToEdit.replace(/\n/g, "<br>");
  textarea.replaceWith(newNoteTextElement);

  // Remove confirm, discard, and pin buttons
  const confirmButton = iconContainer.querySelector(".fa-circle-check");
  const discardButton = iconContainer.querySelector(".fa-circle-xmark");
  const pinButton = iconContainer.querySelector(".fa-thumbtack");

  confirmButton?.remove();
  discardButton?.remove();
  pinButton?.remove();
}

fetchNotes();

const isTextareaOnlySpaces = function () {
  const textareaValueToCheck = document.getElementById("noteInput").value;
  return (
    textareaValueToCheck.trim().length === 0 && textareaValueToCheck.length > 0
  );
};

const noteInput = document.getElementById("noteInput");
const priorityNoteCheckbox = document.getElementById("priorityNoteCheckbox");
const noteSendButton = document.querySelector(".sendNote");
noteSendButton.addEventListener("click", function () {
  if (isTextareaOnlySpaces()) {
    console.log("Sending empty note");
    createSpinner(".sendNote", 15, "right", 3);
    noteInput.value = "(empty)";
    sendNote();
  } else if (noteInput.value === "") {
    console.log(document.querySelector(".sendNote"));
    createErrorIcon(".sendNote", "Note cannot be empty", true);
    console.log("Note cannot be empty");
    return;
  } else {
    console.log("Sending note: ", noteInput.value);
    createSpinner(".sendNote", 15, "right", 3);

    sendNote();
  }
  // Reset input field
  noteInput.value = "";
});

function sendNote() {
  const noteData = {
    note_text: noteInput.value,
    creation_date: new Date().toLocaleDateString("en-GB"), // Current date in DD/MM/YYYY
    is_pinned: priorityNoteCheckbox.checked ? 1 : 0, // 1 if checked, 0 if not
  };

  fetch(
    "https://eopcsfkmlwkil4fzaqz6u4nqam0unwxc.lambda-url.eu-west-2.on.aws/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(noteData),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      fetchNotes(); // Refetch notes to update the list after adding a new note
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function deleteNote(noteId) {
  console.log("Delete note function called with note ID: ", noteId);
  fetch(
    `https://eopcsfkmlwkil4fzaqz6u4nqam0unwxc.lambda-url.eu-west-2.on.aws/?noteId=${noteId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("Delete successful:", data);
      fetchNotes(); // Refetch notes to update the list after deletion
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function updateNote(noteId, updatedText, toPin = false) {
  console.log("Updating note with ID: ", noteId);
  const updatedNoteData = {
    note_text: updatedText,
    is_pinned: toPin ? 1 : 0,
    updated_date: new Date().toLocaleDateString("en-GB"),
    updated_time: new Date().toLocaleTimeString("en-GB", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
  fetch(
    `https://eopcsfkmlwkil4fzaqz6u4nqam0unwxc.lambda-url.eu-west-2.on.aws/?noteId=${noteId}`, // Replace with your Lambda function URL
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedNoteData),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("Update successful:", data);
      fetchNotes(); // Refetch notes to update the list after updating
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

const createErrorIcon = (elementToAttach, errorText, centered = false) => {
  // Remove existing error icon and text if they exist
  const existingError = document.querySelector(".error-icon-text-container");
  if (existingError) {
    existingError.remove();
  }

  // Create the container div
  const errorContainer = document.createElement("div");
  errorContainer.className = "error-icon-text-container";
  errorContainer.style.display = "flex";
  errorContainer.style.alignItems = "center";
  errorContainer.style.gap = "10px";
  errorContainer.style.color = "red"; // Sets the text color same as the icon
  errorContainer.style.opacity = "0"; // Start with low opacity
  errorContainer.style.filter = "blur(10px)"; // Start with blur
  errorContainer.style.transition = "opacity 0.8s, filter 0.8s"; // Transition effect

  // Create the error icon
  const errorIcon = document.createElement("i");
  errorIcon.className = "fa-solid fa-circle-exclamation";

  // Create the error text element
  const errorTextElement = document.createElement("span");
  errorTextElement.textContent = errorText;
  errorTextElement.style.opacity = "0.6";
  errorTextElement.style.fontWeight = "600";

  // Append the icon and text to the container
  errorContainer.appendChild(errorIcon);
  errorContainer.appendChild(errorTextElement);

  // Append the error container to the body to calculate its dimensions
  document.body.appendChild(errorContainer);

  // Transition to full opacity and no blur after appending
  setTimeout(() => {
    errorContainer.style.opacity = "1";
    errorContainer.style.filter = "blur(0)";
  }, 0);

  const elementToAttachTo = document.querySelector(elementToAttach);
  const elementRect = elementToAttachTo.getBoundingClientRect();

  // Setting the position of the error container
  errorContainer.style.position = "absolute";
  errorContainer.style.left = `${elementRect.right + 20}px`; // Adding x pixels to the right edge

  if (centered) {
    // Align the vertical center of the error container with the vertical center of the element
    const elementCenterY = elementRect.top + elementRect.height / 2;
    const containerHeight = errorContainer.offsetHeight;
    const containerTop = elementCenterY - containerHeight / 2;
    errorContainer.style.top = `${containerTop}px`;
  } else {
    // Aligning top edge
    errorContainer.style.top = `${elementRect.top}px`;
  }

  setTimeout(() => {
    errorContainer.style.animationName = "horizontal-shaking";
    errorContainer.style.animationDuration = "0.5s";
    errorContainer.style.animationIterationCount = "1";
  }, 400);

  setTimeout(() => {
    // Smoothly fade out opacity and then remove the error container
    errorContainer.style.opacity = "0";
    errorContainer.style.filter = "blur(10px)";
    setTimeout(() => {
      errorContainer.remove();
    }, 800); // Match the transition duration
  }, 2000);
};

const createSpinner = (
  elementToAttach,
  spinnerSize,
  side = "right",
  bladeWidth = 2
) => {
  // Remove existing spinner if it exists
  const existingSpinner = document.querySelector(".ispinner");
  if (existingSpinner) {
    existingSpinner.remove();
  }

  // Create spinner container
  const spinner = document.createElement("div");
  spinner.className = "ispinner";
  spinner.style.width = `${spinnerSize}px`;
  spinner.style.height = `${spinnerSize}px`;

  // Calculate blade height and position
  const bladeHeight = spinnerSize / 2;
  const bladePosition = spinnerSize / 2 - bladeWidth / 2;

  // Add spinner blades
  for (let i = 0; i < 8; i++) {
    const blade = document.createElement("div");
    blade.className = "ispinner-blade";
    blade.style.width = `${bladeWidth}px`;
    blade.style.height = `${bladeHeight}px`;
    blade.style.top = `${bladePosition}px`;
    blade.style.left = `${bladePosition}px`;
    blade.style.borderRadius = `${bladeWidth / 2}px`;
    spinner.appendChild(blade);
  }

  // Append spinner to the body
  document.body.appendChild(spinner);

  // Positioning the spinner
  const elementToAttachTo = document.querySelector(elementToAttach);
  const elementRect = elementToAttachTo.getBoundingClientRect();

  spinner.style.position = "absolute";
  spinner.style.zIndex = 1000;

  if (side === "right") {
    spinner.style.left = `${elementRect.right + 10}px`;
  } else if (side === "left") {
    spinner.style.left = `${elementRect.left - spinner.offsetWidth - 10}px`;
  }

  spinner.style.top = `${
    elementRect.top + elementRect.height / 2 - spinner.offsetHeight / 2
  }px`;
};

const removeSpinner = () => {
  const spinner = document.querySelector(".ispinner");
  if (spinner) {
    spinner.remove();
  }
};
