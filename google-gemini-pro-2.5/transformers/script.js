// Wait for the HTML document to be fully loaded and parsed
document.addEventListener('DOMContentLoaded', () => {

    // Get references to the button and the block container using their IDs
    const toggleButton = document.getElementById('toggle-button');
    const transformerBlock = document.getElementById('transformer-block');

    // --- Defensive Check ---
    // Verify that the elements were actually found in the HTML.
    // If not, log an error to the console and stop the script.
    if (!toggleButton) {
        console.error("Error: Could not find button element with ID 'toggle-button'. Check HTML ID.");
        return; // Stop execution if button is missing
    }
    if (!transformerBlock) {
        console.error("Error: Could not find block element with ID 'transformer-block'. Check HTML ID.");
        return; // Stop execution if block is missing
    }
    // --- End of Check ---


    // Add the click event listener to the toggle button
    toggleButton.addEventListener('click', () => {

        // Check if the transformer block currently has the 'combined' class
        const isCombined = transformerBlock.classList.contains('combined');

        // Toggle between the 'combined' and 'exploded' states
        if (isCombined) {
            // If it's combined, remove 'combined', add 'exploded'
            transformerBlock.classList.remove('combined');
            transformerBlock.classList.add('exploded');
            toggleButton.textContent = 'Collapse Blocks'; // Update button text
        } else {
            // If it's exploded, remove 'exploded', add 'combined'
            transformerBlock.classList.remove('exploded');
            transformerBlock.classList.add('combined');
            toggleButton.textContent = 'Explode Blocks'; // Update button text
        }
    });
});