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

YOU MUST OUTPUT ONLY THE RAW JSON, NO CODEBLOCKS, NO COMMENTS OR ANYTHING ELSE.
Instructions:
- Extract relevant info (morning: 7:00, afternoon: 15:00, evening: 19:00, night: 23:00)
- Use 24-hour clock
- Assume current day if no date given
- Date in format DD/MM/YYYY
- Assume all-day event if no time given (startTime: "allDay", endTime: "allDay")
- Never omit any JSON keys
- Assume 1-hour duration if no end time
- the Name key should never contain any dates or times
- Capitalize any names in the fields 
- You may repeat info in multiple keys, if you need to.
- If location not given, you can use "None" exactly
- Capitalize first letters in "name" and "location"
- For the "location", use comedic slang if not provided, like "gaff"`;

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
      max_tokens: 128,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

const finishingOrder = [];

const fireworksModelsStrings = [
  "accounts/fireworks/models/firefunction-v1",
  "accounts/fireworks/models/mixtral-8x7b-instruct",
  "accounts/fireworks/models/mixtral-8x22b-instruct-preview",
  "accounts/fireworks/models/llama-v2-70b-chat",
  "accounts/fireworks/models/dbrx-instruct",
  "accounts/fireworks/models/llama-v2-13b-chat",
  "accounts/fireworks/models/mixtral-8x7b-instruct-hf",
  "accounts/fireworks/models/mythomax-l2-13b",
  "accounts/fireworks/models/nous-hermes-2-mixtral-8x7b-dpo-fp8",
  "accounts/fireworks/models/qwen-14b-chat",
  "accounts/fireworks/models/qwen-72b-chat",
  "accounts/fireworks/models/yi-34b-200k-capybara",
  "accounts/fireworks/models/yi-34b-chat",
];

const togetherModelStrings = [
  "Austism/chronos-hermes-13b",
  "Gryphe/MythoMax-L2-13b",
  "NousResearch/Nous-Capybara-7B-V1p9",
  "NousResearch/Nous-Hermes-2-Mistral-7B-DPO",
  "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO",
  "NousResearch/Nous-Hermes-2-Mixtral-8x7B-SFT",
  "NousResearch/Nous-Hermes-2-Yi-34B",
  "NousResearch/Nous-Hermes-Llama2-13b",
  "NousResearch/Nous-Hermes-llama-2-7b",
  "Qwen/Qwen1.5-14B-Chat",
  "Qwen/Qwen1.5-32B-Chat",
  "Qwen/Qwen1.5-72B-Chat",
  "Undi95/ReMM-SLERP-L2-13B",
  "WizardLM/WizardLM-13B-V1.2",
  "codellama/CodeLlama-13b-Instruct-hf",
  "codellama/CodeLlama-34b-Instruct-hf",
  "codellama/CodeLlama-70b-Instruct-hf",
  "deepseek-ai/deepseek-llm-67b-chat",
  "garage-bAInd/Platypus2-70B-instruct",
  "lmsys/vicuna-13b-v1.5",
  "meta-llama/Llama-2-13b-chat-hf",
  "meta-llama/Llama-2-70b-chat-hf",
  "microsoft/WizardLM-2-8x22B",
  "mistralai/Mixtral-8x7B-Instruct-v0.1",
  "togethercomputer/LLaMA-2-7B-32K-Instruct",
  "togethercomputer/guanaco-13b",
  "togethercomputer/guanaco-33b",
  "togethercomputer/guanaco-65b",
  "togethercomputer/llama-2-13b-chat",
  "togethercomputer/llama-2-70b-chat",
  "togethercomputer/mpt-30b-chat",
  "zero-one-ai/Yi-34B-Chat",
  "OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5",
  "lmsys/vicuna-13b-v1.3",
  "lmsys/vicuna-13b-v1.5-16k",
  "meta-llama/Llama-2-13b-hf",
  "togethercomputer/GPT-NeoXT-Chat-Base-20B",
  "togethercomputer/Koala-13B",
];

submitButton.addEventListener("click", async () => {
  const userPrompt = promptInput.value;

  for (let i = 0; i < fireworksModelsStrings.length; i++) {
    const modelString = fireworksModelsStrings[i];
    sendToModel(
      userPrompt,
      "https://api.fireworks.ai/inference/v1/chat/completions",
      0.5,
      "YRqCJ77HbMkgVsArvHqD2G6nyqoJFqDlq640lXSFtN8SvcKG",
      modelString
    )
      .then((mixtral) => {
        const fullModelString = fireworksModelsStrings[i];
        const justModelName = fullModelString.split("/")[3];
        console.log(justModelName);
        console.log(mixtral);
        finishingOrder.push(fireworksModelsStrings[i]);
        // add the model output to the grid of ouputs, make a new element of the model title, and the actual output and add them to a new div then add that to the grid
        const modelOutput = document.createElement("div");

        const modelTitle = document.createElement("p");
        modelTitle.classList.add("model-output-title");
        modelTitle.innerText = justModelName;
        modelOutput.appendChild(modelTitle);

        const modelOutputText = document.createElement("p");
        modelOutputText.classList.add("model-output-text");
        modelOutputText.innerText = mixtral;
        modelOutput.appendChild(modelOutputText);

        modelOutputGrid.appendChild(modelOutput);
      })
      .catch((error) => {
        console.error("Error fetching Mixtral:", error);
      });
  }

  // for (let i = 0; i < togetherModelStrings.length; i++) {
  //   setTimeout(() => {
  //     const modelString = togetherModelStrings[i];
  //     sendToModel(
  //       userPrompt,
  //       "https://api.together.xyz/v1/chat/completions",
  //       0.5,
  //       "cf2be16d4bcc109c94d53eb228a7033bbd62861239b1ce57e55993756ca82c38",
  //       modelString
  //     )
  //       .then((together) => {
  //         const fullModelString = togetherModelStrings[i];
  //         const justModelName = fullModelString.split("/")[1];
  //         console.log(justModelName);
  //         console.log(together);
  //         finishingOrder.push(togetherModelStrings[i]);
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching Together:", error);
  //       });
  //   }, i * 1500);
  // }
});
