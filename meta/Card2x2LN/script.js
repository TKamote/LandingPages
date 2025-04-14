// Function to add a new card
function addCard() {
  const container = document.getElementById("cards-container");
  const newCard = document.createElement("div");
  newCard.className = "card";

  const cardContent = `
        <div class="form-group">
          <label for="serial">Serial Number</label>
          <input class="textarea" type="text" name="serial" />
        </div>
        <div class="form-group">
          <label for="location">Location</label>
          <input class="textarea" type="text" name="location" />
        </div>
        <div class="form-group">
          <label for="comments">Comments</label>
          <textarea class="textarea" name="comments"></textarea>
        </div>
        <div class="form-group-image">
          <label for="image">Photo</label>
          <div class="image-container">
            <img
              class="image-preview"
              src="/api/placeholder/400/533"
              alt="Preview"
            />
          </div>
          <input
            type="file"
            accept="image/*"
            onchange="handleImageSelect(this)"
          />
        </div>
        <button class="delete-button" onclick="deleteCard(this)">
          <i class="fas fa-trash"></i> Delete
        </button>
    `;

  newCard.innerHTML = cardContent;
  container.appendChild(newCard);
}

// Function to delete a card
function deleteCard(button) {
  const card = button.closest(".card");
  card.remove();
}

// Function to handle image selection
function handleImageSelect(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const preview = input
      .closest(".form-group-image")
      .querySelector(".image-preview");
    preview.src = e.target.result; // Set the preview image source to the file data
  };
  reader.readAsDataURL(file); // Read the file as a data URL
}

// Function to generate and download an HTML file
function generateHTML() {
  const cards = document.querySelectorAll(".card");
  if (cards.length === 0) {
    alert("No cards available to generate an HTML file.");
    return;
  }

  // Create the HTML structure for the A4 page
  let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cards Export</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .page {
          width: 210mm;
          height: 297mm;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-content: space-between;
          padding: 10mm;
          box-sizing: border-box;
          background: rgb(230, 249, 156);
          border: 2px dashed #ccc; /* Add a dashed border to indicate page boundaries */
          margin-bottom: 20px; /* Add spacing between pages */
        }
        .card {
          width: calc(48%); /* Two cards per row */
          height: calc(48%); /* Two rows per page */
          background: #ffffff;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 1rem;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          margin: 0; /* Remove extra margin */
        }
        .form-group {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem; /* Reduce gap between rows */
        }
        .form-group label {
          font-weight: bold;
          margin-right: 0.5rem; /* Add spacing between label and input */
          flex: 1; /* Label takes up 1 part of the row */
          font-size: 0.9rem; /* Reduce font size */
        }
        .form-group input,
        .form-group textarea {
          flex: 2; /* Input takes up 2 parts of the row */
          padding: 0.4rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 0.9rem; /* Reduce font size */
        }
        .image-container {
          text-align: center;
          margin-bottom: 1rem;
          flex-grow: 1; /* Allow the image to grow and occupy space */
        }
        .image-preview {
          width: 100%;
          height: 0;
          padding-bottom: 100%; /* Maintain 1:1 aspect ratio */
          object-fit: cover; /* Ensure the image covers the container */
          border: 1px solid #ddd;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
  `;

  // Add cards to pages
  let pageContent = `<div class="page">`;
  cards.forEach((card, index) => {
    const serial = card.querySelector("input[name='serial']").value || "N/A";
    const location =
      card.querySelector("input[name='location']").value || "N/A";
    const comments =
      card.querySelector("textarea[name='comments']").value || "N/A";
    const imageSrc = card.querySelector(".image-preview").src; // Base64 string
    console.log("Image source in HTML:", imageSrc); // Debugging log

    pageContent += `
      <div class="card">
        <div class="form-group">
          <label>Serial Number</label>
          <input type="text" value="${serial}" readonly />
        </div>
        <div class="form-group">
          <label>Location</label>
          <input type="text" value="${location}" readonly />
        </div>
        <div class="form-group">
          <label>Comments</label>
          <textarea readonly>${comments}</textarea>
        </div>
        <div class="image-container">
          <img class="image-preview" src="${imageSrc}" alt="Preview">
        </div>
      </div>
    `;

    // Add a new page after every 4 cards
    if ((index + 1) % 4 === 0 && index !== cards.length - 1) {
      pageContent += `</div><div class="page">`;
    }
  });

  pageContent += `</div>`; // Close the last page
  htmlContent += pageContent;

  // Close the HTML structure
  htmlContent += `
    </body>
    </html>
  `;

  // Create a Blob and trigger the download
  const blob = new Blob([htmlContent], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "cards.html";
  link.click();
}
