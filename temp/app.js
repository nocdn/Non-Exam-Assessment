let serverData = "";
receivedText = document.querySelector(".data-from-server");

getDataButton = document
  .querySelector(".get-data")
  .addEventListener("click", function () {
    fetch("http://localhost:8080/readFile", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        serverData = data.textData;
        console.log(serverData);
        receivedText.innerHTML = serverData;
      });
  });
