import {
  createSpinner,
  createSpinnerAsElement,
  removeSpinner,
} from "../assets/functions/spinner.js";

document.querySelector(".inputfile").addEventListener("change", (event) => {
  const files = event.target.files;
  const fileList = document.querySelector(".selected-files-text");
  console.log(fileList);
  fileList.innerHTML = "";
  for (let i = 0; i < files.length; i++) {
    fileList.innerHTML += `<li>${files[i].name}</li>`;
  }
});

document.querySelector(".upload-btn").addEventListener("click", () => {
  // Get the selected file
  const files = document.querySelector(".inputfile").files;
  const fileList = document.querySelector(".selected-files-text");
  console.log(fileList);
  fileList.innerHTML = "";
  for (let i = 0; i < files.length; i++) {
    fileList.innerHTML += `<li>${files[i].name}</li>`;
  }

  const file = files[0];
  console.log(`Starting upload for: ${file.name}`);
  document.querySelector(".uploading-text").innerText = `Starting upload`;
  createSpinner(".uploading-text", 14, "right");

  // Create URL with query parameters
  const lambdaUrl =
    "https://jvvtcm6ogy3bybmpnxw4gwwtre0drgzl.lambda-url.eu-west-2.on.aws/";
  const queryParams = new URLSearchParams({
    file_name: file.name,
    content_type: file.type,
  });

  let startTime = Date.now(); // Start time of the upload
  let lastLoaded = 0; // Last loaded amount to calculate speed

  // Make a request to Lambda function
  fetch(`${lambdaUrl}?${queryParams}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      // Upload the file to the presigned URL
      const xhr = new XMLHttpRequest();
      const abortBtn = document.querySelector(".cancel-upload-btn");
      xhr.open("PUT", data.url, true);
      xhr.setRequestHeader("Content-Type", file.type);

      // Update progress
      xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          console.log(`Uploading: ${percentage}%`); // Log the upload progress percentage
          document.querySelector(".uploading-text").innerText = `Uploading`;
          document.getElementById("progressBar").value = percentage.toString();
          document.getElementById(
            "progressPercentage"
          ).innerText = `${percentage}%`;
          const uploadCompleteIcon = document.createElement("i");
          uploadCompleteIcon.className = "fa-solid fa-circle-check";
          if (percentage === 100) {
            document.getElementById("progressPercentage").innerHTML = "";
            document
              .getElementById("progressPercentage")
              .appendChild(uploadCompleteIcon);
            document.getElementById("uploadSpeed").innerHTML = "";
            fetchFileList();
            removeSpinner();
            document.querySelector(
              ".uploading-text"
            ).innerText = `Upload complete`;
          }
          // calculate upload speed
          const currentTime = Date.now();
          const timeElapsedInSeconds = (currentTime - startTime) / 1000;
          const bytesPerSecond =
            (event.loaded - lastLoaded) / timeElapsedInSeconds;
          const speedInMbps = (bytesPerSecond / 1024 / 1024).toFixed(2);
          document.getElementById(
            "uploadSpeed"
          ).innerText = `${speedInMbps} MB/s`;

          lastLoaded = event.loaded; // Update last loaded amount
          startTime = currentTime; // Reset the start time for the next calculation
        }
      };

      abortBtn.onclick = () => {
        xhr.abort(); // This will abort the upload
        document.getElementById("progressBar").value = 0;
        document.getElementById("progressPercentage").innerText = "Aborted";
        document.getElementById("uploadSpeed").innerText = `Speed: 0.00 MB/s`;
        document.querySelector(".uploading-text").innerText = `Upload aborted`;
        removeSpinner();
        console.log("Upload aborted");
      };

      // Log when the upload is complete
      xhr.onload = function () {
        if (xhr.status === 200) {
          console.log("Upload complete"); // Log the successful upload
          document.querySelector(".progress").innerText = "Upload complete";
          fetchFileList();
        } else {
          console.error("Upload failed"); // Log the upload failure
          document.querySelector(".progress").innerText = "Upload failed";
        }
      };

      xhr.onerror = function () {
        console.error("Upload error"); // Log the upload error
        document.querySelector(".progress").innerText = "Upload error";
      };

      xhr.send(file);
    })
    .catch((error) => console.error("Error:", error));
});

// on DOMContentLoaded
document.addEventListener("DOMContentLoaded", async function () {
  createSpinner(".files-heading", 24, "right");
});

// Function to calculate and display upload speed
function calculateSpeed(loaded, startTime, lastLoaded) {
  const currentTime = Date.now();
  const timeElapsedInSeconds = (currentTime - startTime) / 1000;
  const bytesPerSecond = (loaded - lastLoaded) / timeElapsedInSeconds;
  const speedInKbps = (bytesPerSecond / 1024).toFixed(2);

  document.getElementById(
    "uploadSpeed"
  ).innerText = `Speed: ${speedInKbps} KB/s`;

  // Reset the start time for the next calculation
  startTime = currentTime;
}

// Function to fetch file list and generate HTML
function fetchFileList() {
  const lambdaUrl =
    "https://24qvw7hqnnxazjuc5ahawcb43a0qdzwp.lambda-url.eu-west-2.on.aws/";
  fetch(lambdaUrl)
    .then((response) => response.json())
    .then((files) => {
      console.log(files);
      removeSpinner();
      const fileList = document.getElementById("file-list");
      fileList.innerHTML = ""; // Clear existing list items if any

      if (files.length === 0) {
        const noFilesMessage = document.createElement("p");
        noFilesMessage.innerText = "No files uploaded";
        noFilesMessage.classList.add("no-files-message");
        fileList.appendChild(noFilesMessage);
      }

      // Iterate over the files and make an element for each file with a download and delete icon/button
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Create the container for each file
        const fileContainer = document.createElement("div");
        fileContainer.className = "file-to-download-container";

        // Create the download link with the FontAwesome icon
        const downloadLink = document.createElement("a");
        downloadLink.className = "file-download-link";
        downloadLink.href = file.DownloadUrl;
        downloadLink.download = file.Key;
        downloadLink.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1.2rem" height="1.2rem" viewBox="0 0 24 24"><path fill="none" stroke="#075692" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0m5 0l4 4m0-8v8m4-4l-4 4"/></svg>`;

        // Create a span for the file name
        const fileNameSpan = document.createElement("span");
        fileNameSpan.textContent = file.Key;

        // Create the delete icon
        const deleteIcon = document.createElement("a");
        const fileKeyNoSpaces = file.Key.replaceAll(" ", "-");
        deleteIcon.className = `delete-icon delete-icon-${i}`;
        deleteIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1.2rem" height="1.2rem" viewBox="0 0 24 24"><path fill="none" stroke="#a62626" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3m-5 5l4 4m0-4l-4 4"/></svg>`;
        deleteIcon.onclick = () => {
          createSpinner(`.delete-icon-${i}`, 15, "right");
          deleteFile(file.Key);
        };

        // Append elements to the container
        fileContainer.appendChild(downloadLink);
        fileContainer.appendChild(fileNameSpan);
        fileContainer.appendChild(deleteIcon);

        // Append the container to the file list
        fileList.appendChild(fileContainer);
      }
    })
    .catch((error) => console.error("Error:", error));
}

// Call the function to fetch and display the file list
fetchFileList();

function deleteFile(fileName) {
  const lambdaDeleteUrl =
    "https://igfzklwuqn5kwxn64icdmbekye0hndew.lambda-url.eu-west-2.on.aws/";
  const queryParams = new URLSearchParams({ file_name: fileName });

  fetch(`${lambdaDeleteUrl}?${queryParams}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data.message); // Log the successful deletion message
      fetchFileList(); // Refresh the file list
    })
    .catch((error) => console.error("Error:", error));
}
