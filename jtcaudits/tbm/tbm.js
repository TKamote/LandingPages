// Set today's date as default
document.getElementById("date").valueAsDate = new Date();

// Set up signature pad
document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("signature-canvas");
  const signaturePad = setupSignaturePad(canvas);

  document.getElementById("clear-sig").addEventListener("click", function () {
    signaturePad.clear();
  });
});

function setupSignaturePad(canvas) {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  const ctx = canvas.getContext("2d");
  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseout", stopDrawing);

  // Touch events
  canvas.addEventListener("touchstart", function (e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    canvas.dispatchEvent(mouseEvent);
  });

  canvas.addEventListener("touchmove", function (e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    canvas.dispatchEvent(mouseEvent);
  });

  canvas.addEventListener("touchend", function (e) {
    e.preventDefault();
    const mouseEvent = new MouseEvent("mouseup");
    canvas.dispatchEvent(mouseEvent);
  });

  function startDrawing(e) {
    drawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
  }

  function draw(e) {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastX = x;
    lastY = y;
  }

  function stopDrawing() {
    drawing = false;
  }

  return {
    clear: function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    getData: function () {
      return canvas.toDataURL();
    },
  };
}

// Add attendee row
function addAttendeeRow() {
  const table = document
    .getElementById("attendees-table")
    .getElementsByTagName("tbody")[0];
  const rowCount = table.rows.length;
  const newRow = table.insertRow();

  // S/N cell
  const cell1 = newRow.insertCell(0);
  cell1.textContent = rowCount + 1;

  // Name cell
  const cell2 = newRow.insertCell(1);
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.name = "attendee-name[]";
  cell2.appendChild(nameInput);

  // ID cell
  const cell3 = newRow.insertCell(2);
  const idInput = document.createElement("input");
  idInput.type = "text";
  idInput.name = "attendee-id[]";
  cell3.appendChild(idInput);
}

// Handle image upload and add timestamp
document
  .getElementById("image-upload")
  .addEventListener("change", function (e) {
    const preview = document.getElementById("image-preview");
    preview.innerHTML = "";

    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = function (event) {
        const img = document.createElement("img");
        img.src = event.target.result;
        preview.appendChild(img);

        // Add timestamp
        const timestamp = document.createElement("div");
        timestamp.className = "timestamp";
        const now = new Date();
        timestamp.textContent = now.toLocaleString();
        preview.appendChild(timestamp);
      };

      reader.readAsDataURL(file);
    }
  });

// Download as PDF
function downloadPDF() {
  // Create a clone of the form for PDF generation
  const formContainer = document.getElementById("form-container");
  const pdfContent = formContainer.cloneNode(true);

  // Add PDF-specific styles
  pdfContent.classList.add("pdf-content");

  // Remove elements with no-pdf class
  const noPdfElements = pdfContent.querySelectorAll(".no-pdf");
  noPdfElements.forEach((el) => el.remove());

  // Capture signature if exists
  const signatureCanvas = document.getElementById("signature-canvas");
  if (signatureCanvas) {
    const signatureImage = document.createElement("img");
    signatureImage.src = signatureCanvas.toDataURL();
    signatureImage.style.maxWidth = "100%";
    signatureImage.style.maxHeight = "100%";

    const signaturePad = pdfContent.querySelector("#signature-pad");
    if (signaturePad) {
      signaturePad.innerHTML = "";
      signaturePad.appendChild(signatureImage.cloneNode(true));
    }
  }

  // Generate PDF
  const opt = {
    margin: [10, 10, 10, 10],
    filename:
      "Toolbox_Meeting_" + new Date().toISOString().split("T")[0] + ".pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  // Create a temporary container
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "absolute";
  tempContainer.style.left = "-9999px";
  tempContainer.appendChild(pdfContent);
  document.body.appendChild(tempContainer);

  // Generate PDF
  html2pdf()
    .from(pdfContent)
    .set(opt)
    .save()
    .then(() => {
      // Remove temporary container after PDF generation
      document.body.removeChild(tempContainer);
    });
}
