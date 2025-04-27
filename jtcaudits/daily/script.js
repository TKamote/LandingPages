document.addEventListener("DOMContentLoaded", function () {
  // Set today's date by default
  const dateInput = document.getElementById("inspection-date");
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;

  const addButton = document.getElementById("add-inspection-btn");
  const inspectionContainer = document.getElementById("inspection");
  let cardCount = 0;

  // Add inspection card handler
  addButton.addEventListener("click", function () {
    const newCard = document.createElement("div");
    newCard.className = "inspection-card";
    newCard.innerHTML = `
            <div class="select-group">
                <label for="location-${cardCount}">Location</label>
                <select id="location-${cardCount}" required>
                    <option value="" disabled selected>Select location</option>
                    <option value="B3">B3</option>
                    <option value="B2">B2</option>
                    <option value="B1">B1</option>
                    <option value="L1">L1</option>
                    <option value="L3">L3</option>
                    <option value="L4">L4</option>
                    <option value="L13">L13</option>
                    <option value="Roof">Roof</option>
                </select>
            </div>

            <div class="select-group">
                <label for="status-${cardCount}">Status</label>
                <select id="status-${cardCount}" required>
                    <option value="" disabled selected>Select status</option>
                    <option value="Good">Good</option>
                    <option value="Need Repair">Need Repair</option>
                    <option value="Under Repair">Under Repair</option>
                    <option value="Critical">Critical</option>
                </select>
            </div>

            <div class="photo-section">
                <label>Photo Evidence</label>
                <button type="button" id="upload-btn-${cardCount}" class="upload-btn">
                    <i class="fas fa-camera"></i> Take Photo or Choose from Gallery
                </button>
                <input type="file" id="photo-input-${cardCount}" accept="image/*" style="display: none;" />
                <div class="photo-preview" id="photo-preview-${cardCount}" style="display: none;">
                    <div class="preview-container">
                        <img id="preview-image-${cardCount}" src="" alt="Preview" />
                        <div id="timestamp-${cardCount}" class="timestamp"></div>
                    </div>
                </div>
            </div>
        `;

    inspectionContainer.appendChild(newCard);
    setupPhotoUpload(cardCount);
    cardCount++;
  });

  function setupPhotoUpload(id) {
    const uploadBtn = document.getElementById(`upload-btn-${id}`);
    const fileInput = document.getElementById(`photo-input-${id}`);
    const preview = document.getElementById(`photo-preview-${id}`);
    const previewImage = document.getElementById(`preview-image-${id}`);
    const timestamp = document.getElementById(`timestamp-${id}`);

    uploadBtn.addEventListener("click", (e) => {
      e.preventDefault();
      fileInput.click();
    });

    fileInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (e) {
          previewImage.src = e.target.result;
          preview.style.display = "block";

          // Add timestamp
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
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please select an image file");
      }
    });
  }
});
