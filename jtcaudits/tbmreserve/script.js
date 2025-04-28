// Initialize date input with current date
document.addEventListener("DOMContentLoaded", function () {
  // Set date
  document.getElementById("date").valueAsDate = new Date();

  // Setup photo upload functionality
  const uploadBtn = document.getElementById("upload-btn");
  const fileInput = document.getElementById("image-upload");
  const preview = document.getElementById("image-preview");

  // Add click handler for the upload button
  uploadBtn.addEventListener("click", (e) => {
    e.preventDefault();
    fileInput.click();
  });

  // Handle file selection
  fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    preview.innerHTML = "";

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        preview.appendChild(img);

        // Add timestamp
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

function generatePDF() {
  const downloadBtn = document.querySelector(".download-btn");
  downloadBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Generating...';
  downloadBtn.disabled = true;

  // Create a clone of the form for PDF generation
  const formContainer = document.getElementById("form-container");
  const pdfContent = formContainer.cloneNode(true);

  // Remove elements with no-pdf class
  const noPdfElements = pdfContent.getElementsByClassName("no-pdf");
  while (noPdfElements.length > 0) {
    noPdfElements[0].parentNode.removeChild(noPdfElements[0]);
  }

  // Remove the back button
  const backButton = pdfContent.querySelector(".back-btn");
  if (backButton) {
    backButton.parentNode.removeChild(backButton);
  }

  // Style attendees in a row
  const attendeeGroups = pdfContent.querySelectorAll(".attendee-group");
  attendeeGroups.forEach((group) => {
    group.style.display = "flex";
    group.style.flexDirection = "row";
    group.style.alignItems = "center";
    group.style.marginBottom = "5px";
  });

  // Style input groups in attendee groups
  const inputGroups = pdfContent.querySelectorAll(
    ".attendee-group .input-group"
  );
  inputGroups.forEach((group) => {
    group.style.display = "flex";
    group.style.flexDirection = "row";
    group.style.alignItems = "center";
    group.style.marginRight = "10px";
  });

  // Add page breaks
  const formSections = pdfContent.querySelectorAll(".form-section");
  formSections.forEach((section, index) => {
    if (index > 0) {
      section.style.pageBreakBefore = "always";
    }
  });

  // Add PDF-specific styles
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    @page {
      size: A4;
      margin: 0;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 6pt; /* Changed font size to 6pt */
      margin: 0;
      padding: 0;
    }
    #form-container {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      margin: 0;
      background: white;
      box-sizing: border-box;
    }
    .form-section {
      margin-bottom: 15pt;
      padding: 10pt;
      border: 1px solid #ddd;
    }
     .section-title {
      font-size: 8pt; /* Increased section title font size */
    }
    .topic-header {
      font-size: 8pt; /* Increased topic header font size */
      font-weight: bold;
      margin-bottom: 8pt;
    }
    .input-group {
      margin-bottom: 10pt;
    }
    .input-group label {
      display: block;
      margin-bottom: 5pt;
    }
    .form-input {
      width: 100%;
      padding: 8pt;
      border: 1px solid #ccc;
      box-sizing: border-box;
    }
    .topic-group {
      margin-bottom: 15pt;
    }
    .topic-item {
      margin-bottom: 5pt;
    }
    .image-preview img {
      max-width: 100%;
      max-height: 200pt;
    }
  `;
  document.head.appendChild(styleElement);

  const opt = {
    margin: 0,
    filename: `TBM_Report_${new Date().toLocaleDateString("en-CA")}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2 /* Changed scale to 2 */,
      useCORS: true,
      width: 794,
      windowWidth: 794,
      scrollX: 0,
      scrollY: 0,
      logging: true,
      letterRendering: true,
      useCanvas: true,
      // Add a timeout to wait for the image to load
      timeout: 60000, // 60 seconds
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
  };

  // Add a delay before generating the PDF to allow the image to load
  setTimeout(() => {
    // Check if the image is loaded
    const img = document.querySelector(".image-preview img");
    if (img && img.complete) {
      html2pdf()
        .from(pdfContent)
        .set(opt)
        .save()
        .then(() => {
          downloadBtn.innerHTML =
            '<i class="fas fa-download"></i> Download PDF';
          downloadBtn.disabled = false;
          document.head.removeChild(styleElement);
        })
        .catch((err) => {
          console.error("PDF generation failed:", err);
          downloadBtn.innerHTML =
            '<i class="fas fa-download"></i> Download PDF';
          downloadBtn.disabled = false;
          document.head.removeChild(styleElement);
          alert("Failed to generate PDF. Please try again.");
        });
    } else {
      console.log("Image not loaded yet, retrying...");
      downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
      downloadBtn.disabled = false;
      document.head.removeChild(styleElement);
      alert("Failed to generate PDF. Please try again.");
    }
  }, 3000); // Delay of 3 seconds
}
