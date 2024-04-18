const todayForPrompt = new Date();
const dayIndex = todayForPrompt.getDay();
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const currentDayForPrompt = daysOfWeek[dayIndex];
const currentTime = new Date();
const currentHour = currentTime.getHours();
const currentMinute = currentTime.getMinutes();
const currentTimeString = `${currentHour}:${currentMinute}`;

let today = new Date();
let day = String(today.getDate()).padStart(2, "0");
let month = String(today.getMonth() + 1).padStart(2, "0");
let year = today.getFullYear();
let joinedDate = day + "/" + month + "/" + year;

console.log(`Today is ${joinedDate}`);

const systemPrompt = `Today is ${joinedDate} (DD/MM/YYYY) and it is a ${currentDayForPrompt}. The time is ${currentTimeString}. You are an NLU to calendar converter. Output in JSON with the following keys: “name”, “startDate”, “endDate”, “startTime”, “endTime”, “location”.

Important: YOU MUST THINK STEP BY STEP, BUT ONLY FOR THE DATE, THEN ONLY AFTER GENERATE VALID JSON. Your responses should be in this format: [reasoning step by step for the correct date], [the actual json]. Instructions: - Extract relevant info (morning: 7:00, afternoon: 15:00, evening: 19:00, night: 23:00) - Use 24-hour clock - Assume current day if no date given - Date in format DD/MM/YYYY - Assume all-day event if no time given (startTime: \"allDay\", endTime: \"allDay\") - Never omit any JSON keys - Assume 1-hour duration if no end time - the Name key should never contain any dates or times - Capitalize any names in the fields  - You may repeat info in multiple keys, if you need to. - If location not given, you can use \"None\" exactly - Capitalize first letters in \"name\" and \"location\" - When the user writes next year or in some amount of years, you should add to the year - ALWAYS count days from the current day - if the user writes \"next...\" always use the current day as a reference`;

console.log(systemPrompt);

const promptInput = document.getElementById("input");
const submitButton = document.getElementById("submit");
const modelOutputGrid = document.querySelector(".model-output-grid");

async function sendToModel(userPrompt, baseUrl, temp, apiKey, modelString) {
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelString,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: temp,
      max_tokens: 512,
    }),
  });

  const data = await response.json();
  const newData = data.choices[0].message.content;
  const regex = /\{[\s\S]*\}/;
  const match = newData.match(regex);

  if (match) {
    const jsonString = match[0];
    const jsonObject = JSON.parse(jsonString);
    return jsonObject;
  } else {
    console.log("No JSON found");
    return data.choices[0].message.content;
  }
}

const finishingOrder = [];

const fireworksModelsStrings = [
  "accounts/fireworks/models/nous-hermes-2-mixtral-8x7b-dpo-fp8",
  "accounts/fireworks/models/firefunction-v1",
  "accounts/fireworks/models/mixtral-8x7b-instruct",
  "accounts/fireworks/models/mixtral-8x22b-instruct-preview",
  "accounts/fireworks/models/llama-v2-70b-chat",
  "accounts/fireworks/models/mixtral-8x7b-instruct-hf",
  "accounts/fireworks/models/qwen-72b-chat",
  "accounts/fireworks/models/yi-34b-200k-capybara",
  "accounts/fireworks/models/yi-34b-chat",
];

const togetherModelStrings = [
  "Austism/chronos-hermes-13b",
  "Gryphe/MythoMax-L2-13b",
  "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO",
  "NousResearch/Nous-Hermes-2-Mixtral-8x7B-SFT",
  "NousResearch/Nous-Hermes-2-Yi-34B",
  "Qwen/Qwen1.5-32B-Chat",
  "Qwen/Qwen1.5-72B-Chat",
  "Undi95/ReMM-SLERP-L2-13B",
  "WizardLM/WizardLM-13B-V1.2",
  "garage-bAInd/Platypus2-70B-instruct",
  "lmsys/vicuna-13b-v1.5",
  "meta-llama/Llama-2-70b-chat-hf",
  "microsoft/WizardLM-2-8x22B",
  "mistralai/Mixtral-8x7B-Instruct-v0.1",
  "togethercomputer/llama-2-70b-chat",
  "zero-one-ai/Yi-34B-Chat",
];

const modelString = fireworksModelsStrings[0];
console.log(modelString);
sendToModel(
  "bridal shower nexth thursday",
  "https://api.fireworks.ai/inference/v1/chat/completions",
  0.7,
  "YRqCJ77HbMkgVsArvHqD2G6nyqoJFqDlq640lXSFtN8SvcKG",
  modelString
)
  .then((mixtral) => {
    const fullModelString = fireworksModelsStrings[0];
    const justModelName = fullModelString.split("/")[3];
    console.log(justModelName);
    console.log(mixtral);
  })
  .catch((error) => {
    console.error("Error fetching Mixtral:", error);
  });

sendToModel(
  "bridal shower nexth thursday",
  "https://api.openai.com/v1/chat/completions",
  0.7,
  localStorage.getItem("openAIKey"),
  "gpt-3.5-turbo-0125"
)
  .then((mixtral) => {
    console.log("OpenAI response:");
    console.log(mixtral);
  })
  .catch((error) => {
    console.error("Error fetching OpenAI response:", error);
  });

submitButton.addEventListener("click", async () => {
  const userPrompt = promptInput.value;

  for (let i = 0; i < 3; i++) {
    const modelString = fireworksModelsStrings[i];
    sendToModel(
      userPrompt,
      "https://api.fireworks.ai/inference/v1/chat/completions",
      0.7,
      "YRqCJ77HbMkgVsArvHqD2G6nyqoJFqDlq640lXSFtN8SvcKG",
      modelString
    )
      .then((mixtral) => {
        const fullModelString = fireworksModelsStrings[i];
        const justModelName = fullModelString.split("/")[3];
        console.log(justModelName);
        console.log(mixtral);
        finishingOrder.push(fireworksModelsStrings[i]);
        const modelOutput = document.createElement("div");
        modelOutput.classList.add("model-output-container-fireworks");

        const modelTitle = document.createElement("p");
        modelTitle.classList.add("model-output-title");
        modelTitle.innerText = justModelName;
        modelOutput.appendChild(modelTitle);

        const modelOutputText = document.createElement("p");
        modelOutputText.classList.add("model-output-text");
        try {
          const parsedOutput = mixtral;
          const name = parsedOutput.name;
          console.log(parsedOutput);
          const startDate = parsedOutput.startDate;
          const endDate = parsedOutput.endDate;
          const startTime = parsedOutput.startTime;
          const endTime = parsedOutput.endTime;
          const location = parsedOutput.location;

          modelOutputText.innerText = `${name}\n${startDate}\n${endDate}\n${startTime}\n${endTime}\n${location}`;

          modelOutput.appendChild(modelOutputText);
          modelOutputGrid.appendChild(modelOutput);
        } catch (error) {
          console.error("Error parsing output:", error);
        }
      })
      .catch((error) => {
        console.error("Error fetching Mixtral:", error);
      });
  }

  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const modelString = togetherModelStrings[i];
      sendToModel(
        userPrompt,
        "https://api.together.xyz/v1/chat/completions",
        0.5,
        "cf2be16d4bcc109c94d53eb228a7033bbd62861239b1ce57e55993756ca82c38",
        modelString
      )
        .then((mixtral) => {
          const fullModelString = togetherModelStrings[i];
          const justModelName = fullModelString.split("/")[1];
          console.log(justModelName);
          console.log(mixtral);
          finishingOrder.push(togetherModelStrings[i]);
          const modelOutput = document.createElement("div");
          modelOutput.classList.add("model-output-container-together");

          const modelTitle = document.createElement("p");
          modelTitle.classList.add("model-output-title");
          modelTitle.innerText = justModelName;
          modelOutput.appendChild(modelTitle);

          const modelOutputText = document.createElement("p");
          modelOutputText.classList.add("model-output-text");
          try {
            const parsedOutput = mixtral;
            const name = parsedOutput.name;
            console.log(parsedOutput);
            const startDate = parsedOutput.startDate;
            const endDate = parsedOutput.endDate;
            const startTime = parsedOutput.startTime;
            const endTime = parsedOutput.endTime;
            const location = parsedOutput.location;

            modelOutputText.innerText = `${name}\n${startDate}\n${endDate}\n${startTime}\n${endTime}\n${location}`;

            modelOutput.appendChild(modelOutputText);
            modelOutputGrid.appendChild(modelOutput);
          } catch (error) {
            console.error("Error parsing output:", error);
          }
        })
        .catch((error) => {
          console.error("Error fetching Mixtral:", error);
        });
    }, 2000 + i * 2000);
  }
});
