// Ensure GSAP and TextPlugin are loaded
gsap.registerPlugin(TextPlugin);

// Get references to elements
const textBox = document.querySelector('.text-box');
const queryText = document.querySelector('#query-text');
const cursor = document.querySelector('.cursor');
const jsonView = document.querySelector('.json-view');
const userMessageBox = document.querySelector('.user-message-box');

// --- Animation Timeline ---
const tl = gsap.timeline();

// Function to get dimensions and precise scale factors (remains the same)
function getElementDimensions() {
    // Ensure elements are rendered and have dimensions
    gsap.set([textBox, jsonView, userMessageBox], { visibility: 'hidden', display: 'block' }); // Temporarily ensure display
    const textBoxRect = textBox.getBoundingClientRect();
    const jsonViewRect = jsonView.getBoundingClientRect();
    const userMessageBoxRect = userMessageBox.getBoundingClientRect();
    gsap.set([textBox, jsonView, userMessageBox], { visibility: 'inherit', display: '' }); // Revert temporary styles

    const safeDim = (rect) => ({ width: rect.width || 1, height: rect.height || 1 });
    const dims = { textBox: safeDim(textBoxRect), jsonView: safeDim(jsonViewRect), msgBox: safeDim(userMessageBoxRect) };
    const scales = {
        textToJsonScaleX: dims.jsonView.width / dims.textBox.width,
        textToJsonScaleY: dims.jsonView.height / dims.textBox.height,
        jsonToTextScaleX: dims.textBox.width / dims.jsonView.width,
        jsonToTextScaleY: dims.textBox.height / dims.jsonView.height,
        jsonToMsgScaleX: dims.msgBox.width / dims.jsonView.width,
        jsonToMsgScaleY: dims.msgBox.height / dims.jsonView.height,
        msgToJsonScaleX: dims.jsonView.width / dims.msgBox.width,
        msgToJsonScaleY: dims.jsonView.height / dims.msgBox.height,
    };
    // console.log("Calculated Scales:", scales); // For debugging
    // Add safety check for NaN or Infinity
    for (const key in scales) {
        if (!isFinite(scales[key])) {
            console.warn(`Invalid scale calculated for ${key}:`, scales[key], "Defaulting to 1.");
            scales[key] = 1;
        }
    }
    return scales;
}

// Variables to hold scales
let scales1 = {};
let scales2 = {};

// --- Build the Timeline with Labels and Explicit Positioning ---

// 1. Initial appearance
tl
    .set([jsonView, userMessageBox], { opacity: 0 }) // Ensure start state
    .to(textBox, { opacity: 1, duration: 0.5, ease: "power1.out" })
    .to(queryText, { duration: 1.5, text: "Capital of France?", ease: "none", onComplete: () => { gsap.to(cursor, { opacity: 0, duration: 0.3 }); } })
    .to(textBox, { scale: 1.05, duration: 0.2, repeat: 1, yoyo: true, ease: "power1.inOut", onComplete: () => gsap.set(textBox, { scale: 1 }) })
    .addLabel("initialEnd");

// 2. Calculate scales for Transition 1 (Positioned 1s after initialEnd)
//    Add a label right where the calculation happens.
tl.addLabel("calc1", "initialEnd+=1.0") // *** PAUSE 1: Label marks start of pause interval ***
  .call(() => {
    scales1 = getElementDimensions();
    // console.log("Calculating scales for T1:", scales1);
    if (!scales1 || !scales1.jsonToTextScaleX) { // Add check
        console.error("Failed to calculate scales1 correctly!");
        scales1 = { textToJsonScaleX: 1, textToJsonScaleY: 1, jsonToTextScaleX: 1, jsonToTextScaleY: 1 }; // Fallback
    }
}, [], "calc1"); // Execute calculation AT calc1 label

// 3. Transition 1: Text Box -> JSON View (Duration: 1s)
//    Start the transition AT the calc1 label (immediately after calculation)
tl.to(textBox, {
    opacity: 0,
    scaleX: () => scales1.textToJsonScaleX,
    scaleY: () => scales1.textToJsonScaleY,
    duration: 1.0, // *** TRANSITION DURATION: 1 second ***
    ease: "power1.inOut"
}, "calc1") // *** Start tween AT calc1 label ***

.fromTo(jsonView,
    {
        opacity: 0,
        // Ensure scale values are valid numbers before applying
        scaleX: () => scales1 && isFinite(scales1.jsonToTextScaleX) ? scales1.jsonToTextScaleX : 1,
        scaleY: () => scales1 && isFinite(scales1.jsonToTextScaleY) ? scales1.jsonToTextScaleY : 1
    },
    {
        opacity: 1, scaleX: 1, scaleY: 1,
        duration: 1.0, // *** TRANSITION DURATION: 1 second ***
        ease: "power1.inOut"
    },
"calc1") // *** Start tween AT calc1 label ***
.addLabel("transition1End"); // Label marks the end of this 1s transition

// 4. Calculate scales for Transition 2 (Positioned 1s after transition1End)
tl.addLabel("calc2", "transition1End+=1.0") // *** PAUSE 2: Label marks start of pause interval ***
  .call(() => {
    scales2 = getElementDimensions();
    // console.log("Calculating scales for T2:", scales2);
    if (!scales2 || !scales2.msgToJsonScaleX) { // Add check
        console.error("Failed to calculate scales2 correctly!");
        scales2 = { jsonToMsgScaleX: 1, jsonToMsgScaleY: 1, msgToJsonScaleX: 1, msgToJsonScaleY: 1 }; // Fallback
    }
}, [], "calc2"); // Execute calculation AT calc2 label

// 5. Transition 2: JSON View -> User Message Box (Duration: 1s)
//    Start the transition AT the calc2 label
tl.to(jsonView, {
    opacity: 0,
    scaleX: () => scales2.jsonToMsgScaleX,
    scaleY: () => scales2.jsonToMsgScaleY,
    duration: 1.0, // *** TRANSITION DURATION: 1 second ***
    ease: "power1.inOut"
}, "calc2") // *** Start tween AT calc2 label ***

.fromTo(userMessageBox,
    {
        opacity: 0,
        scaleX: () => scales2 && isFinite(scales2.msgToJsonScaleX) ? scales2.msgToJsonScaleX : 1,
        scaleY: () => scales2 && isFinite(scales2.msgToJsonScaleY) ? scales2.msgToJsonScaleY : 1
    },
    {
        opacity: 1, scaleX: 1, scaleY: 1,
        duration: 1.0, // *** TRANSITION DURATION: 1 second ***
        ease: "power1.inOut"
    },
"calc2") // *** Start tween AT calc2 label ***
.addLabel("transition2End"); // Label marks the end of this 1s transition

// 6. Final Pause (Duration: 1s)
//    Starts exactly when Transition 2 finishes
tl.to({}, { duration: 1.0 }, "transition2End"); // *** PAUSE 3: Add 1s delay starting at transition2End ***


// Optional: Add controls for restarting the animation
// document.body.addEventListener('click', () => tl.restart());
// console.log("Timeline duration:", tl.duration());