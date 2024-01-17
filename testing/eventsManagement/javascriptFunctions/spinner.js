export const createSpinner = (elementToAttach, spinnerSize, side = "right") => {
  // Remove existing spinner if it exists
  removeSpinner();

  // New spinner element
  const spinner = document.createElement("div");
  spinner.className = "spinner";
  spinner.style.position = "absolute";
  spinner.style.zIndex = "9999"; // High z-index to ensure visibility
  spinner.style.fontSize = `${spinnerSize}px`; // Spinner size
  spinner.innerHTML = `
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
    `.trim();

  // Initially append the spinner to the body to measure its dimensions
  document.body.appendChild(spinner);

  // Get the target element
  const element = document.querySelector(elementToAttach);
  if (!element) {
    console.error(`Element to attach to (${elementToAttach}) not found.`);
    return;
  }

  // Calculate position
  const rect = element.getBoundingClientRect();
  const spinnerRect = spinner.getBoundingClientRect();

  // Set top position to align centers
  const topPosition = rect.top + rect.height / 2 - spinnerRect.height / 2;
  spinner.style.top = `${topPosition}px`;

  // Set left or right position
  if (side === "right") {
    spinner.style.left = `${rect.right + 10}px`; // 10px offset from the right side
  } else {
    spinner.style.left = `${rect.left - spinnerRect.width - 10}px`; // 10px offset from the left side
  }
};

export const createSpinnerAsElement = function (
  elementToSelector,
  spinnerSize,
  leftMargin = "1rem",
  rightMargin = "1rem"
) {
  // Select the parent element to attach the spinner to
  const parentElement = document.querySelector(elementToSelector);
  if (!parentElement) {
    console.error(`Parent element (${elementToSelector}) not found.`);
    return;
  }

  // Remove existing spinner if it exists within the parent element
  const existingSpinner = parentElement.querySelector(".spinner");
  if (existingSpinner) {
    existingSpinner.remove();
  }

  // New spinner element
  const spinner = document.createElement("div");
  spinner.className = "spinner";
  spinner.style.fontSize = `${spinnerSize}px`; // Spinner size
  spinner.innerHTML = `
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
    `.trim();

  // Set margins from parameters
  spinner.style.marginLeft = leftMargin;
  spinner.style.marginRight = rightMargin;

  // Append spinner to the parent element
  parentElement.appendChild(spinner);
};

export const removeSpinner = () => {
  // Select all spinner elements
  const spinners = document.querySelectorAll(".spinner");
  // Loop through all spinner elements and remove them
  spinners.forEach((spinner) => {
    spinner.parentNode.removeChild(spinner);
  });
};

// Function to set spinner size for a specific spinner
export const setSpinnerSize = (spinner, size) => {
  if (spinner) {
    spinner.style.setProperty("--spinner-size", `${size}px`);
  }
};
