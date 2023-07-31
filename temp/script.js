const fs = require("fs");
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = 8080;

app.use(cors());

function readFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return data;
  } catch (err) {
    return err;
  }
}

function appendToFile(filePath, textToAppend) {
  try {
    fs.appendFileSync(filePath, `\n${textToAppend}`);
    console.log("[data written]\n");
  } catch (err) {
    throw err;
  }
}

app.listen(PORT, function () {
  console.log(`It's alive on http://localhost:${PORT}`);
});

app.get("/readFile", function (req, res) {
  let dataFromFile = readFile("text.txt");
  let fileContents = res.status(200).send({
    fileName: "text.txt",
    textData: dataFromFile,
  });
});
