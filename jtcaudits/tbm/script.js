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
  // Get the form container
  const element = document.getElementById("form-container");

  // Get and modify download button
  const downloadBtn = document.querySelector(".download-btn");
  downloadBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Generating...';
  downloadBtn.disabled = true;

  // Hide elements not needed in PDF
  const backBtn = document.querySelector(".back-btn");
  const downloadBtnTemp = document.querySelector(".download-btn");
  backBtn.style.display = "none";
  downloadBtnTemp.style.display = "none";

  // Configure PDF options
  const opt = {
    margin: 10,
    filename: `TBM_Report_${new Date().toISOString().split("T")[0]}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 1.5,
      useCORS: true,
      scrollY: 0,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
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
    })
    .catch((err) => {
      console.error("PDF generation failed:", err);
      // Restore hidden elements
      backBtn.style.display = "";
      downloadBtnTemp.style.display = "";
      // Reset button
      downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
      downloadBtn.disabled = false;
      alert("Failed to generate PDF. Please try again.");
    });
}

// Attach event listener to download button
document.querySelector(".download-btn").addEventListener("click", generatePDF);
