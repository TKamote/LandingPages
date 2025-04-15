document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const cardsContainer = document.getElementById("cards-container");
  const addCardBtn = document.getElementById("add-card-btn");
  const resetBtn = document.getElementById("reset-btn");
  const exportBtn = document.getElementById("export-btn");
  const toast = document.getElementById("toast");

  // State
  let cards = JSON.parse(localStorage.getItem("inspectionCards")) || [];
  let nextSerialNumber = getNextSerialNumber();

  // Initialize the app
  function init() {
    // Render existing cards from local storage
    if (cards.length === 0) {
      addNewCard();
    } else {
      renderAllCards();
    }

    // Event listeners
    addCardBtn.addEventListener("click", addNewCard);
    resetBtn.addEventListener("click", resetAllCards);
    exportBtn.addEventListener("click", exportToWord);
  }

  // Generate next serial number (YYYYMMDD-001 format)
  function getNextSerialNumber() {
    const today = new Date();
    const dateStr =
      today.getFullYear() +
      String(today.getMonth() + 1).padStart(2, "0") +
      String(today.getDate()).padStart(2, "0");

    // Find existing serial numbers from today
    const todayCards = cards.filter(
      (card) => card.serialNumber && card.serialNumber.startsWith(dateStr)
    );

    if (todayCards.length > 0) {
      // Get the highest sequence number
      const sequences = todayCards.map((card) => {
        const parts = card.serialNumber.split("-");
        return parts.length > 1 ? parseInt(parts[1]) : 0;
      });
      const maxSeq = Math.max(...sequences);
      return `${dateStr}-${String(maxSeq + 1).padStart(3, "0")}`;
    }

    return `${dateStr}-001`;
  }

  // Render a single card
  function renderCard(cardData, index) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.index = index;

    const timestamp = cardData.timestamp
      ? new Date(cardData.timestamp).toLocaleString()
      : new Date().toLocaleString();

    card.innerHTML = `
            <div class="photo-container">
                <div class="photo-placeholder">
                    <div class="photo-icon">📷</div>
                    <div>Tap to take photo</div>
                </div>
                <img class="photo" src="${
                  cardData.photoUrl || ""
                }" alt="Inspection photo">
                <div class="timestamp">${timestamp}</div>
                <input type="file" class="camera-input" accept="image/*" capture="environment">
            </div>
            <div class="card-body">
                <div class="form-group">
                    <label for="serial-${index}">Serial Number</label>
                    <input type="text" id="serial-${index}" value="${
      cardData.serialNumber || ""
    }" placeholder="Auto-generated serial number">
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <div id="location-${index}" class="location-data">
                        ${
                          cardData.location
                            ? `<span class="location-label">Lat:</span> ${cardData.location.latitude.toFixed(
                                6
                              )}, 
                             <span class="location-label">Long:</span> ${cardData.location.longitude.toFixed(
                               6
                             )}`
                            : "Fetching location..."
                        }
                    </div>
                </div>
                <div class="form-group">
                    <label for="comments-${index}">Comments</label>
                    <textarea id="comments-${index}" placeholder="Add your inspection notes here...">${
      cardData.comments || ""
    }</textarea>
                </div>
            </div>
            <div class="actions">
                <button class="action-button take-photo-btn">Take Photo</button>
                <button class="action-button delete-button">Delete</button>
            </div>
        `;

    cardsContainer.appendChild(card);

    // Get card elements
    const photoPlaceholder = card.querySelector(".photo-placeholder");
    const photoElement = card.querySelector(".photo");
    const cameraInput = card.querySelector(".camera-input");
    const serialInput = card.querySelector(`#serial-${index}`);
    const commentsInput = card.querySelector(`#comments-${index}`);
    const takePhotoBtn = card.querySelector(".take-photo-btn");
    const deleteBtn = card.querySelector(".delete-button");
    const locationElement = card.querySelector(`#location-${index}`);

    // Show photo if available
    if (cardData.photoUrl) {
      photoElement.style.display = "block";
      photoPlaceholder.style.display = "none";
    }

    // Event listeners for this card
    photoPlaceholder.addEventListener("click", () => cameraInput.click());
    takePhotoBtn.addEventListener("click", () => cameraInput.click());

    cameraInput.addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
          // Update the UI
          photoElement.src = event.target.result;
          photoElement.style.display = "block";
          photoPlaceholder.style.display = "none";

          // Update card data
          cards[index].photoUrl = event.target.result;
          cards[index].timestamp = new Date().toISOString();

          // Update timestamp in UI
          card.querySelector(".timestamp").textContent =
            new Date().toLocaleString();

          // Save to local storage
          saveCards();
        };

        reader.readAsDataURL(file);
      }
    });

    serialInput.addEventListener("input", function (e) {
      cards[index].serialNumber = e.target.value;
      saveCards();
    });

    commentsInput.addEventListener("input", function (e) {
      cards[index].comments = e.target.value;
      saveCards();
    });

    deleteBtn.addEventListener("click", function () {
      if (cards.length > 1) {
        cards.splice(index, 1);
        saveCards();
        renderAllCards();
      } else {
        showToast("Cannot delete the last card. Reset all instead.");
      }
    });

    // Get location if not already available
    if (!cardData.location) {
      getLocation(index, locationElement);
    }
  }

  // Render all cards
  function renderAllCards() {
    cardsContainer.innerHTML = "";
    cards.forEach((card, index) => {
      renderCard(card, index);
    });
  }

  // Add a new card
  function addNewCard() {
    const newCard = {
      serialNumber: nextSerialNumber,
      timestamp: new Date().toISOString(),
      comments: "",
    };

    cards.push(newCard);
    nextSerialNumber = getNextSerialNumber();
    saveCards();

    // Render just the new card
    renderCard(newCard, cards.length - 1);

    // Scroll to the new card
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  }

  // Reset all cards
  function resetAllCards() {
    if (
      confirm(
        "Are you sure you want to reset all cards? This will delete all current data."
      )
    ) {
      cards = [];
      localStorage.removeItem("inspectionCards");
      nextSerialNumber = getNextSerialNumber();
      addNewCard();
      showToast("All cards have been reset");
    }
  }

  // Get current location
  function getLocation(cardIndex, locationElement) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // Success
        function (position) {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          // Update card data
          cards[cardIndex].location = location;
          saveCards();

          // Update UI
          locationElement.innerHTML = `
                        <span class="location-label">Lat:</span> ${location.latitude.toFixed(
                          6
                        )}, 
                        <span class="location-label">Long:</span> ${location.longitude.toFixed(
                          6
                        )}
                    `;
        },
        // Error
        function (error) {
          let errorMessage;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
            default:
              errorMessage = "Unknown location error";
          }
          locationElement.textContent = errorMessage;
        }
      );
    } else {
      locationElement.textContent = "Geolocation not supported";
    }
  }

  // Save cards to local storage
  function saveCards() {
    localStorage.setItem("inspectionCards", JSON.stringify(cards));
  }

  // Export to Word document
  function exportToWord() {
    if (cards.length === 0) {
      showToast("No cards to export");
      return;
    }

    // Create a Word-compatible HTML content
    let content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Defects Inspection Report</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          .page {
            display: grid;
            grid-template-columns: 1fr 1fr; /* 2 columns */
            grid-template-rows: 1fr 1fr; /* 2 rows */
            gap: 10px;
            height: 100%; /* Full page height */
            page-break-after: always;
          }
          .card {
            border: 1px solid #ddd;
            padding: 10px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .photo-container {
            width: 100%;
            height: 0;
            padding-bottom: 75%; /* 3:4 aspect ratio */
            overflow: hidden;
            position: relative;
          }
          .photo {
            width: 100%;
            height: 100%;
            object-fit: cover;
            position: absolute;
            top: 0;
            left: 0;
          }
          .no-photo {
            width: 100%;
            height: 0;
            padding-bottom: 75%; /* 3:4 aspect ratio */
            background-color: #eee;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #777;
          }
          .card-info {
            margin-top: 10px;
            font-size: 12px;
          }
          .card-info p {
            margin: 5px 0;
          }
          .comments {
            margin-top: 10px;
            font-size: 12px;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
          h1 {
            text-align: center;
            font-size: 16px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <h1>Defects Inspection Report - ${new Date().toLocaleDateString()}</h1>
    `;

    // Add cards in 2x2 grid per page
    for (let i = 0; i < cards.length; i += 4) {
      content += '<div class="page">';

      // Add up to 4 cards per page
      for (let j = i; j < i + 4 && j < cards.length; j++) {
        const card = cards[j];
        const timestamp = card.timestamp
          ? new Date(card.timestamp).toLocaleString()
          : "No timestamp";

        content += `
          <div class="card">
            <div class="photo-container">
              ${
                card.photoUrl
                  ? `<img class="photo" src="${card.photoUrl}" alt="Inspection photo">`
                  : '<div class="no-photo">No photo</div>'
              }
            </div>
            <div class="card-info">
              <p><strong>Serial:</strong> ${card.serialNumber || "N/A"}</p>
              <p><strong>Time:</strong> ${timestamp}</p>
              <p><strong>Location:</strong> ${
                card.location || "No location provided"
              }</p>
            </div>
            <div class="comments">
              <p><strong>Comments:</strong> ${
                card.comments || "No comments"
              }</p>
            </div>
          </div>
        `;
      }

      // Fill remaining slots with empty divs to maintain grid layout
      for (let j = cards.length; j < i + 4; j++) {
        if (j >= i) {
          content += '<div class="card" style="visibility: hidden;"></div>';
        }
      }

      content += "</div>";
    }

    content += "</body></html>";

    // Create a Blob with the Word HTML content
    const blob = new Blob([content], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Inspection_Report_${new Date()
      .toLocaleDateString()
      .replace(/\//g, "-")}.doc`;
    link.click();

    showToast("Report exported successfully");
  }

  // Show toast message
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // Initialize the app
  init();
});
