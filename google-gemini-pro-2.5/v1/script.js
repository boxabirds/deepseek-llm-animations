// script.js

// Import the scene creation functions
import { createScene1Timeline } from './scene1.js';
import { createScene2Timeline } from './scene2.js';

// Ensure GSAP and TextPlugin are loaded (GSAP needs to be globally available or imported)
gsap.registerPlugin(TextPlugin);

// --- Get references to ALL elements ---
const elements = {
    textBox: document.querySelector('.text-box'),
    queryText: document.querySelector('#query-text'),
    cursor: document.querySelector('.cursor'),
    jsonView: document.querySelector('.json-view'),
    userMessageBox: document.querySelector('.user-message-box'),
    chatHistoryBox: document.querySelector('.chat-history-box'),
    chatHistoryJson: document.querySelector('.chat-history-json')
};

// --- Shared Helper Functions ---
function getElementDimensions() {
    // Ensure elements are rendered and have dimensions
    // Use the elements object passed to the scene functions
    const allElements = Object.values(elements);
    gsap.set(allElements, { visibility: 'hidden', display: 'block' });
    const rects = {
        textBox: elements.textBox.getBoundingClientRect(),
        jsonView: elements.jsonView.getBoundingClientRect(),
        msgBox: elements.userMessageBox.getBoundingClientRect(),
        chatBox: elements.chatHistoryBox.getBoundingClientRect(),
        chatJson: elements.chatHistoryJson.getBoundingClientRect()
    };
    gsap.set(allElements, { visibility: 'inherit', display: '' });

    const safeDim = (rect) => ({ width: rect.width || 1, height: rect.height || 1 });
    const dims = {
        textBox: safeDim(rects.textBox),
        jsonView: safeDim(rects.jsonView),
        msgBox: safeDim(rects.msgBox),
        chatBox: safeDim(rects.chatBox),
        chatJson: safeDim(rects.chatJson)
    };
    return dims;
}


// --- Main Execution ---
const masterTimeline = gsap.timeline({
    // paused: true // For debugging
});

// Create Scene 1, passing dependencies
const scene1EndTimeLabel = createScene1Timeline(masterTimeline, elements, getElementDimensions);

// Create Scene 2, passing dependencies and start time
const scene2EndTimeLabel = createScene2Timeline(masterTimeline, scene1EndTimeLabel, elements, getElementDimensions);


// --- Optional Controls ---
document.body.addEventListener('click', () => {
    if (masterTimeline.progress() === 1) {
        masterTimeline.restart();
    } else {
        // Optional: toggle play/pause
        // masterTimeline.paused(!masterTimeline.paused());
    }
});
console.log("Total Timeline duration:", masterTimeline.duration());

// Ensure initial states are set before timeline potentially plays immediately
gsap.set([elements.jsonView, elements.userMessageBox, elements.chatHistoryBox, elements.chatHistoryJson], { opacity: 0 });
gsap.set(elements.chatHistoryBox, { transform: "translateX(-150vw)" });
gsap.set(elements.textBox, { opacity: 0 }); // Ensure text box also starts hidden