function addCard() {
    const container = document.getElementById('cards-container');
    const newCard = document.createElement('div');
    newCard.className = 'card';
    
    const cardContent = `
        <button class="delete-button" onclick="deleteCard(this)">
            <i class="fas fa-trash"></i>
        </button>
        <div class="card-header">
            <button onclick="uploadDoc()">
                <i class="fas fa-upload"></i>
            </button>
            <button onclick="resetCard(this)">
                <i class="fas fa-redo"></i>
            </button>
        </div>
        <div class="form-group">
            <label for="serial">Serial Number</label>
            <input class="textarea" type="text" name="serial">
        </div>
        <div class="form-group">
            <label for="location">Location</label>
            <input class="textarea" type="text" name="location">
        </div>
        <div class="form-group">
            <label for="comments">Comments</label>
            <textarea class="textarea" name="comments"></textarea>
        </div>
        <div class="form-group-image">
            <label for="image">Photo</label>
            <div class="image-container">
                <img class="image-preview" src="/api/placeholder/400/533" alt="Preview">
            </div>
            <input type="file" accept="image/*" capture="environment" onchange="handleImageSelect(this)">
        </div>
    `;
    
    newCard.innerHTML = cardContent;
    container.appendChild(newCard);
}

function deleteCard(button) {
    button.closest('.card').remove();
}

function resetCard(button) {
    const card = button.closest('.card');
    const inputs = card.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.value = '';
    });
    const preview = card.querySelector('.image-preview');
    preview.src = '/api/placeholder/400/533';
}

function handleImageSelect(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = input.previousElementSibling.querySelector('.image-preview');
            preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function uploadDoc() {
    window.print();
}