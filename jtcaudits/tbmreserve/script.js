// Set current date and time on page load
document.addEventListener("DOMContentLoaded", function () {
  const now = new Date();
  // Format: YYYY-MM-DD HH:mm
  const dateStr = now.toLocaleDateString("en-CA"); // YYYY-MM-DD
  const timeStr = now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  document.getElementById("date").value = `${dateStr} ${timeStr}`;

  const uploadBtn = document.getElementById("upload-btn");
  const fileInput = document.getElementById("image-upload");
  const preview = document.getElementById("image-preview");

  uploadBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    preview.innerHTML = "";

    // Check if file is an image
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        preview.appendChild(img);

        // Add timestamp with date and time
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
    } else {
      alert("Please select an image file only");
    }
  });
});

// PDF Generation
function generatePDF() {
  // Get the form container
  const element = document.getElementById("form-container");

  // Hide elements not needed in PDF
  const backBtn = document.querySelector(".back-btn");
  const uploadBtn = document.querySelector(".upload-btn");
  const downloadBtnTemp = document.querySelector(".download-btn");
  backBtn.style.display = "none";
  uploadBtn.style.display = "none";
  downloadBtnTemp.style.display = "none";

  // Add PDF-specific styles
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    body {
    margin: 0 !important; /* Remove body margin to prevent interference */
    padding: 0 !important;
    font-size: 8pt !important; /* Increased font size slightly */
    line-height: 1.1 !important; /* Increased line height for vertical space 
}
  #form-container {
      max-width: 250mm !important; /* A4 width */
      margin: 0 auto !important;   /* Center the form */
      padding: 15mm !important;
      box-sizing: border-box !important; /* Include padding in width */
    }
    .attendee-group {
      display: flex !important;
      flex-direction: row !important;
      gap: 10px !important;
      margin-bottom: 8px !important;
      padding: 10px !important;
      width: 100% !important; /* Ensure full width within container */
    }
    .input-group {
      flex: 1 !important;
      min-width: 0 !important;
    }
    .attendee {
      width: 20px !important;
      } 
    .form-input {
      width: 100% !important;
    }
    .topic-group {
      margin-right: 0 !important;
    }
    .topic-item {
      font-size: 8pt !important;  /* Match the body font size */
      line-height: 1.1 !important;
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
      width: 794,
      // width: 654,
      windowWidth: 794,
      // windowWidth: 654,
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
