const container = document.getElementById('container');
const addBtn = document.getElementById('add-btn');
const resetBtn = document.getElementById('reset-btn');
const uploadBtn = document.getElementById('upload-btn');

// Function to create a new card
function createCard() {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
        <input type="text" placeholder="Serial Number" class="serial-number" />
        <input type="text" placeholder="Location" class="location" />
        <textarea placeholder="Comments" class="comments"></textarea>
        <input type="file" accept="image/*" class="image-input" />
        <button class="delete-btn"><i class="fas fa-trash"></i></button>
    `;

    // Add delete functionality to the new card
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        if (container.children.length > 1) {
            card.remove();
        } else {
            alert("You can't delete the last card!");
        }
    });

    return card;
}

// Add event listener to the "Add" button
addBtn.addEventListener('click', () => {
    const newCard = createCard();
    container.appendChild(newCard);
});

// Reset to the original single card
resetBtn.addEventListener('click', () => {
    container.innerHTML = `
        <div class="card">
            <input type="text" placeholder="Serial Number" class="serial-number">
            <input type="text" placeholder="Location" class="location">
            <textarea placeholder="Comments" class="comments"></textarea>
            <input type="file" accept="image/*" class="image-input">
            <button class="delete-btn"><i class="fas fa-trash"></i></button>
        </div>
    `;

    // Add delete functionality to the reset card
    const deleteBtn = container.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        if (container.children.length > 1) {
            container.querySelector('.card').remove();
        } else {
            alert("You can't delete the last card!");
        }
    });
});

// Upload functionality (placeholder for Word document generation)
uploadBtn.addEventListener('click', () => {
    alert('Upload functionality to save as Word document is not implemented yet.');
});

// Add delete functionality to existing cards
document.querySelectorAll('.delete-btn').forEach((deleteBtn) => {
    deleteBtn.addEventListener('click', (event) => {
        const card = event.target.closest('.card');
        if (container.children.length > 1) {
            card.remove();
        } else {
            alert("You can't delete the last card!");
        }
    });
});