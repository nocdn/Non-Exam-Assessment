const fetchButton = document.querySelector(".fetch-btn");
const eventList = document.querySelector(".event-list");
const inputField = document.querySelector(".group-input");

const eventsList = [];
let xmlString = null;
const fetchKeys = async function (group_id) {
  xmlString = null;
  const url = `https://shared-calendar-bucket.s3.amazonaws.com/?prefix=${group_id}/`;
  // fetch that then wait for the response, and then set the respons to the variable xml string
  const response = await fetch(url);
  xmlString = await response.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  const fetchFiles = async function (key) {
    const url = `https://shared-calendar-bucket.s3.amazonaws.com/${key}`;
    const response = await fetch(url);
    let text = await response.text();
    text = JSON.parse(text);
    eventsList.push(text);
  };

  // Extracting <Key> elements
  const keys = xmlDoc.getElementsByTagName("Key");
  for (let i = 0; i < keys.length; i++) {
    console.log(keys[i].childNodes[0].nodeValue);
    const key = keys[i].childNodes[0].nodeValue;
    fetchFiles(key);
  }
  console.log(eventsList);
};

fetchButton.addEventListener("click", function () {
  fetchKeys(inputField.value);
});

fetchKeys("1234");
