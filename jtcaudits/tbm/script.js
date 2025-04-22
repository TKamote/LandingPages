// Set today's date as default
document.getElementById("date").valueAsDate = new Date();

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

  // Signature cell
  const cell4 = newRow.insertCell(3);
  const sigBox = document.createElement("div");
  sigBox.className = "signature-box";
  cell4.appendChild(sigBox);
}

// Handle image upload and add timestamp
document
  .getElementById("image-upload")
  .addEventListener("change", function (e) {
    const preview = document.getElementById("image-preview");

    // Clear preview safely
    while (preview.firstChild) {
      preview.removeChild(preview.firstChild);
    }

    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = function (event) {
        // Create and append image
        const img = document.createElement("img");
        img.src = event.target.result;
        preview.appendChild(img);

        // Create and append timestamp
        const timestamp = document.createElement("div");
        timestamp.className = "timestamp";
        const now = new Date();
        timestamp.textContent = now.toLocaleString();
        preview.appendChild(timestamp);
      };

      reader.readAsDataURL(file);
    }
  });

// Print form
function printForm() {
  window.print();
}
