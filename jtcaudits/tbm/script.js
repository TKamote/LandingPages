// Set current date on page load
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("date").valueAsDate = new Date();
});

// Handle image upload and preview
document
  .getElementById("image-upload")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    const preview = document.getElementById("image-preview");
    preview.innerHTML = "";

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });

// PDF Generation
function generatePDF() {
  // Get and modify download button
  const downloadBtn = document.querySelector(".download-btn");
  downloadBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Generating...';
  downloadBtn.disabled = true;

  // Get the form container
  const element = document.getElementById("form-container");

  // Hide elements not needed in PDF
  const backBtn = document.querySelector(".back-btn");
  const downloadBtnTemp = document.querySelector(".download-btn");
  backBtn.style.display = "none";
  downloadBtnTemp.style.display = "none";

  // Add PDF-specific styles
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    body {
    margin: 0 !important; /* Remove body margin to prevent interference */
    padding: 0 !important;
}
  #form-container {
      max-width: 210mm !important; /* A4 width */
      margin: 0 auto !important;   /* Center the form */
      padding: 10mm !important;
      box-sizing: border-box !important; /* Include padding in width */
    }
    .attendee-group {
      display: flex !important;
      flex-direction: row !important;
      gap: 10px !important;
      margin-bottom: 8px !important;
      padding: 8px !important;
      background-color: yellow !important; 
      width: 100% !important; /* Ensure full width within container */
    }
    .input-group {
      flex: 1 !important;
      min-width: 0 !important;
      background-color: green !important; 
    }
    .form-input {
      width: 100% !important;
    }
    .topic-group {
      margin-right: 0 !important;
      background-color: brown !important; 
    }
  `;
  document.head.appendChild(styleElement);

  // Configure PDF options
  const opt = {
    margin: [15, 15, 15, 15],
    filename: `TBM_Report_${new Date().toISOString().split("T")[0]}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 1.5,
      useCORS: true,
      scrollY: 0,
      // width: 794,
      width: 1654,
      // windowWidth: 794,
      windowWidth: 1654,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
    download: true, // Force download instead of opening in new tab
  };

  // Generate PDF
  html2pdf()
    .from(element)
    .set(opt)
    .save()
    .then(() => {
      // Restore hidden elements
      backBtn.style.display = "";
      downloadBtnTemp.style.display = "";
      // Reset button
      downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
      downloadBtn.disabled = false;
      document.head.removeChild(styleElement);
    })
    .catch((err) => {
      console.error("PDF generation failed:", err);
      // Restore hidden elements
      backBtn.style.display = "";
      downloadBtnTemp.style.display = "";
      // Reset button
      downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
      downloadBtn.disabled = false;
      document.head.removeChild(styleElement);
      alert("Failed to generate PDF. Please try again.");
    });
}

// Attach event listener to download button
document.querySelector(".download-btn").addEventListener("click", generatePDF);
