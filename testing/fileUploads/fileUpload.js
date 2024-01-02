import { Amplify } from "aws-amplify";
import amplifyconfig from "./src/amplifyconfiguration.json";
Amplify.configure(amplifyconfig);

const fileInput = document.querySelector(".file-input");
const uploadButton = document.querySelector(".upload-btn");
const progressText = document.querySelector(".progress");
const fileListContainer = document.querySelector(".file-list");

// Update these variables with your information
const LAMBDA_URL =
  "https://jvvtcm6ogy3bybmpnxw4gwwtre0drgzl.lambda-url.eu-west-2.on.aws/"; // Replace with your Lambda URL

document.addEventListener("DOMContentLoaded", function () {
  fetchFiles(); // List files when the page loads
});

fileInput.addEventListener("change", function (event) {
  const files = event.target.files;
  for (let file of files) {
    uploadFile(file); // Uploading files one by one
  }
});

async function uploadFile(file) {
  console.log("Starting file upload", file.name);
  progressText.textContent = `Uploading ${file.name}...`;

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(LAMBDA_URL, {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    progressText.textContent = "Upload complete!";
    fetchFiles(); // Refresh the file list
  } else {
    progressText.textContent = "Upload failed.";
  }
}

async function fetchFiles() {
  const response = await fetch(LAMBDA_URL);
  if (response.ok) {
    const files = await response.json();
    displayFiles(files);
  }
}

const BUCKET_NAME = "sharedfileuploads"; // Replace with your bucket name

function displayFiles(files) {
  fileListContainer.innerHTML = ""; // Clear existing list
  files.forEach((file) => {
    const fileLink = document.createElement("a");
    fileLink.href = `https://${BUCKET_NAME}.s3.amazonaws.com/${file}`;
    fileLink.innerText = file;
    fileLink.setAttribute("target", "_blank"); // Open in a new tab

    const listItem = document.createElement("li");
    listItem.appendChild(fileLink);
    fileListContainer.appendChild(listItem);
  });
}
