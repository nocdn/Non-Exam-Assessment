document
  .querySelector(".file-input-label")
  .addEventListener("change", (event) => {
    const fileList = document.querySelector(".selected-files-text");
    console.log(fileList);
    fileList.innerHTML = "";
    for (let i = 0; i < event.target.files.length; i++) {
      fileList.innerHTML += `<li>${event.target.files[i].name}</li>`;
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

  // Create URL with query parameters
  const lambdaUrl =
    "https://jvvtcm6ogy3bybmpnxw4gwwtre0drgzl.lambda-url.eu-west-2.on.aws/";
  const queryParams = new URLSearchParams({
    file_name: file.name,
    content_type: file.type,
  });

  let startTime = Date.now(); // Start time of the upload
  let lastLoaded = 0; // Last loaded amount to calculate speed

  // Make a request to your Lambda function
  fetch(`${lambdaUrl}?${queryParams}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      // Upload the file to the presigned URL
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", data.url, true);
      xhr.setRequestHeader("Content-Type", file.type);

      // Update progress
      xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          console.log(`Uploading: ${percentage}%`); // Log the upload progress percentage
          document.getElementById("progressBar").value = percentage.toString();
          document.getElementById(
            "progressPercentage"
          ).innerText = `${percentage}%`;
          // calculate upload speed
          const currentTime = Date.now();
          const timeElapsedInSeconds = (currentTime - startTime) / 1000;
          const bytesPerSecond =
            (event.loaded - lastLoaded) / timeElapsedInSeconds;
          const speedInMbps = (bytesPerSecond / 1024 / 1024).toFixed(2);
          document.getElementById(
            "uploadSpeed"
          ).innerText = `Speed: ${speedInMbps} MB/s`;

          lastLoaded = event.loaded; // Update last loaded amount
          startTime = currentTime; // Reset the start time for the next calculation
        }
      };

      // Log when the upload is complete
      xhr.onload = function () {
        if (xhr.status === 200) {
          console.log("Upload complete"); // Log the successful upload
          document.querySelector(".progress").innerText = "Upload complete";
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
    "https://24qvw7hqnnxazjuc5ahawcb43a0qdzwp.lambda-url.eu-west-2.on.aws/"; // Replace with your actual Lambda URL
  fetch(lambdaUrl)
    .then((response) => response.json())
    .then((files) => {
      const fileList = document.getElementById("file-list");
      fileList.innerHTML = ""; // Clear existing list items if any

      files.forEach((file) => {
        // Create the container for each file
        const fileContainer = document.createElement("div");
        fileContainer.className = "file-to-download-container";

        // Create the download link for the icon only
        const downloadLink = document.createElement("a");
        downloadLink.className = "file-download-link";
        downloadLink.href = file.DownloadUrl;
        downloadLink.download = file.Key; // This will suggest the filename to save as
        downloadLink.innerHTML = `<i class="fa-regular fa-circle-down"></i>`; // Insert icon only

        // Append the download link to the container
        fileContainer.appendChild(downloadLink);

        // Create a span element for the text to prevent it from being a link
        const fileNameSpan = document.createElement("span");
        fileNameSpan.textContent = file.Key; // Add the text

        // Append the text span to the container
        fileContainer.appendChild(fileNameSpan);

        // Append the container to the file list
        fileList.appendChild(fileContainer);
      });
    })
    .catch((error) => console.error("Error:", error));
}

// Call the function to fetch and display the file list
fetchFileList();
