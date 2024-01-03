import { createWysimark } from "@wysimark/standalone";

// Get the Markdown content from the element
const markdownContent = document.getElementById("markdown-content").textContent;

// Convert the Markdown content to HTML
const htmlContent = marked.parse(markdownContent);

// Set the converted HTML content back into the element
document.getElementById("markdown-content").innerHTML = htmlContent;

async function fetchNotes() {
  try {
    const response = await fetch(
      `https://eopcsfkmlwkil4fzaqz6u4nqam0unwxc.lambda-url.eu-west-2.on.aws/`
    );

    const data = await response.json();

    // Handle the case where no notes are found or handle the list of note file names
    if (data.length === 0) {
      console.log("No notes found");
    } else {
      console.log(data);
    }
  } catch (error) {
    console.error("Error:", error);
    // Handle errors, possibly with retry logic or user notification
  }
}

fetchNotes();

/**
 * Get the editor container element
 */
const container = document.getElementById("editor-container");

/**
 * Create the Wysimark component
 */
const wysimark = createWysimark(container, {
  initialMarkdown: "# Hello World",
});

wysimark.on("change", (markdown) => {
  console.log(markdown);
});
