async function fetchNotes() {
  try {
    const response = await fetch(
      `https://eopcsfkmlwkil4fzaqz6u4nqam0unwxc.lambda-url.eu-west-2.on.aws/`
    );
    const data = await response.json();
    // Handle the case where no notes are found or handle the list of note file names
    if (data.notes.length === 0) {
      console.log("No notes found");
      // Clear existing notes if any
      const pinnedContainer = document.querySelector(".pinnedNotesContainer");
      const regularContainer = document.querySelector(".regularNotesContainer");
      pinnedContainer.innerHTML = "";
      regularContainer.innerHTML = "";
    } else {
      displayNotes(data.notes); // Call function to display notes
    }
  } catch (error) {
    console.error("Error:", error);
    // Handle errors, possibly with retry logic or user notification
  }
}

function displayNotes(notes) {
  const pinnedContainer = document.querySelector(".pinnedNotesContainer");
  const regularContainer = document.querySelector(".regularNotesContainer");

  // Clear existing notes if any
  pinnedContainer.innerHTML = "";
  regularContainer.innerHTML = "";

  notes.forEach((note) => {
    // Create elements for each note
    const noteElement = document.createElement("div");
    noteElement.classList.add("note");

    // You can format and style it further as needed
    const noteText = document.createElement("p");
    noteText.innerHTML = note.note_text.replace(/\n/g, "<br>");
    noteText.classList.add(note.note_id); // Add the note ID as a class to the note text element (for later use)
    noteText.classList.add("note-text");

    const creationDate = document.createElement("span");
    creationDate.textContent = `Created on: ${note.creation_date}`;

    const creationDateTime = document.createElement("span");
    creationDateTime.textContent = `Created on: ${note.creation_date} at ${note.creation_time}`;

    // Append the individual elements to the note element
    noteElement.appendChild(noteText);
    // noteElement.appendChild(creationDate);
    noteElement.appendChild(creationDateTime);

    // Create a container div for the icons
    const iconContainer = document.createElement("div");
    iconContainer.style.display = "flex";
    iconContainer.style.justifyContent = "space-between"; // Spread items far apart
    iconContainer.style.alignItems = "center"; // Align items vertically in the center
    iconContainer.style.marginTop = "8px"; // Add some margin at the top, adjust as needed

    // Create Font Awesome delete icon
    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fa-solid fa-trash"; // Set Font Awesome classes
    deleteIcon.style.cursor = "pointer"; // Change cursor on hover to indicate clickability
    deleteIcon.title = "Delete note";
    deleteIcon.style.color = "red";
    deleteIcon.onclick = function () {
      console.log("Delete action clicked");
      deleteNote(note.note_id);
    };

    // Create Font Awesome edit icon
    const editIcon = document.createElement("i");
    editIcon.className = "fa-solid fa-pen"; // Set Font Awesome classes
    editIcon.style.cursor = "pointer"; // Change cursor on hover to indicate clickability
    editIcon.title = "Edit note";
    editIcon.classList.add(note.note_id); // Add the note ID as a class to the delete icon (for later use)
    editIcon.onclick = function () {
      console.log("Edit action clicked for note ID: ", note.note_id);
      // Get the note text element by class name of the note ID
      const noteTextElementToEdit = document.querySelector(`.${note.note_id}`);
      // Get the note text from the element and set it as a placeholder for the input field
      const noteTextToEdit = noteTextElementToEdit.textContent;
      // Change the p element with the class of the note ID to a textarea field
      noteTextElementToEdit.outerHTML = `<textarea class='${note.note_id} textarea-editable'>${noteTextToEdit}</textarea>`;
      // Get the textarea element by class name of the note ID
      const noteTextAreaElementToEdit = document.querySelector(
        `.${note.note_id}`
      );

      // Style adjustments for the textarea
      noteTextAreaElementToEdit.style.width = "100%";
      noteTextAreaElementToEdit.style.padding = "0.5rem";

      // Create Confirm button for submitting updated text
      const confirmButton = document.createElement("i");
      confirmButton.className = "fa-solid fa-circle-check"; // Set Font Awesome classes
      confirmButton.style.cursor = "pointer"; // Change cursor on hover to indicate clickability
      confirmButton.title = "Confirm changes";
      confirmButton.style.color = "green";
      confirmButton.style.opacity = "1";
      confirmButton.onclick = function () {
        // check if old text is same as new text and if the same then revert back to p element
        if (noteTextToEdit === noteTextAreaElementToEdit.value) {
          noteTextAreaElementToEdit.outerHTML = `<p class='${note.note_id}'>${noteTextToEdit}</p>`;
          iconContainer.removeChild(confirmButton);
          iconContainer.removeChild(discardButton);
          return;
        } else {
          updateNote(note.note_id, noteTextAreaElementToEdit.value);
          fetchNotes(); // Refetch notes to update the list after updating
        }
      };

      // Append the confirm button to the icon container or wherever appropriate
      const discardButton = document.createElement("i");
      discardButton.className = "fa-solid fa-circle-xmark"; // Set Font Awesome classes
      discardButton.style.cursor = "pointer"; // Change cursor on hover to indicate clickability
      discardButton.style.color = "red";
      discardButton.title = "Discard changes";
      discardButton.onclick = function () {
        noteTextAreaElementToEdit.outerHTML = `<p class='${note.note_id}'>${noteTextToEdit}</p>`;
        iconContainer.removeChild(confirmButton);
        iconContainer.removeChild(discardButton);
      };
      iconContainer.appendChild(discardButton);
      iconContainer.appendChild(confirmButton);
    };

    // Append both icons to the container
    iconContainer.appendChild(deleteIcon);
    iconContainer.appendChild(editIcon);

    // Append the icon container to the note element
    noteElement.appendChild(iconContainer);

    // Check if the note is pinned and append to the corresponding container
    if (note.is_pinned === 1) {
      pinnedContainer.appendChild(noteElement);
    } else {
      regularContainer.appendChild(noteElement);
    }
  });
}

fetchNotes();

const noteInput = document.getElementById("noteInput");
const priorityNoteCheckbox = document.getElementById("priorityNoteCheckbox");
const noteSendButton = document.querySelector(".sendNote");
noteSendButton.addEventListener("click", function () {
  console.log("Send note button clicked");
  sendNote();
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

function updateNote(noteId, updatedText) {
  console.log("Updating note with ID: ", noteId);
  const updatedNoteData = {
    note_text: updatedText,
    updated_date: new Date().toLocaleDateString("en-GB"),
    updated_time: new Date().toLocaleTimeString("en-GB", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
  fetch(
    `https://eopcsfkmlwkil4fzaqz6u4nqam0unwxc.lambda-url.eu-west-2.on.aws/?noteId=${noteId}`,
    {
      // Replace with your Lambda function URL
      method: "PUT", // Assuming you're using PUT for update operations
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
