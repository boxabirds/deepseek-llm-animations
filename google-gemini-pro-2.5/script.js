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

// Scene 1: The User’s Query Appears
tl
    // 1. Fade in text box
    .to(textBox, {
        opacity: 1,
        duration: 1,
        ease: "power1.inOut"
    })

    // 2. Type out the query text
    .to(queryText, {
        duration: 2, // Adjust speed as needed
        text: "Capital of France?",
        ease: "none",
        onComplete: () => {
            // Hide cursor after typing is complete
            gsap.to(cursor, { opacity: 0, duration: 0.3 });
        }
    }, "+=0.5") // Start 0.5s after previous animation ends

    // 3. Pulse the text box once complete
    .to(textBox, {
        scale: 1.05, // Slightly larger
        duration: 0.2,
        repeat: 1, // Pulse once (down and up)
        yoyo: true, // Go back to original scale
        ease: "power1.inOut"
    }, "+=0.3") // Start 0.3s after typing ends

    // 4. Zoom in to reveal JSON structure
    // Simultaneously scale up text box (as if zooming into it) and fade it out,
    // while scaling up and fading in the JSON view from the center.
    .to(textBox, {
        scale: 8, // Dramatically zoom the box
        opacity: 0, // Fade it out during zoom
        duration: 1.2,
        ease: "power2.in" // Accelerate into the zoom
    }, "+=0.5") // Start 0.5s after pulse

    .fromTo(jsonView,
        { scale: 0.1, opacity: 0 }, // Start small and transparent
        {
            scale: 1, // Scale to normal size
            opacity: 1, // Fade in
            duration: 1.2,
            ease: "power2.out" // Decelerate out of the zoom
        },
    "<") // Start at the same time as the previous animation (textBox zoom)

    // 5. Pause for a beat to show the JSON
    .to({}, { duration: 1.5 }) // Empty tween for delay

    // 6. Transition: Shrink JSON down into the "User Message" box
    // Simultaneously scale down/fade out JSON view,
    // and scale up/fade in the final compact box.
    .to(jsonView, {
        scale: 0.1, // Shrink down
        opacity: 0, // Fade out
        duration: 1,
        ease: "power2.in" // Accelerate into the shrink
    })

    .fromTo(userMessageBox,
        { scale: 0.1, opacity: 0 }, // Start small and transparent
        {
            scale: 1, // Scale to normal size
            opacity: 1, // Fade in
            duration: 1,
            ease: "elastic.out(1, 0.7)" // Add a little bounce for effect
        },
    "<"); // Start at the same time as the JSON shrink

// Optional: Add controls for restarting the animation
// document.body.addEventListener('click', () => tl.restart());