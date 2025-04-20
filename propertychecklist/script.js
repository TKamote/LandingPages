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

// Function to resize an image using a canvas
const resizeImage = (imgElement, width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imgElement, 0, 0, width, height);
  return canvas.toDataURL("image/png");
};

// Add event listener to the "Download" button
const downloadBtn = document.getElementById("download-btn");

downloadBtn.addEventListener("click", () => {
  const cards = document.querySelectorAll(".card");
  if (!cards.length) {
    alert("No cards to export!");
    return;
  }

  const wordContainer = document.createElement("div");
  Object.assign(wordContainer.style, {
    width: "210mm",
    height: "297mm",
    margin: "0",
    padding: "15mm",
    boxSizing: "border-box",
  });

  // Calculate number of pages needed
  const totalCards = cards.length;
  const cardsPerPage = 4;
  const numPages = Math.ceil(totalCards / cardsPerPage);

  // Create pages
  for (let pageNum = 0; pageNum < numPages; pageNum++) {
    const table = document.createElement("table");
    Object.assign(table.style, {
      width: "180mm",
      height: "200mm",
      borderCollapse: "separate",
      borderSpacing: "10mm",
      tableLayout: "fixed",
      margin: "0 auto",
      pageBreakAfter: pageNum < numPages - 1 ? "always" : "auto",
    });

    const tbody = document.createElement("tbody");
    const row1 = document.createElement("tr");
    const row2 = document.createElement("tr");

    // Create cells for this page
    const cells = [];
    for (let i = 0; i < 4; i++) {
      const cell = document.createElement("td");
      Object.assign(cell.style, {
        width: "85mm",
        height: "95mm",
        padding: "0",
        verticalAlign: "top",
      });
      cells.push(cell);
    }

    // Build table structure
    row1.appendChild(cells[0]);
    row1.appendChild(cells[1]);
    row2.appendChild(cells[2]);
    row2.appendChild(cells[3]);
    tbody.appendChild(row1);
    tbody.appendChild(row2);
    table.appendChild(tbody);

    // Process cards for this page
    for (let i = 0; i < cardsPerPage; i++) {
      const cardIndex = pageNum * cardsPerPage + i;
      if (cardIndex >= totalCards) break; // Skip if no more cards

      const card = cards[cardIndex];
      const cardClone = card.cloneNode(true);

      // Force strict card dimensions
      Object.assign(cardClone.style, {
        width: "85mm",
        height: "95mm",
        padding: "5mm",
        margin: "0",
        boxSizing: "border-box",
        overflow: "hidden",
        border: "1px solid #ccc",
        borderRadius: "2mm",
      });

      // Remove delete button
      const deleteBtn = cardClone.querySelector(".delete-btn");
      if (deleteBtn) deleteBtn.remove();

      // Convert inputs to text
      const formGroups = cardClone.querySelectorAll(".form-group");
      formGroups.forEach((group) => {
        const label = group.querySelector("label").textContent;
        const input = group.querySelector("input, textarea");
        const value = input ? input.value : "";

        const textDiv = document.createElement("div");
        textDiv.innerHTML = `<strong>${label}</strong> ${value}`;
        group.replaceWith(textDiv);
      });

      // Handle photo
      const photo = cardClone.querySelector(".photo");
      if (photo && photo.src !== window.location.href + "placeholder.jpg") {
        const resizedPhoto = resizeImage(photo, 250, 250); // Increased and made square
        const newPhoto = document.createElement("img");
        newPhoto.src = resizedPhoto;
        Object.assign(newPhoto.style, {
          width: "80mm", // Increased from 65mm (~25% larger)
          height: "80mm", // Made square
          objectFit: "contain",
        });

        const photoContainer = cardClone.querySelector(".photo-container");
        Object.assign(photoContainer.style, {
          width: "80mm", // Match img width
          height: "80mm", // Match img height
          marginTop: "3mm",
          border: "1px solid #ccc",
          borderRadius: "2mm",
        });
        photoContainer.innerHTML = "";
        photoContainer.appendChild(newPhoto);
      }

      cells[i].appendChild(cardClone);
    }

    wordContainer.appendChild(table);
  }

  // Update the HTML template with page break support
  const html = `
    <html>
      <head>
        <style>
          @page { 
            size: A4 portrait; 
            margin: 0; 
          }
          body {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 15mm;
            box-sizing: border-box;
            background: white;
            font-family: Arial, sans-serif;
            font-size: 10pt !important;
          }
          table {
            width: 180mm !important;
            height: 200mm !important;
            border-collapse: separate !important;
            border-spacing: 10mm !important;
            table-layout: fixed !important;
            margin: 0 auto !important;
            page-break-after: always !important;
          }
          table:last-of-type {
            page-break-after: auto !important;
          }
          .card {
            width: 85mm !important;
            height: 95mm !important;
            padding: 5mm !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            border: 1px solid #ccc !important;
          }
          .photo-container {
            width: 80mm !important;
            height: 80mm !important;
            margin-top: 3mm !important;
            border: 1px solid #ccc !important;
          }
          img {
            width: 80mm !important;
            height: 80mm !important;
            object-fit: contain !important;
          }
          .card div {
            font-size: 10pt !important;
            line-height: 12pt !important;
            margin-bottom: 2mm !important;
          }
          strong {
            font-size: 10pt !important;
          }
        </style>
      </head>
      <body>${wordContainer.innerHTML}</body>
    </html>
  `;

  if (!wordContainer.innerHTML.trim()) {
    console.error("No content generated!");
    return;
  }

  try {
    const blob = window.htmlDocx.asBlob(html);
    if (blob.size < 1000) {
      console.error("Generated document is too small!");
      return;
    }
    saveAs(blob, "PropertyInspection.docx");
  } catch (error) {
    console.error("Error generating document:", error);
  }
});
