document.addEventListener("DOMContentLoaded", function () {
  const inspectionContainer = document.getElementById("inspection");
  const addButton = document.getElementById("add-inspection-btn");
  const dateInput = document.getElementById("inspection-date");
  let cardCount = 0;

  // Ensure jsPDF is available from the global scope
  const { jsPDF } = window.jspdf;

  // Set current date
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const dd = String(today.getDate()).padStart(2, "0");
  dateInput.value = `${yyyy}-${mm}-${dd}`;

  // --- Add Inspection Card Function ---
  function addInspectionCard() {
    const cardId = cardCount++;
    const newCard = document.createElement("div");
    newCard.className = "inspection-card";
    newCard.id = `card-${cardId}`;
    newCard.innerHTML = `
            <div class="select-group">
                <label for="location-${cardId}">Location</label>
                <select id="location-${cardId}" class="location-select" required>
                    <option value="" disabled selected>Select location</option>
                    <option value="B3">B3</option>
                    <option value="B2">B2</option>
                    <option value="B1">B1</option>
                    <option value="L1">L1</option>
                    <option value="L3">L3</option>
                    <option value="L4">L4</option>
                    <option value="L13">L13</option>
                    <option value="Roof">Roof</option>
                </select>
            </div>

            <div class="select-group">
                <label for="status-${cardId}">Status</label>
                <select id="status-${cardId}" class="status-select" required>
                    <option value="" disabled selected>Select status</option>
                    <option value="Good">Good</option>
                    <option value="Need Repair">Need Repair</option>
                    <option value="Under Repair">Under Repair</option>
                    <option value="Critical">Critical</option>
                </select>
            </div>

            <div class="photo-section">
                <!-- <label>Photo</label> Removed as requested -->
                <button type="button" id="upload-btn-${cardId}" class="upload-btn">
                    <i class="fas fa-camera"></i> Take Photo or Choose from Gallery
                </button>
                <input type="file" id="photo-input-${cardId}" class="photo-input" accept="image/*" style="display: none;" />
                <div class="photo-preview" id="photo-preview-${cardId}" style="display: none;">
                    <div class="preview-container">
                        <img id="preview-image-${cardId}" class="preview-image" src="" alt="Preview" />
                        <div id="timestamp-${cardId}" class="timestamp"></div>
                    </div>
                </div>
            </div>
        `;

    inspectionContainer.appendChild(newCard);

    // Add event listeners for the new card's photo upload
    const uploadBtn = newCard.querySelector(`#upload-btn-${cardId}`);
    const fileInput = newCard.querySelector(`#photo-input-${cardId}`);
    const photoPreview = newCard.querySelector(`#photo-preview-${cardId}`);
    const previewImage = newCard.querySelector(`#preview-image-${cardId}`);
    const timestampDiv = newCard.querySelector(`#timestamp-${cardId}`);

    uploadBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
        // Read EXIF data first
        EXIF.getData(file, function () {
          const orientation = EXIF.getTag(this, "Orientation");
          console.log(`Card ${cardId} - Image Orientation Read:`, orientation);

          const reader = new FileReader();
          reader.onload = function (readerEvent) {
            const objectURL = URL.createObjectURL(file);
            previewImage.src = objectURL;
            // Store data URL and orientation for PDF generation
            previewImage.dataset.dataUrl = readerEvent.target.result;
            previewImage.dataset.orientation = orientation || 1;

            previewImage.onload = () => {
              URL.revokeObjectURL(objectURL);
            }; // Clean up object URL

            const now = new Date();
            timestampDiv.textContent = now.toLocaleString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            });
            photoPreview.style.display = "block";
          };
          reader.readAsDataURL(file);
        });
      }
    });
  }

  // --- Event Listener for Add Button ---
  addButton.addEventListener("click", addInspectionCard);

  // --- Initial Card ---
  // Optionally add one card initially when the page loads
  // addInspectionCard();
}); // End DOMContentLoaded

// --- Helper function to rotate image based on EXIF orientation ---
async function rotateImage(imageDataUrl, orientation) {
  console.log(`>>> rotateImage called with orientation: ${orientation} <<<`);
  if (!orientation || orientation === 1 || orientation < 1 || orientation > 8) {
    console.log("No rotation needed or invalid orientation.");
    return imageDataUrl;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      console.log(`Original image dimensions: ${img.width}x${img.height}`);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      let width = img.width;
      let height = img.height;
      let transformApplied = "None";

      // Set canvas dimensions based on orientation
      if (orientation >= 5 && orientation <= 8) {
        // Rotated 90 or 270 degrees
        canvas.width = height;
        canvas.height = width;
        console.log(
          `Canvas dimensions set for 90/270 rotation: ${canvas.width}x${canvas.height}`
        );
      } else {
        canvas.width = width;
        canvas.height = height;
        console.log(
          `Canvas dimensions set for 0/180 rotation: ${canvas.width}x${canvas.height}`
        );
      }

      // Apply transformations based on orientation
      console.log(`Applying transform for orientation ${orientation}...`);
      ctx.save(); // Save context state before transform
      switch (orientation) {
        case 2:
          ctx.transform(-1, 0, 0, 1, width, 0);
          transformApplied = "Flip H";
          break;
        case 3:
          ctx.transform(-1, 0, 0, -1, width, height);
          transformApplied = "Rotate 180";
          break;
        case 4:
          ctx.transform(1, 0, 0, -1, 0, height);
          transformApplied = "Flip V";
          break;
        case 5:
          ctx.transform(0, 1, 1, 0, 0, 0);
          transformApplied = "Transpose";
          break;
        case 6:
          ctx.transform(0, 1, -1, 0, height, 0);
          transformApplied = "Rotate 90 CW";
          break;
        case 7:
          ctx.transform(0, -1, -1, 0, height, width);
          transformApplied = "Transverse";
          break;
        case 8:
          ctx.transform(0, -1, 1, 0, 0, width);
          transformApplied = "Rotate 270 CW (90 CCW)";
          break;
      }
      console.log(`Transform applied: ${transformApplied}`);

      try {
        console.log(
          `Drawing image at (0, 0) on canvas ${canvas.width}x${canvas.height}`
        );
        ctx.drawImage(img, 0, 0);
        console.log("Image drawn onto rotated canvas.");
      } catch (drawError) {
        console.error("Error during ctx.drawImage:", drawError);
        ctx.restore();
        reject(drawError);
        return;
      }
      ctx.restore();

      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };
    img.onerror = (err) => {
      console.error("Error loading image in rotateImage:", err);
      reject(err);
    };
    img.src = imageDataUrl;
  });
}

// --- PDF Generation Function ---
async function generatePDF() {
  const downloadBtn = document.querySelector(".download-btn");
  const inspectionCards = document.querySelectorAll(".inspection-card");
  const mainTitle = "Daily Inspection for Summit";
  const inspectionDate = document.getElementById("inspection-date").value;

  if (inspectionCards.length === 0) {
    alert("Please add at least one inspection card.");
    return;
  }

  // Ensure jsPDF is available from the global scope
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  downloadBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Generating...';
  downloadBtn.disabled = true;
  console.log("Starting PDF generation...");

  try {
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const headerHeight = 15; // Space for title + date
    const footerHeight = 10; // Space for page number
    const contentWidth = pageWidth - 2 * margin;
    const contentHeight = pageHeight - margin - headerHeight - footerHeight; // Available height for grid

    const cardsPerPage = 6; // 2 columns x 3 rows
    const numCols = 2;
    const numRows = 3;
    const cellPadding = 3; // Padding inside each cell
    const rowGap = 5; // Explicit gap between rows instead of relying solely on cellHeight
    const colGap = 5; // Explicit gap between columns

    // Adjusted cell width/height calculation
    const cellWidth = (contentWidth - (numCols - 1) * colGap) / numCols;
    const cellHeight = (contentHeight - (numRows - 1) * rowGap) / numRows;

    // Space reserved for text (Location + Status)
    const textHeight = 12; // Approx height for 2 lines of text + padding
    // Max available space for the image within the cell, below the text
    const maxImageHeight = cellHeight - textHeight - cellPadding * 2;
    const maxImageWidth = cellWidth - cellPadding * 2;

    let pageNum = 1;
    let cardIndex = 0;

    // --- Add Header Function ---
    const addHeaderFooter = (pdf, pageNum, totalPages) => {
      pdf.setFontSize(14);
      pdf.setFont(undefined, "bold");
      pdf.text(mainTitle, pageWidth / 2, margin, { align: "center" });
      pdf.setFontSize(10);
      pdf.setFont(undefined, "normal");
      pdf.text(`Inspection Date: ${inspectionDate}`, margin, margin + 7);
      // Footer (Page Number)
      pdf.text(
        `Page ${pageNum} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - footerHeight + 5,
        { align: "center" }
      );
    };

    const totalPages = Math.ceil(inspectionCards.length / cardsPerPage);

    for (let i = 0; i < inspectionCards.length; i++) {
      const card = inspectionCards[i];
      const pageIndex = Math.floor(i / cardsPerPage);
      const indexOnPage = i % cardsPerPage;

      // Add new page if needed
      if (indexOnPage === 0) {
        if (pageIndex > 0) {
          pdf.addPage();
        }
        pageNum = pageIndex + 1;
        addHeaderFooter(pdf, pageNum, totalPages);
      }

      // Calculate cell position (row, col)
      const row = Math.floor(indexOnPage / numCols);
      const col = indexOnPage % numCols;

      // Calculate top-left corner (x, y) of the cell, including gaps
      const cellX = margin + col * (cellWidth + colGap);
      const cellY = margin + headerHeight + row * (cellHeight + rowGap);

      // --- Get Data from Card ---
      const locationSelect = card.querySelector(".location-select");
      const statusSelect = card.querySelector(".status-select");
      const previewImage = card.querySelector(".preview-image");
      const timestampDiv = card.querySelector(".timestamp");

      const location = locationSelect ? locationSelect.value : "N/A";
      const status = statusSelect ? statusSelect.value : "N/A";
      const timestamp = timestampDiv ? timestampDiv.textContent : "";
      const originalImageDataUrl = previewImage
        ? previewImage.dataset.dataUrl
        : null;
      const imageOrientation = previewImage
        ? parseInt(previewImage.dataset.orientation || "1")
        : 1;

      console.log(
        `Processing Card ${i}: Loc=${location}, Status=${status}, Img=${!!originalImageDataUrl}, Orient=${imageOrientation}`
      );

      // --- Add Text to PDF Cell ---
      const textX = cellX + cellPadding;
      const textY = cellY + cellPadding;
      pdf.setFontSize(9);
      pdf.setFont(undefined, "bold");
      pdf.text(`Location:`, textX, textY + 3); // +3 for font baseline
      pdf.setFont(undefined, "normal");
      pdf.text(`${location}`, textX + 20, textY + 3);

      pdf.setFont(undefined, "bold");
      pdf.text(`Status:`, textX, textY + 8);
      pdf.setFont(undefined, "normal");
      pdf.text(`${status}`, textX + 20, textY + 8);

      // --- Add Image to PDF Cell (if exists) ---
      const imageStartY = textY + textHeight; // Start image below text area

      if (originalImageDataUrl) {
        try {
          console.log(
            `Card ${i}: Rotating image with orientation ${imageOrientation}`
          );
          const rotatedImageDataUrl = await rotateImage(
            originalImageDataUrl,
            imageOrientation
          );
          const imgProps = pdf.getImageProperties(rotatedImageDataUrl);
          console.log(
            `Card ${i}: Rotated image props W=${imgProps.width}, H=${imgProps.height}`
          );

          // Calculate image dimensions maintaining aspect ratio
          const aspectRatio = imgProps.width / imgProps.height;
          let drawWidth = maxImageWidth;
          let drawHeight = drawWidth / aspectRatio;

          // If calculated height exceeds max height, recalculate based on height
          if (drawHeight > maxImageHeight) {
            drawHeight = maxImageHeight;
            drawWidth = drawHeight * aspectRatio;
          }
          // Ensure width doesn't exceed max width after height adjustment
          if (drawWidth > maxImageWidth) {
            drawWidth = maxImageWidth;
            drawHeight = drawWidth / aspectRatio;
          }

          // Center the image horizontally within the cell's image area
          const imgX = cellX + cellPadding + (maxImageWidth - drawWidth) / 2;
          // Position image vertically below text
          const imgY = imageStartY;

          pdf.addImage(
            rotatedImageDataUrl,
            imgProps.fileType,
            imgX,
            imgY,
            drawWidth,
            drawHeight
          );
          console.log(
            `Card ${i}: Added image at (${imgX.toFixed(1)}, ${imgY.toFixed(
              1
            )}) size ${drawWidth.toFixed(1)}x${drawHeight.toFixed(1)}`
          );

          // --- Add Timestamp ON the image ---
          const timestampFontSize = 7;
          const timestampPadding = 1;
          const timestampBgHeight =
            timestampFontSize / 2.5 + timestampPadding * 2; // Approximate height based on font size

          // Position near bottom of image
          const timestampY =
            imgY + drawHeight - timestampBgHeight - timestampPadding;
          const timestampTextY =
            timestampY + timestampBgHeight / 2 + timestampFontSize / 3; // Center text vertically

          // Draw semi-transparent background
          pdf.setFillColor(0, 0, 0, 0.5); // Black with 50% opacity
          pdf.rect(imgX, timestampY, drawWidth, timestampBgHeight, "F"); // 'F' for fill

          // Draw timestamp text
          pdf.setFontSize(timestampFontSize);
          pdf.setTextColor(255, 255, 255); // White text
          pdf.text(timestamp, imgX + drawWidth / 2, timestampTextY, {
            align: "center",
          });
          pdf.setTextColor(0, 0, 0); // Reset text color
        } catch (imgError) {
          console.error(`Error processing image for card ${i}:`, imgError);
          pdf.setFontSize(8);
          pdf.setTextColor(255, 0, 0); // Red color for error
          pdf.text(
            "Error loading image",
            cellX + cellPadding,
            imageStartY + maxImageHeight / 2
          );
          pdf.setTextColor(0, 0, 0); // Reset color
        }
      } else {
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150); // Grey color
        pdf.text(
          "[No Photo]",
          cellX + cellWidth / 2,
          imageStartY + maxImageHeight / 2,
          { align: "center" }
        );
        pdf.setTextColor(0, 0, 0); // Reset color
      }
    } // End loop through cards

    // --- Save the PDF ---
    const filename = `Daily_Inspection_${
      inspectionDate || yyyy + "-" + mm + "-" + dd
    }.pdf`;
    pdf.save(filename);
    console.log("PDF Saved:", filename);
  } catch (error) {
    console.error("PDF generation failed:", error);
    alert("Failed to generate PDF. Please check the console for errors.");
  } finally {
    // --- Cleanup ---
    console.log("Cleaning up...");
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
    downloadBtn.disabled = false;
    console.log("Cleanup complete.");
  }
}

// Make generatePDF globally accessible if it's not already
window.generatePDF = generatePDF;
