// Initialize date input with current date
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("date").valueAsDate = new Date();
});

// Handle image upload and preview
document
  .getElementById("image-upload")
  .addEventListener("change", function (e) {
    const preview = document.getElementById("image-preview");
    preview.innerHTML = "";

    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        preview.appendChild(img);

        // Add timestamp
        const timestamp = document.createElement("div");
        timestamp.className = "timestamp";
        timestamp.textContent = new Date().toLocaleString();
        preview.appendChild(timestamp);
      };
      reader.readAsDataURL(file);
    }
  });

// Generate PDF function
function generatePDF() {
  const downloadBtn = document.querySelector(".download-btn");
  downloadBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Generating...';
  downloadBtn.disabled = true;

  const element = document.getElementById("form-container");

  // Get A4 page dimensions in pixels (assuming 96 DPI)
  const a4Width = 794; // 210mm at 96 DPI
  const a4Height = 1123; // 297mm at 96 DPI

  // Updated options for full A4 page rendering
  const opt = {
    margin: 15,
    filename: "TBM_Report.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 1,
      scrollY: 0,
      useCORS: true,
      width: a4Width - 30, // Account for margins
      windowWidth: a4Width - 30,
      foreignObjectRendering: true,
      removeContainer: true,
    },
    jsPDF: {
      unit: "px",
      format: "a4",
      orientation: "portrait",
      hotfixes: ["px_scaling"],
    },
  };

  // Generate PDF
  html2pdf()
    .from(element)
    .set(opt)
    .save()
    .then(() => {
      downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
      downloadBtn.disabled = false;
    })
    .catch((err) => {
      console.error("PDF generation failed:", err);
      downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
      downloadBtn.disabled = false;
      alert("Failed to generate PDF. Please try again.");
    });
}
