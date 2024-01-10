document.querySelector(".upload-btn").addEventListener("click", () => {
  // Get the selected file
  const files = document.querySelector(".file-input").files;
  const file = files[0];
  console.log(`Starting upload for: ${file.name}`);

  // Create URL with query parameters
  const lambdaUrl =
    "https://jvvtcm6ogy3bybmpnxw4gwwtre0drgzl.lambda-url.eu-west-2.on.aws/";
  const queryParams = new URLSearchParams({
    file_name: file.name,
    content_type: file.type,
  });

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
