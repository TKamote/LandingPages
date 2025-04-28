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

  // Convert the form content to HTML table
  let tableHTML = "<table style='width: 100%; border-collapse: collapse;'>";

  // Iterate through each form section
  const formSections = pdfContent.querySelectorAll(".form-section");
  formSections.forEach((section) => {
    tableHTML += "<tr><td style='padding: 8px; border: 1px solid #ddd;'>";
    tableHTML += section.innerHTML;
    tableHTML += "</td></tr>";
  });

  tableHTML += "</table>";

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
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
     .section-title {
      font-size: 8pt; /* Increased section title font size */
    }
    .topic-header {
      font-size: 8pt; /* Increased topic header font size */
      font-weight: bold;
      margin-bottom: 8pt;
    }
  `;
  document.head.appendChild(styleElement);

  // Generate PDF
  html2canvas(pdfContent, {
    scale: 2,
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
  }).then((canvas) => {
    const imgData = canvas.toDataURL("image/jpeg");

    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
    downloadBtn.disabled = false;
    document.head.removeChild(styleElement);
    pdf.save(`TBM_Report_${new Date().toLocaleDateString("en-CA")}.pdf`);
  });
}
