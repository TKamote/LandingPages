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
      // Read EXIF data first
      EXIF.getData(file, function () {
        const orientation = EXIF.getTag(this, "Orientation");
        console.log("Image Orientation Read:", orientation); // Log orientation read

        const reader = new FileReader();
        reader.onload = function (readerEvent) {
          const img = document.createElement("img");
          const objectURL = URL.createObjectURL(file);
          img.src = objectURL;
          img.dataset.dataUrl = readerEvent.target.result; // Store data URL
          img.dataset.orientation = orientation || 1; // Store orientation

          img.style.maxWidth = "100%";
          img.style.maxHeight = "200pt";
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
        reader.readAsDataURL(file);
      });
    }
  });
});

// Helper function to rotate image based on EXIF orientation
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
          console.log(`--- Applying Orientation 8 Transform ---`);
          // Rotate 270 CW / 90 CCW
          // Translate origin to corner, rotate, then draw image at new origin
          // ctx.translate(0, width); // Move origin to bottom-left
          // ctx.rotate(-Math.PI / 2); // Rotate -90 degrees (90 CCW)
          // transformApplied = 'Rotate 270 CW (90 CCW) - Method A';
          // Alternative using transform matrix:
          ctx.transform(0, -1, 1, 0, 0, width);
          transformApplied = "Rotate 270 CW (90 CCW) - Method B (Matrix)";
          console.log(`--- Transform for Orientation 8 applied ---`);
          break;
      }
      console.log(`Transform applied: ${transformApplied}`);

      // Draw the image onto the transformed canvas
      try {
        console.log(
          `Drawing image at (0, 0) on canvas ${canvas.width}x${canvas.height}`
        );
        ctx.drawImage(img, 0, 0);
        console.log("Image drawn onto rotated canvas.");
      } catch (drawError) {
        console.error("Error during ctx.drawImage:", drawError);
        ctx.restore(); // Restore context if draw failed
        reject(drawError);
        return;
      }
      ctx.restore(); // Restore context state

      resolve(canvas.toDataURL("image/jpeg", 0.95)); // Return rotated image data URL
    };
    img.onerror = (err) => {
      console.error("Error loading image in rotateImage:", err);
      reject(err);
    };
    img.src = imageDataUrl;
  });
}

async function generatePDF() {
  const downloadBtn = document.querySelector(".download-btn");
  const formContainer = document.getElementById("form-container");

  // --- Clone content BEFORE changing button ---
  const pdfContent = formContainer.cloneNode(true);
  console.log("Form content cloned.");

  // Now change button state
  downloadBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Generating...';
  downloadBtn.disabled = true;
  console.log("Button state changed to 'Generating...'");

  // --- Prepare Content for PDF (using the clone) ---
  const noPdfElements = pdfContent.querySelectorAll(".no-pdf, .back-btn");
  noPdfElements.forEach((el) => el.remove());

  const uploadedImageElement = document.querySelector("#image-preview img"); // Get from original DOM for data
  const originalImageDataUrl = uploadedImageElement
    ? uploadedImageElement.dataset.dataUrl
    : null;
  const imageOrientation = uploadedImageElement
    ? parseInt(uploadedImageElement.dataset.orientation || "1")
    : 1;

  // --- Add PDF-specific Styles ---
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    body { font-family: Arial, sans-serif; font-size: 6pt; margin: 0; padding: 0; background-color: white; }
    #form-container { width: 794px; padding: 20px; margin: 0; background: white; box-sizing: border-box; border: none; box-shadow: none; overflow: hidden; }
    .form-section { margin-bottom: 10pt; padding: 8pt; border: 1px solid #ddd; page-break-inside: avoid; }
    .section-title, .topic-header { font-size: 8pt; font-weight: bold; margin-bottom: 6pt; }
    .attendee-group { display: flex; flex-direction: row; align-items: center; margin-bottom: 4px; }
    .attendee-group .input-group { display: flex; flex-direction: row; align-items: center; margin-right: 8px; margin-bottom: 0; }
    .attendee-group .input-group label { margin-right: 4px; }
    .topic-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .topic-item span { flex-grow: 1; margin-right: 10px; }
    input[type="radio"], input[type="checkbox"] { width: 10px; height: 10px; margin-left: 5px; vertical-align: middle; }
  `;
  document.head.appendChild(styleElement);

  // Temporarily append clone for rendering
  pdfContent.style.position = "absolute";
  pdfContent.style.left = "-9999px";
  pdfContent.style.top = "0";
  document.body.appendChild(pdfContent);

  console.log("Starting PDF generation process...");

  // --- Use setTimeout for explicit delay ---
  setTimeout(async () => {
    try {
      // --- Generate Canvas from Form Content ---
      console.log("Starting html2canvas after delay...");
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
      console.log("html2canvas finished.");

      // --- Create PDF Document ---
      const formImgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pdfWidth - 2 * margin;
      const pageInnerHeight = pdfHeight - 2 * margin;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const canvasAspectRatio = canvasWidth / canvasHeight;
      const totalPdfImageHeight = contentWidth / canvasAspectRatio;

      console.log(
        `PDF Page: ${pdfWidth}x${pdfHeight}mm, Content Width: ${contentWidth}mm, Page Inner Height: ${pageInnerHeight}mm`
      );
      console.log(
        `Canvas: ${canvasWidth}x${canvasHeight}px, Total PDF Image Height: ${totalPdfImageHeight}mm`
      );

      // --- Add Form Content Pages ---
      let position = 0;
      let sourceY_px = 0;
      let currentPage = 1;

      while (position < totalPdfImageHeight) {
        if (currentPage > 1) {
          pdf.addPage();
        }
        let sliceHeight_mm = Math.min(
          pageInnerHeight,
          totalPdfImageHeight - position
        );
        let sliceHeight_px =
          (sliceHeight_mm / totalPdfImageHeight) * canvasHeight;

        if (sliceHeight_px <= 0) {
          console.warn("Slice height <= 0 px. Breaking loop.");
          break;
        }

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvasWidth;
        tempCanvas.height = sliceHeight_px;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.drawImage(
          canvas,
          0,
          sourceY_px,
          canvasWidth,
          sliceHeight_px,
          0,
          0,
          canvasWidth,
          sliceHeight_px
        );
        const sliceImgData = tempCanvas.toDataURL("image/jpeg", 0.95);

        pdf.addImage(
          sliceImgData,
          "JPEG",
          margin,
          margin,
          contentWidth,
          sliceHeight_mm
        );
        console.log(
          `Added page ${currentPage}, Slice Height: ${sliceHeight_mm}mm, Source Y: ${sourceY_px}px`
        );

        position += sliceHeight_mm;
        sourceY_px += sliceHeight_px;
        currentPage++;
      }

      // --- Add Uploaded Image Conditionally ---
      let finalYOnLastPage = margin + (totalPdfImageHeight % pageInnerHeight);
      if (
        totalPdfImageHeight > 0 &&
        Math.abs(totalPdfImageHeight % pageInnerHeight) < 0.01
      ) {
        finalYOnLastPage = pdfHeight - margin;
      } else if (totalPdfImageHeight < pageInnerHeight) {
        finalYOnLastPage = margin + totalPdfImageHeight;
      }
      console.log(
        `Content ends at y=${finalYOnLastPage}mm on page ${pdf.internal.getNumberOfPages()}`
      );

      if (originalImageDataUrl) {
        console.log("Processing uploaded image (Rotation aware)...");
        try {
          const rotatedImageDataUrl = await rotateImage(
            originalImageDataUrl,
            imageOrientation
          );
          console.log("Image rotation processing complete.");

          const imgProps = pdf.getImageProperties(rotatedImageDataUrl);
          const imgAspectRatio = imgProps.width / imgProps.height;

          let imgPdfWidth = contentWidth;
          let imgPdfHeight = imgPdfWidth / imgAspectRatio;

          const maxImgHeight = pageInnerHeight;
          if (imgPdfHeight > maxImgHeight) {
            imgPdfHeight = maxImgHeight;
            imgPdfWidth = imgPdfHeight * imgAspectRatio;
          }
          if (imgPdfWidth > contentWidth) {
            imgPdfWidth = contentWidth;
            imgPdfHeight = imgPdfWidth / imgAspectRatio;
          }

          const remainingSpace = pdfHeight - finalYOnLastPage - margin;
          console.log(
            `Required image height: ${imgPdfHeight}mm, Remaining space: ${remainingSpace}mm`
          );

          let imageYPos = 0;
          let targetPage = pdf.internal.getNumberOfPages();

          if (imgPdfHeight + 5 <= remainingSpace) {
            imageYPos = finalYOnLastPage + 5;
            pdf.setPage(targetPage);
            console.log(
              `Adding image to current page ${targetPage} at y=${imageYPos}`
            );
          } else {
            pdf.addPage();
            targetPage++;
            imageYPos = margin;
            console.log(
              `Adding image to new page ${targetPage} at y=${imageYPos}`
            );
          }

          const imageXPos = margin + (contentWidth - imgPdfWidth) / 2;
          pdf.addImage(
            rotatedImageDataUrl,
            imgProps.fileType,
            imageXPos,
            imageYPos,
            imgPdfWidth,
            imgPdfHeight
          );
          console.log("Uploaded image added.");
        } catch (imgError) {
          console.error("Error processing or adding uploaded image:", imgError);
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
  }, 100); // 100ms delay before starting html2canvas
}
