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
        img.src = readerEvent.target.result;
        img.style.maxWidth = "100%";
        img.style.maxHeight = "200pt";
        img.setAttribute("data-pdf-src", readerEvent.target.result); // Store data URL for PDF use
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
  // Remove elements not needed in PDF (including the original image upload section)
  const noPdfElements = pdfContent.querySelectorAll(".no-pdf, .back-btn");
  noPdfElements.forEach((el) => el.remove());

  // Get image data URL if image was uploaded
  const uploadedImageElement = document.querySelector("#image-preview img");
  const imageDataUrl = uploadedImageElement
    ? uploadedImageElement.getAttribute("data-pdf-src")
    : null;

  // --- Add PDF-specific Styles ---
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    body { font-family: Arial, sans-serif; font-size: 6pt; margin: 0; padding: 0; background-color: white; }
    #form-container { width: 794px; padding: 20px; margin: 0; background: white; box-sizing: border-box; border: none; box-shadow: none; }
    .form-section { margin-bottom: 10pt; padding: 8pt; border: 1px solid #ddd; page-break-inside: avoid; } /* Reduced margins/padding slightly */
    .section-title, .topic-header { font-size: 8pt; font-weight: bold; margin-bottom: 6pt; }
    .attendee-group { display: flex; flex-direction: row; align-items: center; margin-bottom: 4px; }
    .attendee-group .input-group { display: flex; flex-direction: row; align-items: center; margin-right: 8px; margin-bottom: 0; }
    .attendee-group .input-group label { margin-right: 4px; }
    .topic-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .topic-item span { flex-grow: 1; margin-right: 10px; }
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
    // --- Generate Canvas from Form Content (excluding image section) ---
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
    // const contentHeight = pdfHeight - 2 * margin; // Not directly used for image height calculation

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const canvasAspectRatio = canvasWidth / canvasHeight;

    // Calculate image dimensions to fit content width
    const imgWidth = contentWidth;
    const imgHeight = imgWidth / canvasAspectRatio;

    let position = 0;
    let heightLeft = imgHeight;

    console.log(
      `PDF Page: ${pdfWidth}x${pdfHeight}mm, Content Width: ${contentWidth}mm`
    );
    console.log(
      `Canvas: ${canvasWidth}x${canvasHeight}px, Calculated PDF Image Height: ${imgHeight}mm`
    );

    // --- Add Form Content Pages ---
    pdf.addImage(
      formImgData,
      "JPEG",
      margin,
      margin + position,
      imgWidth,
      imgHeight
    );
    heightLeft -= pdfHeight - 2 * margin; // Subtract usable page height
    console.log(`Added first page. Height left: ${heightLeft}mm`);

    while (heightLeft > 0) {
      position -= pdfHeight - 2 * margin; // Move the slice window up
      pdf.addPage();
      pdf.addImage(
        formImgData,
        "JPEG",
        margin,
        margin + position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pdfHeight - 2 * margin;
      console.log(`Added new page. Height left: ${heightLeft}mm`);
    }

    // --- Add Uploaded Image (if exists) on a new page ---
    if (imageDataUrl) {
      console.log("Adding uploaded image to PDF...");
      try {
        const imgProps = pdf.getImageProperties(imageDataUrl);
        const imgAspectRatio = imgProps.width / imgProps.height;
        let imgPdfWidth = contentWidth;
        let imgPdfHeight = imgPdfWidth / imgAspectRatio;

        // Check if height exceeds available space, if so, scale by height
        const maxImgHeight = pdfHeight - 2 * margin;
        if (imgPdfHeight > maxImgHeight) {
          imgPdfHeight = maxImgHeight;
          imgPdfWidth = imgPdfHeight * imgAspectRatio;
        }

        // Center the image
        const xPos = margin + (contentWidth - imgPdfWidth) / 2;
        const yPos = margin; // Place at top margin

        pdf.addPage();
        pdf.addImage(
          imageDataUrl,
          imgProps.fileType,
          xPos,
          yPos,
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
