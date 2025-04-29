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
                <!-- Debug Display for Orientation -->
                <div id="orientation-display-${cardId}" style="font-size: 10px; color: #888; margin-bottom: 4px;">Orientation: ?</div>
                <!-- End Debug Display -->

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
    const orientationDisplay = newCard.querySelector(
      `#orientation-display-${cardId}`
    ); // Get the debug display div

    uploadBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
        // Reset display
        orientationDisplay.textContent = "Orientation: Reading...";
        previewImage.removeAttribute("data-orientation"); // Clear previous data
        previewImage.removeAttribute("data-data-url");

        // Read EXIF data first
        EXIF.getData(file, function () {
          const orientation = EXIF.getTag(this, "Orientation");
          console.log(`Card ${cardId} - Image Orientation Read:`, orientation); // Keep console log just in case

          // *** Update the UI display ***
          orientationDisplay.textContent = `Orientation: ${
            orientation === undefined ? "Not Found" : orientation
          }`;

          const reader = new FileReader();
          reader.onload = function (readerEvent) {
            const objectURL = URL.createObjectURL(file);
            previewImage.src = objectURL;
            // Store data URL and orientation for PDF generation
            previewImage.dataset.dataUrl = readerEvent.target.result;
            // Ensure we store the read orientation, default to 1 if undefined
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
    const margin = 18;
    const headerHeight = 15;
    const footerHeight = 10;
    const contentWidth = pageWidth - 2 * margin;
    const contentHeight = pageHeight - margin - headerHeight - footerHeight;

    const cardsPerPage = 6;
    const numCols = 2;
    const numRows = 3;
    const cellPadding = 3;
    const rowGap = 7;
    const colGap = 7;

    const cellWidth = (contentWidth - (numCols - 1) * colGap) / numCols;
    const cellHeight = (contentHeight - (numRows - 1) * rowGap) / numRows;

    const textHeight = 12;
    const maxImageHeight = cellHeight - textHeight - cellPadding * 2;
    const maxImageWidth = cellWidth - cellPadding * 2;

    let pageNum = 1;

    // --- Add Header Function ---
    const addHeaderFooter = (pdf, pageNum, totalPages) => {
      pdf.setFontSize(14);
      pdf.setFont(undefined, "bold");
      pdf.text(mainTitle, pageWidth / 2, margin, { align: "center" });
      pdf.setFontSize(10);
      pdf.setFont(undefined, "normal");
      pdf.text(`Inspection Date: ${inspectionDate}`, margin, margin + 7);
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
        if (pageIndex > 0) pdf.addPage();
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
        ? parseInt(previewImage.dataset.orientation || "1", 10)
        : 1;

      console.log(
        `Processing Card ${i}: Loc=${location}, Status=${status}, Img=${!!originalImageDataUrl}, Orient=${imageOrientation}`
      );

      // --- Add Text to PDF Cell ---
      const textX = cellX + cellPadding;
      const textY = cellY + cellPadding;
      pdf.setFontSize(9);
      pdf.setFont(undefined, "bold");
      pdf.text(`Location:`, textX, textY + 3);
      pdf.setFont(undefined, "normal");
      pdf.text(`${location}`, textX + 20, textY + 3);
      pdf.setFont(undefined, "bold");
      pdf.text(`Status:`, textX, textY + 8);
      pdf.setFont(undefined, "normal");
      pdf.text(`${status}`, textX + 20, textY + 8);

      // --- Add Image to PDF Cell (if exists) ---
      const imageStartY = textY + textHeight;

      if (originalImageDataUrl) {
        try {
          const imgProps = pdf.getImageProperties(originalImageDataUrl);
          console.log(
            `Card ${i}: Original image props W=${imgProps.width}, H=${imgProps.height}`
          );

          let rotationAngle = 0;
          let effectiveWidth = imgProps.width;
          let effectiveHeight = imgProps.height;

          // Determine rotation angle and effective dimensions for layout calculation
          switch (imageOrientation) {
            case 3: // 180 degrees
              rotationAngle = 180;
              break;
            case 6: // 90 degrees CW
              rotationAngle = 90;
              effectiveWidth = imgProps.height; // Swapped for layout
              effectiveHeight = imgProps.width;
              break;
            case 8: // 270 degrees CW
              rotationAngle = 270;
              effectiveWidth = imgProps.height; // Swapped for layout
              effectiveHeight = imgProps.width;
              break;
            // Cases 2, 4, 5, 7 involve flips, jsPDF rotation might not handle these directly
            // We'll treat them as orientation 1 for now, rotation might be incorrect
            case 2:
            case 4:
            case 5:
            case 7:
              console.warn(
                `Card ${i}: Orientation ${imageOrientation} involves flip, jsPDF rotation might be incorrect.`
              );
              // Treat as 0 rotation for layout
              break;
            case 1: // No rotation
            default:
              rotationAngle = 0;
              break;
          }
          console.log(
            `Card ${i}: Determined rotationAngle=${rotationAngle}, Effective W=${effectiveWidth}, H=${effectiveHeight}`
          );

          // Calculate draw dimensions based on EFFECTIVE width/height and aspect ratio
          const aspectRatio = effectiveWidth / effectiveHeight;
          let drawWidth = maxImageWidth;
          let drawHeight = drawWidth / aspectRatio;

          if (drawHeight > maxImageHeight) {
            drawHeight = maxImageHeight;
            drawWidth = drawHeight * aspectRatio;
          }
          if (drawWidth > maxImageWidth) {
            drawWidth = maxImageWidth;
            drawHeight = drawWidth / aspectRatio;
          }

          const imgX = cellX + cellPadding + (maxImageWidth - drawWidth) / 2;
          const imgY = imageStartY;

          // Add image using jsPDF's rotation parameter
          pdf.addImage(
            originalImageDataUrl,
            imgProps.fileType,
            imgX,
            imgY,
            drawWidth,
            drawHeight,
            null, // alias
            "NONE", // compression
            rotationAngle // rotation angle in degrees CW
          );
          console.log(
            `Card ${i}: Added image via jsPDF.addImage with rotation ${rotationAngle} at (${imgX.toFixed(
              1
            )}, ${imgY.toFixed(1)}) size ${drawWidth.toFixed(
              1
            )}x${drawHeight.toFixed(1)}`
          );

          // --- Add Timestamp ON the image ---
          const timestampFontSize = 10;
          const timestampPadding = 1.5;
          const timestampBgHeight =
            timestampFontSize / 2.5 + timestampPadding * 2;
          const timestampY =
            imgY + drawHeight - timestampBgHeight - timestampPadding;
          const timestampTextY =
            timestampY + timestampBgHeight / 2 + timestampFontSize / 3.5;

          pdf.setFillColor(0, 0, 0, 0.5);
          pdf.rect(imgX, timestampY, drawWidth, timestampBgHeight, "F");

          pdf.setFontSize(timestampFontSize);
          pdf.setTextColor(255, 255, 255);
          pdf.text(timestamp, imgX + drawWidth / 2, timestampTextY, {
            align: "center",
          });
          pdf.setTextColor(0, 0, 0);
        } catch (imgError) {
          console.error(`Error processing image for card ${i}:`, imgError);
          pdf.setFontSize(8);
          pdf.setTextColor(255, 0, 0);
          pdf.text(
            "Error loading image",
            cellX + cellPadding,
            imageStartY + maxImageHeight / 2
          );
          pdf.setTextColor(0, 0, 0);
        }
      } else {
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          "[No Photo]",
          cellX + cellWidth / 2,
          imageStartY + maxImageHeight / 2,
          { align: "center" }
        );
        pdf.setTextColor(0, 0, 0);
      }
    } // End loop through cards

    const filename = `Daily_Inspection_${
      inspectionDate || yyyy + "-" + mm + "-" + dd
    }.pdf`;
    pdf.save(filename);
    console.log("PDF Saved:", filename);
  } catch (error) {
    console.error("PDF generation failed:", error);
    alert("Failed to generate PDF. Please check the console for errors.");
  } finally {
    console.log("Cleaning up...");
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
    downloadBtn.disabled = false;
    console.log("Cleanup complete.");
  }
}

window.generatePDF = generatePDF;
