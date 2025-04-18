// using html-docx.js to download a word document

const cardsContainer = document.getElementById("cards-container");
const addBtn = document.getElementById("add-btn");
const resetBtn = document.getElementById("reset-btn");

// Function to create a new card dynamically
function createCard() {
  const card = document.createElement("div");
  card.classList.add("card");
  card.style.position = "relative"; // Set .card to position: relative
  card.style.border = "1px solid #ccc"; // Optional: Add a border for better visibility
  card.style.borderRadius = "8px"; // Optional: Add rounded corners
  card.style.padding = "1rem"; // Optional: Add padding
  card.style.marginBottom = "1rem"; // Optional: Add spacing between cards

  card.innerHTML = `
        <div class="form-group">
            <label for="serial-number" class="form-label">Serial Number:</label>
            <input type="text" placeholder="Enter Serial Number" class="serial-number" />
        </div>
        <div class="form-group">
            <label for="location" class="form-label">Location:</label>
            <input type="text" placeholder="Enter Location" class="location" />
        </div>
        <div class="form-group">
            <label for="comments" class="form-label">Comments:</label>
            <textarea placeholder="Enter Comments" class="comments"></textarea>
        </div>
        <div class="photo-container" style="
             display: flex;
            justify-content: center;
            align-items: center;
            position: relative; 
            width: 280px; 
            height: 280px; 
            border: 1px solid #ccc; 
            border-radius: 4px; 
            cursor: pointer; 
            background-color: #f9f9f9;">
            <img class="photo" src="placeholder.jpg" alt="Click to upload photo" 
                 style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" />
            <input type="file" accept="image/*" class="image-input" style="display: none;" />
        </div>
        <button class="delete-btn" style="
            position: absolute; 
            bottom: 10px; 
            right: 10px; 
            background-color: red; 
            color: white; 
            border: none; 
            padding: 0.2rem .5rem; 
            border-radius: 4px; 
            cursor: pointer;">
            Delete
        </button>
    `;

  // Add functionality to display the photo
  const imageInput = card.querySelector(".image-input");
  const photoElement = card.querySelector(".photo");
  const photoContainer = card.querySelector(".photo-container");

  // Trigger the hidden file input when the photo container is clicked
  photoContainer.addEventListener("click", () => {
    imageInput.click();
  });

  imageInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        // Display the photo in the UI
        photoElement.src = event.target.result;
        photoElement.style.display = "block"; // Ensure the image is visible
        photoContainer.style.backgroundColor = "transparent"; // Remove placeholder background
      };

      reader.readAsDataURL(file); // Read the file as a Base64 string
    }
  });

  // Add functionality to delete the card
  const deleteCardBtn = card.querySelector(".delete-btn");
  deleteCardBtn.addEventListener("click", () => {
    const cards = cardsContainer.querySelectorAll(".card");
    if (cards.length > 1) {
      card.remove(); // Remove the specific card
    } else {
      alert("You must have at least one card!");
    }
  });

  return card;
}

// Ensure there is always one card when the app loads
document.addEventListener("DOMContentLoaded", () => {
  // Clear any unintended child elements in the cards container
  cardsContainer.innerHTML = "";

  if (cardsContainer.childElementCount === 0) {
    const firstCard = createCard();
    cardsContainer.appendChild(firstCard);
  }
});

// Add event listener to the "Add" button
addBtn.addEventListener("click", () => {
  const newCard = createCard();
  cardsContainer.appendChild(newCard);
});

// Add reset functionality to the "Reset" button
resetBtn.addEventListener("click", () => {
  // Clear all cards from the cards container
  cardsContainer.innerHTML = "";

  // Add a single default card
  const firstCard = createCard();
  cardsContainer.appendChild(firstCard);
});

// Add event listener to the "Download" button
const downloadBtn = document.getElementById("download-btn");

downloadBtn.addEventListener("click", () => {
  console.log("Download button clicked"); // Add this inside the event listener
  console.log("htmlDocx available:", window.htmlDocx); // Check if html-docx-js is loaded
  console.log("saveAs available:", typeof saveAs); // Check if FileSaver.js is loaded

  // Select all .card elements
  const cards = document.querySelectorAll(".card");

  // Create a container for the Word document content
  const wordContainer = document.createElement("div");
  wordContainer.style.width = "210mm"; // A4 width
  wordContainer.style.margin = "0 auto"; // Center the content
  wordContainer.style.fontFamily = "Arial, sans-serif"; // Optional: Set font

  // Group cards into pages (4 cards per page)
  let page = document.createElement("div");
  page.style.display = "grid";
  page.style.gridTemplateColumns = "1fr 1fr"; // 2 columns
  page.style.gridGap = "10mm"; // Spacing between cards
  page.style.marginBottom = "20mm"; // Space between pages

  cards.forEach((card, index) => {
    // Clone the card and remove the delete button
    const cardClone = card.cloneNode(true);
    const deleteBtn = cardClone.querySelector(".delete-btn");
    if (deleteBtn) deleteBtn.remove();

    // Add the card to the current page
    page.appendChild(cardClone);

    // If 4 cards are added, start a new page
    if ((index + 1) % 4 === 0 || index === cards.length - 1) {
      wordContainer.appendChild(page);
      page = document.createElement("div");
      page.style.display = "grid";
      page.style.gridTemplateColumns = "1fr 1fr";
      page.style.gridGap = "10mm";
      page.style.marginBottom = "20mm";
    }
  });

  console.log("Generated HTML for Word document:", wordContainer.innerHTML);

  // Convert the content to a Word document
  const html = `
    <html>
      <head>
        <style>
          body {
            width: 210mm;
            margin: 0 auto;
            font-family: Arial, sans-serif;
          }
          .card {
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 1rem;
            box-sizing: border-box;
          }
          .photo-container {
            width: 100%;
            height: 150px;
            border: 1px solid #ccc;
            border-radius: 4px;
            overflow: hidden;
          }
          .photo {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        </style>
      </head>
      <body>${wordContainer.innerHTML}</body>
    </html>
  `;

  const blob = window.htmlDocx.asBlob(html);
  saveAs(blob, "PropertyInspection.docx");
});
