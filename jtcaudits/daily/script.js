// Handle photo upload and preview
document.addEventListener("DOMContentLoaded", function () {
  const addButton = document.getElementById("add-inspection-btn");
  const inspectionContainer = document.getElementById("inspection");
  let cardCount = 0;

  // Create initial card HTML
  const initialCard = document.createElement("div");
  initialCard.className = "inspection-card";
  initialCard.innerHTML = `
    <div class="location">
      <label for="location-0">Location:</label>
      <select id="location-0">
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
    <div class="photo" id="photo-0">
      <label for="photo-0">Photo</label>
      <button type="button" id="upload-btn-0" class="upload-btn">
        <i class="fas fa-camera"></i> Take Photo or Choose from Gallery
      </button>
      <input type="file" id="photo-input-0" accept="image/*" style="display: none;" />
      <div class="photo-preview" id="photo-preview-0" style="display: none;">
        <div class="preview-container">
          <img id="preview-image-0" src="" alt="Preview" />
          <div id="timestamp-0" class="timestamp"></div>
        </div>
      </div>
    </div>
  `;

  // Add initial card
  inspectionContainer.appendChild(initialCard);
  setupPhotoUpload(0);

  addButton.addEventListener("click", function () {
    cardCount++;
    const newCard = document.createElement("div");
    newCard.className = "inspection-card";
    newCard.innerHTML = `
            <div class="location">
                <label for="location-${cardCount}">Location:</label>
                <select id="location-${cardCount}">
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
            <div class="photo" id="photo-${cardCount}">
                <label for="photo-${cardCount}">Photo</label>
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
  });

  function setupPhotoUpload(id) {
    const uploadBtn = document.getElementById(`upload-btn-${id}`);
    const fileInput = document.getElementById(`photo-input-${id}`);
    const preview = document.getElementById(`photo-preview-${id}`);
    const previewImage = document.getElementById(`preview-image-${id}`);
    const timestamp = document.getElementById(`timestamp-${id}`);

    if (!uploadBtn || !fileInput) return; // Guard clause

    // Add capture attribute dynamically for mobile
    fileInput.setAttribute("capture", "environment");
    fileInput.setAttribute("accept", "image/*");

    // Handle both touch and click events
    uploadBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      fileInput.click();
    });

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
