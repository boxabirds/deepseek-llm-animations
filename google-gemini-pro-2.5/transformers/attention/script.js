document.addEventListener('DOMContentLoaded', () => {
    const tokensContainer = document.getElementById('tokens-container');
    const matrixContainer = document.getElementById('matrix-container');
    const matrixGrid = document.getElementById('matrix-grid');
    const topLabelsContainer = document.getElementById('top-labels');
    const sideLabelsContainer = document.getElementById('side-labels');
    const narrativeBox = document.getElementById('narrative-box');
    const prevButton = document.getElementById('prev-step');
    const nextButton = document.getElementById('next-step');
    const calculationOverlay = document.getElementById('calculation-overlay');
    const calcResult = document.getElementById('calc-result');

    // --- Configuration ---
    const numTokens = 10;
    // Sample tokens (can be replaced with a sentence fragment)
    const sampleTokens = ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog", "."];
    let tokens = sampleTokens.slice(0, numTokens);

    let attentionMatrix = []; // To store calculated scores
    let tokenElements = [];   // To store token DOM elements
    let cellElements = [];    // To store matrix cell DOM elements

    let currentStep = 0;

    // --- Narrative Steps ---
    const steps = [
        // Step 0: Introduction
        {
            narrative: "We start with an input sequence, broken down into 'tokens'. Here we have 10 tokens.",
            action: () => {
                renderTokens();
                matrixContainer.classList.remove('visible');
                tokenElements.forEach(t => t.classList.remove('show-embedding'));
            }
        },
        // Step 1: Embeddings Concept
        {
            narrative: "Each token has a hidden 'embedding' - a vector (list of numbers) representing its meaning, learned during training. These embeddings are key to understanding relationships.",
            action: () => {
                 tokenElements.forEach((tokenEl, index) => {
                    setTimeout(() => tokenEl.classList.add('show-embedding'), index * 100);
                 });
                 matrixContainer.classList.remove('visible');
            }
        },
        // Step 2: Introduce Attention Matrix
        {
            narrative: "The 'Attention' mechanism calculates the relationship strength between *every* token and *every other* token. This forms an Attention Matrix (here, 10x10).",
            action: () => {
                tokenElements.forEach(t => t.classList.remove('show-embedding')); // Hide embedding indicator for clarity
                generateDummyAttentionMatrix(); // Generate scores
                renderMatrixShell(); // Create grid structure
                matrixContainer.classList.add('visible');
                clearMatrixStyles(); // Ensure matrix is blank initially
            }
        },
        // Step 3: How Calculation Works (Focus on one pair)
        {
            narrative: "How? By comparing the embeddings. Let's look at 'jumps' (token 4) and 'fox' (token 3). Their embeddings are compared mathematically (simplified here as Q, K).",
            action: async () => {
                clearMatrixStyles();
                const rowIndex = 4; // "jumps"
                const colIndex = 3; // "fox"
                await highlightCalculation(rowIndex, colIndex);
            }
        },
         // Step 4: Filling the Matrix
        {
            narrative: "This comparison happens for all pairs. The resulting scores fill the matrix. Higher scores (darker blue) mean stronger relationships.",
            action: async () => {
                 calculationOverlay.classList.remove('visible'); // Hide calc overlay
                 await fillMatrixAnimated();
            }
        },
        // Step 5: Interpretation & Interaction
        {
            narrative: "The matrix reveals patterns! Notice strong self-attention (diagonal) and connections like 'The' relating to 'dog'. Hover over tokens or cells to explore.",
            action: () => {
                // Highlight an example relationship if desired
                 highlightCell(6, 8, attentionMatrix[6][8]); // 'the' (2nd) -> 'dog'
                 highlightCell(8, 6, attentionMatrix[8][6]); // 'dog' -> 'the' (2nd)
                 enableInteraction(); // Turn on hover effects
            }
        }
    ];

    // --- Core Functions ---

    function renderTokens() {
        tokensContainer.innerHTML = '';
        tokenElements = [];
        tokens.forEach((token, index) => {
            const tokenEl = document.createElement('div');
            tokenEl.classList.add('token');
            tokenEl.textContent = token;
            tokenEl.dataset.index = index;
            tokensContainer.appendChild(tokenEl);
            tokenElements.push(tokenEl);
        });
    }

    function generateDummyAttentionMatrix() {
        attentionMatrix = [];
        for (let i = 0; i < numTokens; i++) {
            attentionMatrix[i] = [];
            for (let j = 0; j < numTokens; j++) {
                let score = Math.random(); // Base random score
                if (i === j) {
                    score = 0.8 + Math.random() * 0.2; // Strong self-attention
                } else if ( (tokens[i].toLowerCase() === 'the' && ['fox', 'dog'].includes(tokens[j].toLowerCase())) ||
                            (tokens[j].toLowerCase() === 'the' && ['fox', 'dog'].includes(tokens[i].toLowerCase())) ) {
                     score = 0.6 + Math.random() * 0.2; // Boost 'the' -> noun
                } else if ( (tokens[i].toLowerCase() === 'jumps' && ['fox', 'over', 'dog'].includes(tokens[j].toLowerCase())) ||
                            (tokens[j].toLowerCase() === 'jumps' && ['fox', 'over', 'dog'].includes(tokens[i].toLowerCase())) ) {
                     score = 0.5 + Math.random() * 0.3; // Boost 'jumps' related words
                } else {
                    score *= 0.6; // Dampen other scores
                }
                // Add some general noise/variation
                score = Math.max(0, Math.min(1, score + (Math.random() - 0.5) * 0.1));
                attentionMatrix[i][j] = score;
            }
        }
    }

    function renderMatrixShell() {
        matrixGrid.innerHTML = '';
        topLabelsContainer.innerHTML = '';
        sideLabelsContainer.innerHTML = '';
        cellElements = [];

        matrixGrid.style.gridTemplateColumns = `repeat(${numTokens}, 1fr)`;
        matrixGrid.style.gridTemplateRows = `repeat(${numTokens}, 1fr)`;

        for (let i = 0; i < numTokens; i++) {
             // Top Labels
            const topLabel = document.createElement('div');
            topLabel.classList.add('label');
            topLabel.textContent = tokens[i];
            topLabelsContainer.appendChild(topLabel);

            // Side Labels
            const sideLabel = document.createElement('div');
            sideLabel.classList.add('label');
            sideLabel.textContent = tokens[i];
            sideLabelsContainer.appendChild(sideLabel);

            // Grid Cells
            cellElements[i] = [];
            for (let j = 0; j < numTokens; j++) {
                const cell = document.createElement('div');
                cell.classList.add('matrix-cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                matrixGrid.appendChild(cell);
                cellElements[i][j] = cell;
            }
        }
    }

     function getCellStyle(score) {
        if (score > 0.7) return 'highlight-strong';
        if (score > 0.4) return 'highlight-medium';
        if (score > 0.1) return 'highlight-weak';
        return '';
    }

    function highlightCell(row, col, score) {
         if (cellElements[row] && cellElements[row][col]) {
            const cell = cellElements[row][col];
            // Remove previous intensity classes
            cell.classList.remove('highlight-strong', 'highlight-medium', 'highlight-weak');
            // Add new class based on score
            const styleClass = getCellStyle(score);
            if(styleClass) {
                 cell.classList.add(styleClass);
            }
            // Set background color directly for smoother gradient feel (optional)
            // cell.style.backgroundColor = `hsl(208, 79%, ${95 - score * 60}%)`; // Blue scale
         }
    }

    function clearMatrixStyles() {
        for (let i = 0; i < numTokens; i++) {
            for (let j = 0; j < numTokens; j++) {
                 if (cellElements[i] && cellElements[i][j]) {
                    const cell = cellElements[i][j];
                    cell.classList.remove('highlight-strong', 'highlight-medium', 'highlight-weak', 'calculating', 'highlight-row', 'highlight-col', 'highlight-hover');
                    cell.style.backgroundColor = ''; // Reset direct style if used
                 }
            }
        }
         tokenElements.forEach(t => t.classList.remove('highlight-strong', 'highlight-weak'));
    }

    async function highlightCalculation(rowIndex, colIndex) {
        clearMatrixStyles();
        const rowToken = tokenElements[rowIndex];
        const colToken = tokenElements[colIndex];
        const cell = cellElements[rowIndex][colIndex];
        const score = attentionMatrix[rowIndex][colIndex];

        // 1. Highlight tokens involved
        rowToken.classList.add('highlight-strong');
        colToken.classList.add('highlight-weak'); // Q vs K/V distinction conceptually
        await sleep(500);

        // 2. Show calculation happening at the cell
        cell.classList.add('calculating');
        const cellRect = cell.getBoundingClientRect();
        const matrixRect = matrixContainer.getBoundingClientRect();
        calculationOverlay.style.top = `${cellRect.top - matrixRect.top + cellRect.height / 2}px`;
        calculationOverlay.style.left = `${cellRect.left - matrixRect.left + cellRect.width / 2}px`;
        calcResult.textContent = `Score: ${score.toFixed(2)}`;
        calculationOverlay.classList.add('visible');
        await sleep(1000); // Pause to show calculation

        // 3. Show result in the cell
        cell.classList.remove('calculating');
        highlightCell(rowIndex, colIndex, score);
        calculationOverlay.classList.remove('visible');
        await sleep(500);

        // 4. Reset token highlights
        rowToken.classList.remove('highlight-strong');
        colToken.classList.remove('highlight-weak');
    }

    async function fillMatrixAnimated() {
        clearMatrixStyles();
        for (let i = 0; i < numTokens; i++) {
            for (let j = 0; j < numTokens; j++) {
                 highlightCell(i, j, attentionMatrix[i][j]);
                 await sleep(20); // Small delay for animation effect
            }
        }
    }

    // --- Interaction ---
    let interactionEnabled = false;

    function enableInteraction() {
        interactionEnabled = true;
        tokenElements.forEach(tokenEl => {
            tokenEl.addEventListener('mouseover', handleTokenMouseOver);
            tokenEl.addEventListener('mouseout', handleTokenMouseOut);
        });
        cellElements.flat().forEach(cell => {
            cell.addEventListener('mouseover', handleCellMouseOver);
            cell.addEventListener('mouseout', handleCellMouseOut);
        });
    }

    function disableInteraction() {
        interactionEnabled = false;
         tokenElements.forEach(tokenEl => {
            tokenEl.removeEventListener('mouseover', handleTokenMouseOver);
            tokenEl.removeEventListener('mouseout', handleTokenMouseOut);
        });
        cellElements.flat().forEach(cell => {
            cell.removeEventListener('mouseover', handleCellMouseOver);
            cell.removeEventListener('mouseout', handleCellMouseOut);
        });
        // Clear any active interaction highlights
        clearInteractionHighlights();
    }

    function handleTokenMouseOver(event) {
        if (!interactionEnabled) return;
        const index = parseInt(event.target.dataset.index);
        clearInteractionHighlights(); // Clear previous before highlighting new

        // Highlight token
        event.target.classList.add('highlight-strong');

        // Highlight corresponding row and column in matrix
        for (let i = 0; i < numTokens; i++) {
            if(cellElements[index] && cellElements[index][i]) cellElements[index][i].classList.add('highlight-row');
            if(cellElements[i] && cellElements[i][index]) cellElements[i][index].classList.add('highlight-col');
        }
         narrativeBox.textContent = `Showing attention scores for token '${tokens[index]}' (row/column ${index}).`;
    }

    function handleTokenMouseOut(event) {
         if (!interactionEnabled) return;
         clearInteractionHighlights();
         // Restore default step narrative
         narrativeBox.textContent = steps[currentStep].narrative;
    }

     function handleCellMouseOver(event) {
        if (!interactionEnabled) return;
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        clearInteractionHighlights(); // Clear previous

        // Highlight cell
        event.target.classList.add('highlight-hover');

        // Highlight corresponding tokens
        if(tokenElements[row]) tokenElements[row].classList.add('highlight-strong'); // Query token
        if(tokenElements[col]) tokenElements[col].classList.add('highlight-weak');   // Key token

        const score = attentionMatrix[row][col];
        narrativeBox.textContent = `Attention score between '${tokens[row]}' (row ${row}) and '${tokens[col]}' (col ${col}): ${score.toFixed(2)}`;
    }

    function handleCellMouseOut(event) {
        if (!interactionEnabled) return;
        clearInteractionHighlights();
        // Restore default step narrative
        narrativeBox.textContent = steps[currentStep].narrative;
    }

    function clearInteractionHighlights() {
         tokenElements.forEach(t => t.classList.remove('highlight-strong', 'highlight-weak'));
         cellElements.flat().forEach(c => c.classList.remove('highlight-row', 'highlight-col', 'highlight-hover'));
    }

    // --- Navigation ---
    function updateStep(newStep) {
        if (newStep < 0 || newStep >= steps.length) return;

        currentStep = newStep;
        disableInteraction(); // Disable interaction during transitions/earlier steps
        clearMatrixStyles(); // Clear matrix between steps generally
        clearInteractionHighlights(); // Clear any lingering interaction highlights

        const step = steps[currentStep];
        narrativeBox.textContent = step.narrative;
        step.action(); // Execute step-specific logic

        // Update button states
        prevButton.disabled = currentStep === 0;
        nextButton.disabled = currentStep === steps.length - 1;
    }

    prevButton.addEventListener('click', () => updateStep(currentStep - 1));
    nextButton.addEventListener('click', () => updateStep(currentStep + 1));

    // --- Utility ---
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // --- Initial Load ---
    updateStep(0); // Start at the first step
});