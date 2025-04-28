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

  // Add PDF-specific styles
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    body {
      margin: 0 !important;
      padding: 0 !important;
      font-size: 8pt !important;
      line-height: 1.1 !important;
    }
    #form-container {
      max-width: 250mm !important;
      margin: 0 auto !important;
      padding: 15mm !important;
      box-sizing: border-box !important;
    }
    .form-section {
      margin-bottom: 10pt !important;
      padding: 10pt !important;
    }
    .input-group {
      margin-bottom: 5pt !important;
    }
    .topic-group {
      margin-bottom: 8pt !important;
    }
    .topic-item {
      font-size: 8pt !important;
      line-height: 1.1 !important;
    }
    .topic-header {
      font-weight: bold !important;
      margin-bottom: 5pt !important;
    }
    .form-input {
      border: 1px solid #ccc !important;
      padding: 2pt !important;
    }
    .signature-field {
      height: 60pt !important;
      border: 1px dashed #ccc !important;
    }
  `;
  document.head.appendChild(styleElement);

  // Generate PDF options
  const opt = {
    margin: [15, 15, 15, 15],
    filename: `TBM_Report_${new Date().toLocaleDateString("en-CA")}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 1.5,
      useCORS: true,
      width: 794, // A4 width in pixels at 96 DPI
      windowWidth: 794,
      scrollX: 0,
      scrollY: 0,
      logging: true, // Helps debug rendering issues
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
  };

  // Generate PDF
  html2pdf()
    .from(pdfContent)
    .set(opt)
    .save()
    .then(() => {
      downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
      downloadBtn.disabled = false;
      document.head.removeChild(styleElement); // Clean up styles
    })
    .catch((err) => {
      console.error("PDF generation failed:", err);
      downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
      downloadBtn.disabled = false;
      document.head.removeChild(styleElement); // Clean up styles
      alert("Failed to generate PDF. Please try again.");
    });
}
