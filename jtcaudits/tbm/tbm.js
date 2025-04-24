// Initialize date input with current date
// Set today's date by default
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
  
    // Create a clone of the form for PDF generation
    const formContainer = document.getElementById("form-container");
    const pdfContent = formContainer.cloneNode(true);
    
    // Remove elements with no-pdf class
    const noPdfElements = pdfContent.querySelectorAll(".no-pdf");
    noPdfElements.forEach(el => el.remove());
    
    // Remove back button from PDF
    const backBtn = pdfContent.querySelector(".back-btn");
    if (backBtn) backBtn.remove();
    
    // Remove download button from PDF
    const downloadBtnInPdf = pdfContent.querySelector(".download-btn");
    if (downloadBtnInPdf) downloadBtnInPdf.remove();
  
    // Add PDF-specific styles
    const pdfStyle = document.createElement("style");
    pdfStyle.textContent = `
      body {
        font-size: 10px;
      }
      h3 {
        font-size: 12px;
        margin: 5px 0;
      }
      .section-title {
        font-size: 11px;
        font-weight: bold;
      }
      .input-group {
        margin-bottom: 5px;
      }
      .topic-header {
        font-size: 10px;
      }
      .topic-item {
        font-size: 9px;
      }
    `;
    pdfContent.appendChild(pdfStyle);
  
    // Create a temporary container
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.appendChild(pdfContent);
    document.body.appendChild(tempContainer);
  
    const opt = {
      margin: [10, 10, 10, 10],
      filename: "TBM_Report_" + new Date().toISOString().split("T")[0] + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };
  
    // Generate PDF
    html2pdf()
      .from(pdfContent)
      .set(opt)
      .save()
      .then(() => {
        // Remove temporary container after PDF generation
        document.body.removeChild(tempContainer);
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
        downloadBtn.disabled = false;
      })
      .catch((error) => {
        console.error("PDF generation failed:", error);
        document.body.removeChild(tempContainer);
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
        downloadBtn.disabled = false;
        alert("Failed to generate PDF. Please try again.");
      });
  }