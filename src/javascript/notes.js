const pinnedNotesContainer = document.getElementById("pinned-notes-container");
const regularNotesContainer = document.getElementById(
  "regular-notes-container"
);

// for (let i = 0; i < 6; i++) {
//   const note = document.createElement("div");
//   note.classList.add("note");
//   pinnedNotesContainer.appendChild(note);
// }

// for (let i = 0; i < 6; i++) {
//   const note = document.createElement("div");
//   note.classList.add("note");
//   regularNotesContainer.appendChild(note);
// }

const addNoteButton = document.querySelector(".add-note-button");
const addNoteModal = document.querySelector(".modal-new-note");
const closeModalIcon = document.querySelector(".close-new-note-modal-icon");
addNoteButton.addEventListener("click", function () {
  addNoteModal.showModal();
});

closeModalIcon.addEventListener("click", function () {
  addNoteModal.close();
});

async function fetchNotes() {
  try {
    const response = await fetch(
      `https://eopcsfkmlwkil4fzaqz6u4nqam0unwxc.lambda-url.eu-west-2.on.aws/`
    );
    const data = await response.json();
    if (data.notes.length === 0) {
    } else {
      return data.notes;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const noteData = await fetchNotes();
  parseNoteData(noteData);
});

function parseNoteData(noteData) {
  noteData.forEach((element) => {
    if (element.is_pinned === 1) {
      const pinnedNote = document.createElement("div");
      pinnedNote.classList.add("note");
      pinnedNote.classList.add("pinned-note");
      pinnedNote.innerHTML = `<div class="note-text">${element.note_text}</div>`;
      pinnedNotesContainer.appendChild(pinnedNote);
    } else {
      const regularNote = document.createElement("div");
      regularNote.classList.add("note");
      regularNote.classList.add("regular-note");
      regularNote.innerHTML = `<div class="note-text">${element.note_text}</div>`;
      regularNotesContainer.appendChild(regularNote);
    }
  });
}
