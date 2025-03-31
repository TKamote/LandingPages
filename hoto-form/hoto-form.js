document.addEventListener("DOMContentLoaded", () => {
  // Add functionality for radio buttons to show/hide the image upload section
  const radioButtons = document.querySelectorAll("input[type='radio']");

  radioButtons.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      const checklistItem = event.target.closest(".checklist-item");
      const imageUpload = checklistItem.querySelector(".image-upload");

      if (event.target.value === "present") {
        // Show the image upload section when ✓ is selected
        imageUpload.classList.remove("hidden");
      } else {
        // Hide the image upload section for NA or 𐄂
        imageUpload.classList.add("hidden");
        const imagePreview = imageUpload.querySelector(".image-preview");
        imagePreview.style.backgroundImage = ""; // Clear the image preview
      }
    });
  });

  // Add functionality for image upload and preview
  const imageInputs = document.querySelectorAll(".image-input");

  imageInputs.forEach((input) => {
    input.addEventListener("change", (event) => {
      const file = event.target.files[0];
      const imagePreview = event.target.nextElementSibling;

      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          // Display the uploaded image in the preview box
          imagePreview.style.backgroundImage = `url(${e.target.result})`;
        };
        reader.readAsDataURL(file);
      } else {
        // Clear the preview if no file is selected
        imagePreview.style.backgroundImage = "";
      }
    });
  });
});