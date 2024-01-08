async function fetchNotes() {
  try {
    const response = await fetch(
      `https://eopcsfkmlwkil4fzaqz6u4nqam0unwxc.lambda-url.eu-west-2.on.aws/`
    );
    const data = await response.json();
    // Handle the case where no notes are found or handle the list of note file names
    if (data.notes.length === 0) {
      console.log("No notes found");
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

    const creationDate = document.createElement("span");
    creationDate.textContent = `Created on: ${note.creation_date}`;

    // Append the individual elements to the note element
    noteElement.appendChild(noteText);
    noteElement.appendChild(creationDate);

    // Create delete button for each note
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "🗑️"; // Bin emoji
    deleteButton.style.display = "block"; // Make it display as a block element
    deleteButton.style.cursor = "pointer"; // Change cursor to pointer on hover
    deleteButton.style.border = "none"; // Remove border
    deleteButton.onclick = function () {
      console.log("Delete button clicked");
      console.log(note.note_id); // Log the note ID to the console
      deleteNote(note.note_id);
    }; // Add click event to delete note

    // Append delete button to the note element
    noteElement.appendChild(deleteButton);

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
