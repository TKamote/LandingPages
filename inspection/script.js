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
            <div class="rotation-controls" style="display: none; margin-top: 8px; text-align: center;">
                <button type="button" onclick="rotateImage(this, -90)" style="margin-right: 10px;">
                    <i class="fas fa-undo"></i> Rotate Left
                </button>
                <button type="button" onclick="rotateImage(this, 90)">
                    <i class="fas fa-redo"></i> Rotate Right
                </button>
            </div>
            <input type="file" accept="image/*" onchange="handleImageSelect(this)">
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
  
  // Hide rotation controls
  const rotationControls = card.querySelector(".rotation-controls");
  if (rotationControls) {
    rotationControls.style.display = "none";
  }
  
  // Clear any stored image data
  const fileInput = card.querySelector("input[type='file']");
  if (fileInput) {
    fileInput.value = "";
    delete fileInput.dataset.originalImage;
    delete fileInput.dataset.correctedImage;
    delete fileInput.dataset.currentRotation;
  }
}

// Function to handle image selection and preview
function handleImageSelect(input) {
  const file = input.files[0];
  if (!file) return;

  console.log("Image selected:", file.name);

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.src = e.target.result;

    img.onload = function () {
      // Use Exif.js to read the orientation
      EXIF.getData(file, function () {
        const orientation = EXIF.getTag(this, "Orientation");

        // Create a canvas to fix the orientation
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas dimensions based on orientation
        if (orientation === 6 || orientation === 8) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        // Rotate the image based on orientation
        if (orientation === 6) {
          ctx.rotate((90 * Math.PI) / 180);
          ctx.translate(0, -canvas.width);
        } else if (orientation === 8) {
          ctx.rotate((-90 * Math.PI) / 180);
          ctx.translate(-canvas.height, 0);
        } else if (orientation === 3) {
          ctx.rotate(Math.PI);
          ctx.translate(-canvas.width, -canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        // Update the preview image
        const preview = input
          .closest(".form-group-image")
          .querySelector(".image-preview");
        preview.src = canvas.toDataURL("image/jpeg");

        // Store the original and corrected image data
        input.dataset.originalImage = e.target.result; // Original image
        input.dataset.correctedImage = canvas.toDataURL("image/jpeg"); // Corrected image

        // Show rotation controls
        const rotationControls = input
          .closest(".form-group-image")
          .querySelector(".rotation-controls");
        if (rotationControls) {
          rotationControls.style.display = "block";
        }
      });
    };
  };
  reader.readAsDataURL(file);
}

// Function to rotate an image manually
function rotateImage(button, angleDelta) {
  const card = button.closest(".card");
  const fileInput = card.querySelector("input[type='file']");
  const preview = card.querySelector(".image-preview");

  if (!fileInput.dataset.originalImage) {
    console.error("Original image not found for rotation.");
    return;
  }

  // Get current rotation and add the new angle
  let currentRotation = parseInt(fileInput.dataset.currentRotation || "0");
  currentRotation = (currentRotation + angleDelta) % 360;
  if (currentRotation < 0) currentRotation += 360;

  // Store the new rotation angle
  fileInput.dataset.currentRotation = currentRotation.toString();

  // Load the original image to a new image object
  const img = new Image();
  img.onload = function () {
    // Create a canvas to apply rotation
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions based on rotation
    if (currentRotation === 90 || currentRotation === 270) {
      // Swap dimensions for 90° and 270° rotations
      canvas.width = img.height;
      canvas.height = img.width;
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move to the center of the canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Rotate the canvas context
    ctx.rotate((currentRotation * Math.PI) / 180);

    // Draw the image centered on the canvas
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    // Update the preview with the rotated image
    preview.src = canvas.toDataURL("image/jpeg", 0.92);

    // Store the rotated image for the PDF
    fileInput.dataset.correctedImage = canvas.toDataURL("image/jpeg", 0.92);
  };

  img.src = fileInput.dataset.originalImage;
}

// Function to generate and download the PDF
function generatePDF() {
  try {
    const { jsPDF } = window.jspdf; // Ensure jsPDF is loaded
    const pdf = new jsPDF("portrait", "mm", "a4"); // A4 portrait mode
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const topMargin = 20; // Space below the heading
    const sideMargin = 10; // Equal left and right margins
    const cardWidth = (pageWidth - sideMargin * 2) / 2 - 5; // Adjusted width to ensure even spacing
    const cardHeight = pageHeight / 2 - 20; // Reduced height to minimize bottom space
    const margin = 6; // Reduced margin between cards to create more space

    // Set the background color of the PDF to light gray
    pdf.setFillColor(240, 240, 240); // Light gray color
    pdf.rect(0, 0, pageWidth, pageHeight, "F"); // Fill the entire page with the background color

    // Add the heading "Inspection Form" at the top left
    pdf.setFontSize(16); // Set font size for the heading
    pdf.setTextColor(0, 0, 0); // Black text color
    pdf.text("Inspection Form", sideMargin, 15); // Align to the left at x = sideMargin

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
      const imageInput = card.querySelector("input[type='file']");
      const correctedImage = imageInput.dataset.correctedImage;

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
      if (correctedImage) {
        const imageHeight = cardHeight - 50; // Keep the image height unchanged
        const imageWidth = cardWidth - 10; // Keep the image width unchanged
        pdf.addImage(
          correctedImage,
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

        // Add the heading "Inspection Form" at the top left of the new page
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Inspection Form", sideMargin, 15); // Align to the left at x = sideMargin

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