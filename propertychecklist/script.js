// First, update the event listener reference from uploadBtn to downloadBtn
document.addEventListener('DOMContentLoaded', () => {
    const addCardBtn = document.getElementById('addCardBtn');
    const resetBtn = document.getElementById('resetBtn');
    const downloadBtn = document.getElementById('downloadBtn');  // Changed from uploadBtn
    const backBtn = document.getElementById('backBtn');
    const cardsContainer = document.getElementById('cardsContainer');

    // Add Card Button
    addCardBtn.addEventListener('click', () => {
        const newCard = createCard(cardCount++);
        cardsContainer.appendChild(newCard);
        setupImageHandlers(newCard);
    });

    // Reset Button
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset? All data will be lost.')) {
            cardsContainer.innerHTML = '';
            const newCard = createCard(0);
            cardsContainer.appendChild(newCard);
            setupImageHandlers(newCard);
            cardCount = 1;
        }
    });

    // Download Button (changed from Upload)
    downloadBtn.addEventListener('click', generateDocument);

    // Back Button
    backBtn.addEventListener('click', () => {
        history.back();
    });

    // Setup handlers for the initial card
    setupImageHandlers(document.querySelector('.card'));
});

// Replace the existing generateDocument and generateDocumentContent functions with these updated versions:
async function generateDocument() {
    try {
        const doc = new docx.Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 500,
                            right: 500,
                            bottom: 500,
                            left: 500,
                        },
                    },
                },
                children: await generateDocumentContent(),
            }],
        });

        // Generate and save document
        const blob = await docx.Packer.toBlob(doc);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = 'property-checklist.docx';
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error generating document:', error);
        alert('Error generating document. Please try again.');
    }
}

async function generateDocumentContent() {
    const cards = document.querySelectorAll('.card');
    const content = [];
    let cardCounter = 0;

    for (const card of cards) {
        const serialNumber = card.querySelector('.serial-number').value;
        const location = card.querySelector('.location').value;
        const comments = card.querySelector('.comments').value;
        const imagePreview = card.querySelector('.image-preview');

        // Add card data
        content.push(
            new docx.Paragraph({
                children: [
                    new docx.TextRun({
                        text: `Serial Number: ${serialNumber}`,
                        bold: true,
                        size: 24,
                    }),
                ],
                spacing: {
                    after: 200,
                },
            }),
            new docx.Paragraph({
                children: [
                    new docx.TextRun({
                        text: `Location: ${location}`,
                        size: 24,
                    }),
                ],
                spacing: {
                    after: 200,
                },
            }),
            new docx.Paragraph({
                children: [
                    new docx.TextRun({
                        text: `Comments: ${comments}`,
                        size: 24,
                    }),
                ],
                spacing: {
                    after: 200,
                },
            })
        );

        // Add image if exists
        if (imagePreview.style.backgroundImage) {
            try {
                const imageUrl = imagePreview.style.backgroundImage.slice(5, -2);
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();
                
                content.push(
                    new docx.Paragraph({
                        children: [
                            new docx.ImageRun({
                                data: arrayBuffer,
                                transformation: {
                                    width: 200,
                                    height: 200,
                                },
                            }),
                        ],
                        spacing: {
                            after: 400,
                        },
                    })
                );
            } catch (error) {
                console.error('Error adding image to document:', error);
                content.push(
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: '[Image could not be loaded]',
                                color: "FF0000",
                            }),
                        ],
                        spacing: {
                            after: 400,
                        },
                    })
                );
            }
        }

        cardCounter++;
        // Add page break after every 4 cards except for the last set
        if (cardCounter % 4 === 0 && cardCounter !== cards.length) {
            content.push(
                new docx.Paragraph({
                    children: [],
                    pageBreakBefore: true,
                })
            );
        }
    }

    return content;
}