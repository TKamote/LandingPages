// Ensure jsPDF is available from the global scope
const { jsPDF } = window.jspdf;

// Initialize date input with current date
document.addEventListener("DOMContentLoaded", function () {
  // Set date
  document.getElementById("date").valueAsDate = new Date();

  // Setup photo upload functionality
  const uploadBtn = document.getElementById("upload-btn");
  const fileInput = document.getElementById("image-upload");
  const preview = document.getElementById("image-preview");

  uploadBtn.addEventListener("click", (e) => {
    e.preventDefault();
    fileInput.click();
  });

  fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    preview.innerHTML = ""; // Clear previous preview

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (readerEvent) {
        const img = document.createElement("img");
        // Use an object URL for preview to avoid long data URLs in the DOM initially
        const objectURL = URL.createObjectURL(file);
        img.src = objectURL;
        // Store the file itself for later conversion if needed, or read data URL here
        img.dataset.file = file; // Keep track of the file if needed
        img.dataset.dataUrl = readerEvent.target.result; // Store data URL directly

        img.style.maxWidth = "100%";
        img.style.maxHeight = "200pt";
        // Optional: Revoke object URL when image is loaded to free memory
        img.onload = () => {
          URL.revokeObjectURL(objectURL);
        };
        preview.appendChild(img);

        const timestamp = document.createElement("div");
        timestamp.className = "timestamp";
        const now = new Date();
        timestamp.textContent = now.toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        preview.appendChild(timestamp);
      };
      // Read the file as Data URL for PDF embedding
      reader.readAsDataURL(file);
    }
  });
});

async function generatePDF() {
  const downloadBtn = document.querySelector(".download-btn");
  downloadBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Generating...';
  downloadBtn.disabled = true;

  const formContainer = document.getElementById("form-container");
  const pdfContent = formContainer.cloneNode(true);

  // --- Prepare Content for PDF ---
  const noPdfElements = pdfContent.querySelectorAll(".no-pdf, .back-btn");
  noPdfElements.forEach((el) => el.remove());

  const uploadedImageElement = document.querySelector("#image-preview img");
  const imageDataUrl = uploadedImageElement
    ? uploadedImageElement.dataset.dataUrl
    : null; // Get stored Data URL

  // --- Add PDF-specific Styles ---
  const styleElement = document.createElement("style");
  // Styles remain largely the same as before
  styleElement.textContent = `
    body { font-family: Arial, sans-serif; font-size: 6pt; margin: 0; padding: 0; background-color: white; }
    #form-container { width: 794px; padding: 20px; margin: 0; background: white; box-sizing: border-box; border: none; box-shadow: none; }
    .form-section { margin-bottom: 10pt; padding: 8pt; border: 1px solid #ddd; page-break-inside: avoid; }
    .section-title, .topic-header { font-size: 8pt; font-weight: bold; margin-bottom: 6pt; }
    .attendee-group { display: flex; flex-direction: row; align-items: center; margin-bottom: 4px; }
    .attendee-group .input-group { display: flex; flex-direction: row; align-items: center; margin-right: 8px; margin-bottom: 0; }
    .attendee-group .input-group label { margin-right: 4px; }
    .topic-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .topic-item span { flex-grow: 1; margin-right: 10px; }
    /* Ensure radio buttons/checkboxes render state if possible (often tricky with html2canvas) */
    input[type="radio"], input[type="checkbox"] { /* Basic appearance */
        width: 10px; height: 10px; margin-left: 5px;
    }
    /* Add any other necessary styles */
  `;
  document.head.appendChild(styleElement);

  // Temporarily append for rendering
  pdfContent.style.position = "absolute";
  pdfContent.style.left = "-9999px";
  pdfContent.style.top = "0";
  document.body.appendChild(pdfContent);

  console.log("Starting PDF generation...");

  try {
    // --- Generate Canvas from Form Content ---
    const canvas = await html2canvas(pdfContent, {
      scale: 2,
      useCORS: true,
      logging: true,
      letterRendering: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: pdfContent.scrollWidth,
      windowHeight: pdfContent.scrollHeight,
    });
    console.log("Canvas created from form content.");

    // --- Create PDF Document ---
    const formImgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 15; // Page margin in mm
    const contentWidth = pdfWidth - 2 * margin;
    const pageInnerHeight = pdfHeight - 2 * margin; // Usable height per page

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const canvasAspectRatio = canvasWidth / canvasHeight;

    // Calculate total height the canvas image will take in the PDF
    const totalPdfImageHeight = contentWidth / canvasAspectRatio;

    console.log(
      `PDF Page: ${pdfWidth}x${pdfHeight}mm, Content Width: ${contentWidth}mm, Page Inner Height: ${pageInnerHeight}mm`
    );
    console.log(
      `Canvas: ${canvasWidth}x${canvasHeight}px, Total PDF Image Height: ${totalPdfImageHeight}mm`
    );

    // --- Add Form Content Pages (Corrected Pagination) ---
    let position = 0; // This is the Y position *within the source canvas image*
    let currentPage = 1;
    while (position < totalPdfImageHeight) {
      // Add a new page if this isn't the first page
      if (currentPage > 1) {
        pdf.addPage();
      }
      // Calculate the height of the slice to add for this page
      let sliceHeight = Math.min(
        pageInnerHeight,
        totalPdfImageHeight - position
      );

      // Add the image slice
      // addImage(imageData, format, x, y, width, height, alias, compression, rotation)
      // We need to use the version that allows specifying source coordinates (sx, sy, sw, sh)
      // However, jsPDF's addImage doesn't directly support slicing from a single data URL easily.
      // A workaround is to draw the slice onto a temporary canvas and add that.

      // --- Workaround: Draw slice to temp canvas ---
      const tempCanvas = document.createElement("canvas");
      // Calculate source dimensions in canvas pixels
      const sourceY = (position / totalPdfImageHeight) * canvasHeight;
      const sourceHeight = (sliceHeight / totalPdfImageHeight) * canvasHeight;
      tempCanvas.width = canvasWidth;
      tempCanvas.height = sourceHeight;
      const tempCtx = tempCanvas.getContext("2d");
      // Draw the slice from the original canvas onto the temporary one
      tempCtx.drawImage(
        canvas,
        0,
        sourceY,
        canvasWidth,
        sourceHeight,
        0,
        0,
        canvasWidth,
        sourceHeight
      );
      const sliceImgData = tempCanvas.toDataURL("image/jpeg", 0.95);
      // --- End Workaround ---

      // Add the slice image data to the PDF page
      pdf.addImage(
        sliceImgData,
        "JPEG",
        margin,
        margin,
        contentWidth,
        sliceHeight
      );
      console.log(
        `Added page ${currentPage}, Slice Height: ${sliceHeight}mm, Position: ${position}mm`
      );

      position += sliceHeight; // Move to the next position in the source image
      currentPage++;
    }

    // --- Add Uploaded Image Conditionally ---
    let finalYOnLastPage = margin + (totalPdfImageHeight % pageInnerHeight);
    // If it perfectly filled the last page, the position is the bottom margin
    if (finalYOnLastPage === margin && totalPdfImageHeight > 0) {
      finalYOnLastPage = pdfHeight - margin;
    }
    console.log(
      `Content ends at y=${finalYOnLastPage}mm on page ${pdf.internal.getNumberOfPages()}`
    );

    if (imageDataUrl) {
      console.log("Processing uploaded image...");
      try {
        const imgProps = pdf.getImageProperties(imageDataUrl);
        const imgAspectRatio = imgProps.width / imgProps.height;

        // --- Rotation Heuristic ---
        let imgPdfWidth = contentWidth; // Assume portrait initially fits width
        let imgPdfHeight = imgPdfWidth / imgAspectRatio;
        let isRotated = false;

        // Basic check: If original width > height, it might be landscape
        if (imgProps.width > imgProps.height) {
          console.warn(
            "Image dimensions suggest landscape. PDF output might appear rotated."
          );
          // If it's landscape, maybe scale based on height instead?
          // This is just a guess, EXIF data is needed for accuracy.
          // imgPdfHeight = pageInnerHeight * 0.5; // Example: Limit height
          // imgPdfWidth = imgPdfHeight * imgAspectRatio;
          isRotated = true; // Flag for potential rotation issue
        }
        // --- End Rotation Heuristic ---

        // Ensure scaled height doesn't exceed max possible height
        const maxImgHeight = pageInnerHeight;
        if (imgPdfHeight > maxImgHeight) {
          imgPdfHeight = maxImgHeight;
          imgPdfWidth = imgPdfHeight * imgAspectRatio;
        }
        // Ensure scaled width doesn't exceed content width
        if (imgPdfWidth > contentWidth) {
          imgPdfWidth = contentWidth;
          imgPdfHeight = imgPdfWidth / imgAspectRatio;
        }

        // Calculate remaining space on the current last page
        const remainingSpace = pdfHeight - finalYOnLastPage - margin; // Space below content to bottom margin
        console.log(
          `Required image height: ${imgPdfHeight}mm, Remaining space: ${remainingSpace}mm`
        );

        let imageYPos = 0;
        if (imgPdfHeight <= remainingSpace) {
          // Fits on the current page
          imageYPos = finalYOnLastPage + 5; // Add some padding
          pdf.setPage(pdf.internal.getNumberOfPages()); // Ensure we're on the last page
          console.log(
            `Adding image to current page ${pdf.internal.getNumberOfPages()} at y=${imageYPos}`
          );
        } else {
          // Doesn't fit, add a new page
          pdf.addPage();
          imageYPos = margin; // Place at top margin on new page
          console.log(
            `Adding image to new page ${pdf.internal.getNumberOfPages()} at y=${imageYPos}`
          );
        }

        // Center the image horizontally
        const imageXPos = margin + (contentWidth - imgPdfWidth) / 2;

        // Add the image (rotation parameter is not standard in jsPDF addImage like this)
        pdf.addImage(
          imageDataUrl,
          imgProps.fileType,
          imageXPos,
          imageYPos,
          imgPdfWidth,
          imgPdfHeight
        );
        console.log("Uploaded image added.");
      } catch (imgError) {
        console.error("Error adding uploaded image:", imgError);
        alert(
          "Could not add the uploaded image to the PDF. Please check console."
        );
      }
    } else {
      console.log("No uploaded image found to add.");
    }

    // --- Save the PDF ---
    console.log("Saving PDF...");
    pdf.save(`TBM_Report_${new Date().toLocaleDateString("en-CA")}.pdf`);
    console.log("PDF Saved.");
  } catch (error) {
    console.error("PDF generation failed:", error);
    alert("Failed to generate PDF. Please check the console for errors.");
  } finally {
    // --- Cleanup ---
    console.log("Cleaning up...");
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
    downloadBtn.disabled = false;
    if (document.head.contains(styleElement)) {
      document.head.removeChild(styleElement);
    }
    if (document.body.contains(pdfContent)) {
      document.body.removeChild(pdfContent);
    }
    console.log("Cleanup complete.");
  }
}
