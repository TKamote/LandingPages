// Function to add a new card
function addCard() {
  const container = document.getElementById("cards-container");
  const newCard = document.createElement("div");
  newCard.className = "card";

  const cardContent = `
        <button class="delete-button" onclick="deleteCard(this)">
            <i class="fas fa-trash"></i>
        </button>
        <div class="card-header">
            <button onclick="resetCard(this)">
                <i class="fas fa-redo"></i>
            </button>
        </div>
        <div class="form-group">
            <label for="serial">Serial Number</label>
            <input class="textarea" type="text" name="serial">
        </div>
        <div class="form-group">
            <label for="location">Location</label>
            <input class="textarea" type="text" name="location">
        </div>
        <div class="form-group">
            <label for="comments">Comments</label>
            <textarea class="textarea" name="comments"></textarea>
        </div>
        <div class="form-group-image">
            <label for="image">Photo</label>
            <div class="image-container">
                <img class="image-preview" src="/api/placeholder/400/533" alt="Preview">
            </div>
            <input type="file" accept="image/*" capture="environment" onchange="handleImageSelect(this)">
        </div>
    `;

  newCard.innerHTML = cardContent;
  container.appendChild(newCard);
}

// Function to delete a card
function deleteCard(button) {
  button.closest(".card").remove();
}

// Function to reset a card
function resetCard(button) {
  const card = button.closest(".card");
  const inputs = card.querySelectorAll("input, textarea");
  inputs.forEach((input) => {
    input.value = "";
  });
  const preview = card.querySelector(".image-preview");
  preview.src = "/api/placeholder/400/533";
}

// Function to handle image selection and preview
function handleImageSelect(input) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const preview =
        input.previousElementSibling.querySelector(".image-preview");
      preview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Function to generate and download the PDF
function generatePDF() {
  try {
    const { jsPDF } = window.jspdf; // Ensure jsPDF is loaded
    const pdf = new jsPDF("portrait", "mm", "a4"); // A4 portrait mode
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const topMargin = 20; // Added 30px (10mm) space at the top for a heading
    const sideMargin = 10; // Equal left and right margins
    const cardWidth = (pageWidth - sideMargin * 2) / 2 - 5; // Adjusted width to ensure even spacing
    const cardHeight = pageHeight / 2 - 20; // Reduced height to minimize bottom space
    const margin = 6; // Reduced margin between cards to create more space

    // Set the background color of the PDF to light gray
    pdf.setFillColor(240, 240, 240); // Light gray color
    pdf.rect(0, 0, pageWidth, pageHeight, "F"); // Fill the entire page with the background color

    // Get all cards
    const cards = document.querySelectorAll(".card");

    if (cards.length === 0) {
      alert("No cards available to generate a PDF.");
      return;
    }

    let x = sideMargin; // X-coordinate for the card
    let y = topMargin; // Y-coordinate for the card (start below the heading space)
    let cardCount = 0; // Track the number of cards added to the page

    cards.forEach((card, index) => {
      // Extract data from the card
      const serialNumber =
        card.querySelector("input[name='serial']").value || "N/A";
      const location =
        card.querySelector("input[name='location']").value || "N/A";
      const comments =
        card.querySelector("textarea[name='comments']").value || "N/A";
      const imageElement = card.querySelector(".image-preview");
      const imageSrc = imageElement.src;

      // Add a box shadow effect for the card
      pdf.setDrawColor(222, 222, 222); // Light gray shadow color
      pdf.setLineWidth(0.5); // Subtle shadow width
      pdf.rect(x + 1, y + 1, cardWidth, cardHeight, "S"); // Shadow offset by 1mm

      // Add card background (white)
      pdf.setFillColor(255, 255, 255); // White color
      pdf.rect(x, y, cardWidth, cardHeight, "F"); // Fill the card background

      // Add text to the card
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0); // Black text color
      pdf.text(`Serial Number: ${serialNumber}`, x + 5, y + 8);
      pdf.text(`Location: ${location}`, x + 5, y + 18);
      pdf.text(`Comments: ${comments}`, x + 5, y + 28);

      // Add image to the card (if available)
      if (imageSrc && imageSrc !== "/api/placeholder/400/533") {
        const imageHeight = cardHeight - 50; // Keep the image height unchanged
        const imageWidth = cardWidth - 10; // Keep the image width unchanged
        pdf.addImage(
          imageSrc,
          "JPEG",
          x + 5,
          y + 40, // Position the image below the text
          imageWidth,
          imageHeight
        );
      }

      // Update coordinates for the next card
      cardCount++;
      if (cardCount % 2 === 0) {
        x = sideMargin; // Reset X to the left margin
        y += cardHeight + margin; // Move to the next row
      } else {
        x += cardWidth + margin; // Move to the next column
      }

      // If 4 cards are added, create a new page
      if (cardCount % 4 === 0 && index !== cards.length - 1) {
        pdf.addPage();
        pdf.setFillColor(240, 240, 240); // Light gray background for the new page
        pdf.rect(0, 0, pageWidth, pageHeight, "F"); // Fill the new page with the background color
        x = sideMargin;
        y = topMargin; // Reset Y to include the top margin for the next page
      }
    });

    // Save the PDF
    pdf.save("Card2x2A4P.pdf");
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("An error occurred while generating the PDF. Please try again.");
  }
}

// Add event listener to the "PDF" button in the header
document.addEventListener("DOMContentLoaded", () => {
  const pdfButton = document.querySelector(".header-btn button"); // Ensure the button is correctly selected
  if (pdfButton) {
    pdfButton.replaceWith(pdfButton.cloneNode(true)); // Remove duplicate listeners
    const newPdfButton = document.querySelector(".header-btn button");
    newPdfButton.addEventListener("click", generatePDF);
  }
});
