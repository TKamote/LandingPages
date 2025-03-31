document.addEventListener("DOMContentLoaded", () => {
  const cardContainer = document.getElementById("card-container");
  const addCardBtn = document.getElementById("add-card-btn");
  const resetBtn = document.getElementById("reset-btn");
  const exportBtn = document.getElementById("export-btn");

  // Add a new card
  addCardBtn.addEventListener("click", () => {
    const card = document.querySelector(".card").cloneNode(true);
    card
      .querySelectorAll("input, textarea")
      .forEach((input) => (input.value = "")); // Clear inputs
    card.querySelector(".photo-preview").style.backgroundImage = ""; // Clear photo preview
    card.querySelector(".timestamp").textContent = ""; // Clear timestamp
    cardContainer.appendChild(card);
    addCardListeners(card);
  });

  // Reset all cards
  resetBtn.addEventListener("click", () => {
    cardContainer.innerHTML = "";
    const card = document.querySelector(".card").cloneNode(true);
    card
      .querySelectorAll("input, textarea")
      .forEach((input) => (input.value = "")); // Clear inputs
    card.querySelector(".photo-preview").style.backgroundImage = ""; // Clear photo preview
    card.querySelector(".timestamp").textContent = ""; // Clear timestamp
    cardContainer.appendChild(card);
    addCardListeners(card);
  });

  // Export to Word
  exportBtn.addEventListener("click", async () => {
    console.log("Export button clicked");

    const {
      Document,
      Packer,
      Paragraph,
      Table,
      TableRow,
      TableCell,
      WidthType,
    } = docx;

    // Collect data from all cards
    const cards = document.querySelectorAll(".card");
    console.log(`Number of cards: ${cards.length}`);

    const rows = [];
    let currentRow = [];

    for (const card of cards) {
      const serialNumber = card.querySelector(".serial-number").value || "N/A";
      const location = card.querySelector(".location").value || "N/A";
      const comments = card.querySelector(".comments").value || "N/A";
      const photoPreview =
        card.querySelector(".photo-preview").style.backgroundImage;

      console.log(
        `Card data: Serial Number=${serialNumber}, Location=${location}, Comments=${comments}`
      );

      // Create a cell for the card
      const cardCell = new TableCell({
        children: [
          new Paragraph({
            text: `Serial Number: ${serialNumber}`,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: `Location: ${location}`,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: `Comments: ${comments}`,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: photoPreview ? "[Image Attached]" : "No Image",
            spacing: { after: 200 },
          }),
        ],
        width: { size: 50, type: WidthType.PERCENTAGE },
      });

      currentRow.push(cardCell);

      // Add a new row every 2 cards
      if (currentRow.length === 2 || card === cards[cards.length - 1]) {
        rows.push(new TableRow({ children: currentRow }));
        currentRow = [];
      }
    }

    console.log("Table rows created:", rows.length);

    // Create the table
    const table = new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    });

    // Create the document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                orientation: "portrait",
                width: 11906, // A4 width in twips
                height: 16838, // A4 height in twips
              },
              margin: {
                top: 720, // Narrow margins
                bottom: 720,
                left: 720,
                right: 720,
              },
            },
          },
          children: [table],
        },
      ],
    });

    console.log("Document created, generating Word file...");

    // Generate the Word document
    Packer.toBlob(doc)
      .then((blob) => {
        console.log("Word file generated, starting download...");
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Defects_Inspection_Report.docx";
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error generating Word file:", error);
      });
  });

  // Add listeners for photo upload and delete button
  function addCardListeners(card) {
    const photoInput = card.querySelector(".photo-input");
    const photoPreview = card.querySelector(".photo-preview");
    const timestamp = card.querySelector(".timestamp");
    const deleteBtn = card.querySelector(".delete-btn");

    // Handle photo upload
    photoInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          // Display the uploaded image in the photo preview
          photoPreview.style.backgroundImage = `url(${e.target.result})`;
          photoPreview.style.backgroundSize = "cover";
          photoPreview.style.backgroundPosition = "center";
          photoPreview.style.backgroundRepeat = "no-repeat";

          // Add a timestamp for when the photo was uploaded
          timestamp.textContent = `Captured: ${new Date().toLocaleString()}`;
        };
        reader.readAsDataURL(file); // Read the file as a data URL
      } else {
        // Clear the photo preview and timestamp if no file is selected
        photoPreview.style.backgroundImage = "";
        timestamp.textContent = "";
      }
    });

    // Handle delete button
    deleteBtn.addEventListener("click", () => {
      if (document.querySelectorAll(".card").length > 1) {
        card.remove();
      } else {
        alert("You cannot delete the last card.");
      }
    });

    // Fetch GPS location
    const locationInput = card.querySelector(".location");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          locationInput.value = `Lat: ${latitude.toFixed(
            5
          )}, Lng: ${longitude.toFixed(5)}`;
        },
        () => {
          locationInput.value = "Unable to fetch location";
        }
      );
    } else {
      locationInput.value = "Geolocation not supported";
    }
  }

  // Initialize listeners for the first card
  addCardListeners(document.querySelector(".card"));
});
