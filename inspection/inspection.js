document.addEventListener("DOMContentLoaded", () => {
  const cardContainer = document.getElementById("card-container");
  const addBtn = document.getElementById("add-btn");
  const resetBtn = document.getElementById("reset-btn");
  const uploadBtn = document.getElementById("upload-btn");

  // Add a new card
  addBtn.addEventListener("click", () => {
    const card = document.querySelector(".card").cloneNode(true);
    card
      .querySelectorAll("input, textarea")
      .forEach((input) => (input.value = "")); // Clear inputs
    const imagePreview = card.querySelector(".image-preview");
    if (imagePreview) imagePreview.style.backgroundImage = ""; // Clear image preview
    cardContainer.appendChild(card);
    updateDeleteButtons();
    addImageUploadListeners(card);
  });

  // Reset the inputs and image preview of all cards
  resetBtn.addEventListener("click", () => {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      card
        .querySelectorAll("input, textarea")
        .forEach((input) => (input.value = "")); // Clear inputs
      const imagePreview = card.querySelector(".image-preview");
      if (imagePreview) imagePreview.style.backgroundImage = ""; // Clear image preview
    });
  });

  // Upload functionality to export as Word document
  uploadBtn.addEventListener("click", async () => {
    const {
      Document,
      Packer,
      Paragraph,
      TextRun,
      Table,
      TableRow,
      TableCell,
      WidthType,
      Media,
    } = docx;

    // Collect data from all cards
    const cards = document.querySelectorAll(".card");
    const rows = [];
    let currentRow = [];

    for (const card of cards) {
      const serialNumber =
        card.querySelector("input[placeholder='Enter Serial Number']").value ||
        "N/A";
      const location =
        card.querySelector("input[placeholder='Enter Location']").value ||
        "N/A";
      const comments =
        card.querySelector("textarea[placeholder='Enter Comments']").value ||
        "N/A";
      const imageInput = card.querySelector(".image-input");
      let imageCellContent = new Paragraph({
        text: "No Image",
        spacing: { after: 200 },
      });

      // Handle image embedding
      if (imageInput.files[0]) {
        const file = imageInput.files[0];
        const imageData = await file.arrayBuffer();
        const image = Media.addImage(new Document(), imageData);
        imageCellContent = new Paragraph(image);
      }

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
          imageCellContent,
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

    // Generate the Word document
    Packer.toBlob(doc).then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Inspection_Report.docx";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  });

  // Update delete button functionality
  function updateDeleteButtons() {
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((btn) => {
      btn.onclick = () => {
        if (document.querySelectorAll(".card").length > 1) {
          btn.parentElement.remove();
        } else {
          alert("You cannot delete the last card.");
        }
      };
    });
  }

  // Add image upload functionality
  function addImageUploadListeners(card) {
    const imageInput = card.querySelector(".image-input");
    const imagePreview = card.querySelector(".image-preview");

    imageInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.style.backgroundImage = `url(${e.target.result})`;
        };
        reader.readAsDataURL(file);
      } else {
        imagePreview.style.backgroundImage = ""; // Clear preview if no file is selected
      }
    });
  }

  // Initialize delete buttons and image upload listeners for the initial card
  updateDeleteButtons();
  addImageUploadListeners(document.querySelector(".card"));
});
