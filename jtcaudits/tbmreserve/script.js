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
        img.style.maxWidth = "100%";
        img.style.maxHeight = "300px";
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
  downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
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

  // Add photo from preview if available
  const imagePreview = document.getElementById("image-preview");
  const photoElement = document.createElement("div");
  photoElement.className = "pdf-photo-section";
  
  if (imagePreview.querySelector("img")) {
    const photoTitle = document.createElement("div");
    photoTitle.className = "section-title";
    photoTitle.textContent = "Photo";
    
    const photoContent = document.createElement("div");
    photoContent.className = "photo-container";
    
    const img = imagePreview.querySelector("img").cloneNode(true);
    img.style.maxWidth = "100%";
    img.style.maxHeight = "200px";
    photoContent.appendChild(img);
    
    if (imagePreview.querySelector(".timestamp")) {
      const timestamp = document.createElement("div");
      timestamp.className = "timestamp";
      timestamp.textContent = imagePreview.querySelector(".timestamp").textContent;
      photoContent.appendChild(timestamp);
    }
    
    photoElement.appendChild(photoTitle);
    photoElement.appendChild(photoContent);
    pdfContent.appendChild(photoElement);
  }

  // Add PDF-specific styles
  const pdfStyle = document.createElement("style");
  pdfStyle.textContent = `
    body {
      font-family: Arial, sans-serif;
      font-size: 10px;
      line-height: 1.3;
    }
    h3 {
      font-size: 14px;
      text-align: center;
      margin: 5px 0 15px 0;
      font-weight: bold;
    }
    .form-section {
      margin-bottom: 15px;
      border: 1px solid #ddd;
      padding: 8px;
      border-radius: 4px;
    }
    .form-section-date {
      margin-bottom: 10px;
    }
    .section-title {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 5px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 3px;
    }
    .input-group {
      margin-bottom: 5px;
      display: flex;
      align-items: center;
    }
    .input-group label {
      min-width: 80px;
      font-weight: bold;
    }
    .form-input {
      border: none;
      border-bottom: 1px solid #999;
      padding: 2px 0;
      background: transparent;
    }
    .attendee-group {
      display: flex;
      margin-bottom: 5px;
      gap: 10px;
    }
    .topic-group {
      margin-bottom: 10px;
    }
    .topic-header {
      font-size: 11px;
      font-weight: bold;
      margin-bottom: 3px;
    }
    .topic-items {
      padding-left: 10px;
    }
    .topic-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      margin-bottom: 2px;
    }
    .topic-item span {
      flex: 1;
    }
    .topic-item input[type="radio"] {
      margin-left: 10px;
    }
    .signature-field {
      height: 40px;
      border-bottom: 1px solid #999;
      margin-top: 5px;
      margin-bottom: 10px;
    }
    .pdf-photo-section {
      margin-top: 15px;
    }
    .photo-container {
      text-align: center;
      margin-top: 5px;
    }
    .timestamp {
      font-size: 8px;
      font-style: italic;
      text-align: right;
      margin-top: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    table th, table td {
      border: 1px solid #ddd;
      padding: 4px;
      text-align: left;
      font-size: 9px;
    }
    table th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    .tick-column {
      width: 40px;
      text-align: center;
    }
  `;
  pdfContent.appendChild(pdfStyle);

  // Transform the attendees section into a table for better formatting
  const attendeesSection = pdfContent.querySelector('.form-section:nth-of-type(2)');
  if (attendeesSection) {
    const attendeeGroups = attendeesSection.querySelectorAll('.attendee-group');
    if (attendeeGroups.length > 0) {
      // Create table
      const table = document.createElement('table');
      
      // Create header row
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      ['S/N', 'Name', 'WP /S-Pass/NRIC (****XXXX)'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Create body rows
      const tbody = document.createElement('tbody');
      attendeeGroups.forEach(group => {
        const row = document.createElement('tr');
        
        // S/N
        const serialTd = document.createElement('td');
        const serialInput = group.querySelector('input[id^="serial-"]');
        serialTd.textContent = serialInput ? serialInput.value : '';
        row.appendChild(serialTd);
        
        // Name
        const nameTd = document.createElement('td');
        const nameInput = group.querySelector('input[id^="attendee-name-"]');
        nameTd.textContent = nameInput ? nameInput.value : '';
        row.appendChild(nameTd);
        
        // ID
        const idTd = document.createElement('td');
        const idInput = group.querySelector('input[id^="attendee-id-"]');
        idTd.textContent = idInput ? idInput.value : '';
        row.appendChild(idTd);
        
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
      
      // Replace the attendee groups with the table
      while (attendeesSection.children.length > 1) {
        attendeesSection.removeChild(attendeesSection.lastChild);
      }
      attendeesSection.appendChild(table);
    }
  }

  // Add a signature field to the conductor section
  const conductorSection = pdfContent.querySelector('.form-section:first-of-type');
  if (conductorSection) {
    const signatureDiv = document.createElement('div');
    signatureDiv.className = 'input-group';
    
    const signatureLabel = document.createElement('label');
    signatureLabel.textContent = 'Signature:';
    signatureDiv.appendChild(signatureLabel);
    
    const signatureField = document.createElement('div');
    signatureField.className = 'signature-field';
    signatureDiv.appendChild(signatureField);
    
    conductorSection.appendChild(signatureDiv);
  }

  // Modify topic sections to add "Tick" column header
  const topicGroups = pdfContent.querySelectorAll('.topic-group');
  topicGroups.forEach(group => {
    const header = group.querySelector('.topic-header');
    if (header) {
      const headerContainer = document.createElement('div');
      headerContainer.style.display = 'flex';
      headerContainer.style.justifyContent = 'space-between';
      headerContainer.style.borderBottom = '1px solid #ddd';
      headerContainer.style.marginBottom = '5px';
      
      const headerText = document.createElement('div');
      headerText.textContent = header.textContent;
      headerText.style.fontWeight = 'bold';
      
      const tickHeader = document.createElement('div');
      tickHeader.textContent = 'Tick';
      tickHeader.style.width = '40px';
      tickHeader.style.textAlign = 'center';
      tickHeader.style.fontWeight = 'bold';
      
      headerContainer.appendChild(headerText);
      headerContainer.appendChild(tickHeader);
      
      header.parentNode.replaceChild(headerContainer, header);
    }
  });

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
