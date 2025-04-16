document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const cardsContainer = document.getElementById("cards-container");
  const addCardBtn = document.getElementById("add-card-btn");
  const resetBtn = document.getElementById("reset-btn");
  const exportBtn = document.getElementById("export-btn");
  const toast = document.getElementById("toast");

  // State
  let cards = JSON.parse(localStorage.getItem("inspectionCards")) || [];

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

  // Add a new card
  function addNewCard() {
    const newCard = {
      timestamp: new Date().toISOString(),
      comments: "",
    };

    cards.push(newCard);
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
                    <label>Serial Number</label>
                    <input type="text" 
                           class="serial-input" 
                           placeholder="Enter serial number"
                           value="${cardData.serialNumber || ""}"
                    >
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" 
                           class="location-input" 
                           placeholder="Enter location"
                           value="${cardData.location || ""}"
                    >
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
    const serialInput = card.querySelector(".serial-input");
    const locationInput = card.querySelector(".location-input");
    const commentsInput = card.querySelector(`#comments-${index}`);
    const takePhotoBtn = card.querySelector(".take-photo-btn");
    const deleteBtn = card.querySelector(".delete-button");

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

    locationInput.addEventListener("input", function (e) {
      cards[index].location = e.target.value; // Store as plain text
      saveCards();
    });

    commentsInput.addEventListener("input", function (e) {
      cards[index].comments = e.target.value;
      saveCards();
    });

    deleteBtn.addEventListener("click", function () {
      deleteCard(deleteBtn);
    });
  }

  // Render all cards
  function renderAllCards() {
    cardsContainer.innerHTML = "";
    cards.forEach((card, index) => {
      renderCard(card, index);
    });
  }

  // Reset all cards
  function resetAllCards() {
    // Clear the cards array
    cards = [];

    // Clear localStorage
    localStorage.removeItem("inspectionCards");

    // Clear all cards from the container
    cardsContainer.innerHTML = "";

    // Add a fresh card
    addNewCard();

    showToast("All cards reset");
  }

  // Function to delete a card
  function deleteCard(button) {
    const card = button.closest(".card");
    const index = parseInt(card.dataset.index);

    // Remove the card from the array
    cards.splice(index, 1);

    // Remove the card element from DOM
    card.remove();

    // Update indexes of remaining cards
    const remainingCards = cardsContainer.querySelectorAll(".card");
    remainingCards.forEach((card, idx) => {
      card.dataset.index = idx;
    });

    // Save the updated cards
    saveCards();

    // If all cards are deleted, add a new empty one
    if (cards.length === 0) {
      addNewCard();
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
            width: 80mm;
            height: 114mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .photo-container {
            width: 80mm;
            padding-bottom: 75%; /* 3:4 aspect ratio */
            overflow: hidden;
            position: relative;
          }
          .photo {
            width: 80mm;
            height: auto;
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
