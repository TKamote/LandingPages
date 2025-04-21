document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('inspectionDate').value = today;
    
    // Print button event
    document.getElementById('printButton').addEventListener('click', function() {
        window.print();
    });
    
    // Highlight the selected option (like in the image where "Not Applicable" is highlighted blue)
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(button => {
        button.addEventListener('change', function() {
            if (this.checked) {
                // Reset all in the same group to default style
                document.querySelectorAll(`input[name="${this.name}"]`).forEach(radio => {
                    radio.parentElement.style.color = '';
                    radio.parentElement.style.fontWeight = '';
                });
                
                // Highlight the selected option
                this.parentElement.style.color = '#0066cc';
                this.parentElement.style.fontWeight = 'bold';
            }
        });
    });
    
    // Form submission handler
    document.getElementById('terminationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect form data
        const formData = new FormData(this);
        const terminationData = {};
        
        for (const [key, value] of formData.entries()) {
            terminationData[key] = value;
        }
        
        // In a real application, you would send this data to a server
        console.log('Termination Form Data:', terminationData);
        
        // Show success message
        const statusMessage = document.getElementById('statusMessage');
        statusMessage.style.display = 'block';
        statusMessage.textContent = 'Termination form submitted successfully!';
        
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    });
});