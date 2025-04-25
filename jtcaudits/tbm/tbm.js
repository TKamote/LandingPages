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

  // Create a clone of the form for PDF generation
  const formContainer = document.getElementById("form-container");
  const pdfContent = document.createElement("div");
  pdfContent.className = "pdf-container";
  
  // Create the PDF content structure based on the template
  // Title
  const titleElement = document.createElement("h1");
  titleElement.textContent = "Daily Toolbox Meeting for Summit";
  pdfContent.appendChild(titleElement);
  
  // Date section
  const dateSection = document.createElement("div");
  dateSection.className = "pdf-date-section";
  dateSection.innerHTML = `<span>Date: </span><span class="pdf-input">${document.getElementById("date").value || "[input: date]"}</span>`;
  pdfContent.appendChild(dateSection);
  
  // Briefing section
  const briefingSection = document.createElement("div");
  briefingSection.className = "pdf-section";
  
  const conductorName = document.getElementById("conductor").value || "[input: text]";
  const designation = document.getElementById("designation").value || "[input: text]";
  
  briefingSection.innerHTML = `
    <div class="pdf-section-title">Briefing Conducted By:</div>
    <div class="pdf-row">
      <span>${conductorName}</span>
      <span>Designation: ${designation}</span>
    </div>
    <div class="pdf-signature">[input: signature]</div>
  `;
  pdfContent.appendChild(briefingSection);
  
  // Attendees section
  const attendeesSection = document.createElement("div");
  attendeesSection.className = "pdf-section";
  attendeesSection.innerHTML = `<div class="pdf-section-title">Attendees:</div>`;
  
  const attendeeTable = document.createElement("table");
  attendeeTable.className = "pdf-table";
  
  // Table header
  attendeeTable.innerHTML = `
    <thead>
      <tr>
        <th>S/N</th>
        <th>Name</th>
        <th>WP /S-Pass/NRIC (****XXXX)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>${document.getElementById("attendee-name-1").value || "[input: text]"}</td>
        <td>${document.getElementById("attendee-id-1").value || "[input: text]"}</td>
      </tr>
      <tr>
        <td>2</td>
        <td>${document.getElementById("attendee-name-2").value || "[input: text]"}</td>
        <td>${document.getElementById("attendee-id-2").value || "[input: text]"}</td>
      </tr>
      <tr>
        <td>3</td>
        <td>${document.getElementById("attendee-name-3").value || "[input: text]"}</td>
        <td>${document.getElementById("attendee-id-3").value || "[input: text]"}</td>
      </tr>
    </tbody>
  `;
  
  attendeesSection.appendChild(attendeeTable);
  pdfContent.appendChild(attendeesSection);
  
  // Topics section
  const topicsSection = document.createElement("div");
  topicsSection.className = "pdf-section";
  topicsSection.innerHTML = `<div class="pdf-section-title">Topic Discussed</div>`;
  
  // Create topic tables based on the form
  const topicData = [
    {
      title: "Slips, Trips, and Falls",
      items: [
        "Clean up spills immediately.",
        "Use warning signs for wet floors.",
        "Keep walkways clear of clutter."
      ]
    },
    {
      title: "Personal Protective Equipment (PPE)",
      items: [
        "Wear N95 mask for dusty works",
        "Wear anticult gloves for works that has rough surface and / or with sharp edges",
        "Wear safety shoes",
        "Wear any other PPE as per RA of specific work"
      ]
    },
    {
      title: "Electrical Safety",
      items: [
        "Check that extension cords have no damage.",
        "Avoid overloading electrical outlets by using hi jet or pressure washer on ordinary power points (13A).",
        "Use ELCB when plugging drills, power tools etc..",
        "Keep electrical equipment away from water."
      ]
    },
    {
      title: "Fire Prevention and Preparedness",
      items: [
        "Know the emergency evacuation route.",
        "Keep flammable materials away from heat sources.",
        "Ensure you know your role in case of emergency. On 1st alarm be on standby, on 2nd alarm evacuate or as default."
      ]
    },
    {
      title: "Work at Height",
      items: [
        "Be aware of any contractors that are doing WAH to ask them if they applied ePTW. If no ePTW ask to stop and feedback supervisor",
        "Ensure ladders are securely positioned.",
        "Maintain three points of contact on ladders.",
        "Ensure to use ladders that are EN 131 standard. Look for the sticker at the ladder to confirm."
      ]
    },
    {
      title: "Machinery Safety",
      items: [
        "Follow lockout/tagout procedures during maintenance.",
        "Wear personal protective equipment (PPE) specific to the machine."
      ]
    },
    {
      title: "Mental Well-being",
      items: [
        "Take regular breaks to reduce stress.",
        "Stay hydrated throughout the workday.",
        "Report concerns about mental health to supervisors."
      ]
    }
  ];

  topicData.forEach(topic => {
    const topicTable = document.createElement("table");
    topicTable.className = "pdf-topic-table";
    
    // Create topic header
    const topicHeader = document.createElement("tr");
    topicHeader.className = "pdf-topic-header";
    topicHeader.innerHTML = `
      <td colspan="2">${topic.title}</td>
      <td class="pdf-tick-column">Tick</td>
    `;
    topicTable.appendChild(topicHeader);
    
    // Create topic items
    topic.items.forEach(item => {
      const itemRow = document.createElement("tr");
      itemRow.className = "pdf-topic-item";
      itemRow.innerHTML = `
        <td colspan="2">${item}</td>
        <td class="pdf-checkbox">[input radio button: uncheck]</td>
      `;
      topicTable.appendChild(itemRow);
    });
    
    topicsSection.appendChild(topicTable);
  });
  
  pdfContent.appendChild(topicsSection);
  
  // Photo section
  const photoSection = document.createElement("div");
  photoSection.className = "pdf-section";
  photoSection.innerHTML = `<div class="pdf-section-title">Photo</div>`;
  
  // Check if there's an uploaded image
  const imagePreview = document.getElementById("image-preview");
  if (imagePreview.querySelector("img")) {
    const photoContent = document.createElement("div");
    photoContent.className = "pdf-photo";
    
    const img = imagePreview.querySelector("img").cloneNode(true);
    photoContent.appendChild(img);
    
    if (imagePreview.querySelector(".timestamp")) {
      const timestamp = document.createElement("div");
      timestamp.className = "pdf-timestamp";
      timestamp.textContent = imagePreview.querySelector(".timestamp").textContent;
      photoContent.appendChild(timestamp);
    }
    
    photoSection.appendChild(photoContent);
  } else {
    // Add placeholder text
    const photoPlaceholder = document.createElement("div");
    photoPlaceholder.className = "pdf-photo-placeholder";
    photoPlaceholder.textContent = "[input: image with time stamp, landscape image 4:3 aspect ratio]";
    photoSection.appendChild(photoPlaceholder);
  }
  
  pdfContent.appendChild(photoSection);
  
  // Add PDF-specific styles
  const pdfStyle = document.createElement("style");
  pdfStyle.textContent = `
    .pdf-container {
      font-family: Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.3;
      padding: 10mm;
    }
    h1 {
      font-size: 14pt;
      text-align: center;
      margin: 0 0 10pt 0;
      font-weight: bold;
    }
    .pdf-date-section {
      text-align: right;
      margin-bottom: 10pt;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5pt;
    }
    .pdf-input {
      border-bottom: 1px solid #000;
      padding: 0 5pt;
    }
    .pdf-section {
      margin-bottom: 10pt;
    }
    .pdf-section-title {
      font-weight: bold;
      margin-bottom: 5pt;
      font-size: 11pt;
    }
    .pdf-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5pt;
    }
    .pdf-signature {
      height: 30pt;
      border-bottom: 1px solid #000;
      margin: 10pt 0;
    }
    .pdf-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10pt;
      font-size: 9pt;
    }
    .pdf-table th, .pdf-table td {
      border: 1px solid #000;
      padding: 3pt 5pt;
      text-align: left;
    }
    .pdf-topic-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8pt;
      font-size: 9pt;
    }
    .pdf-topic-header {
      font-weight: bold;
      background-color: #f8f8f8;
    }
    .pdf-topic-header td {
      border: 1px solid #000;
      padding: 3pt 5pt;
    }
    .pdf-topic-item td {
      border: 1px solid #000;
      padding: 2pt 5pt;
    }
    .pdf-tick-column {
      width: 40pt;
      text-align: center;
    }
    .pdf-checkbox {
      text-align: center;
    }
    .pdf-photo {
      text-align: center;
      max-height: 150pt;
      overflow: hidden;
    }
    .pdf-photo img {
      max-width: 100%;
      max-height: 140pt;
    }
    .pdf-timestamp {
      font-size: 8pt;
      text-align: right;
      font-style: italic;
      margin-top: 2pt;
    }
    .pdf-photo-placeholder {
      height: 100pt;
      border: 1px dashed #999;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-style: italic;
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
    margin: [10, 10, 10, 10], // Smaller margins to fit on 1.5-1.75 pages
    filename: "TBM_Report_" + new Date().toISOString().split("T")[0] + ".pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ['avoid-all'] } // Try to avoid breaking elements across pages
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