// scene2.js

// Accepts timeline, start time, elements, and the dimension function
function createScene2Timeline(timeline, startTime, elements, getDimensions) {
    // Destructure needed elements
    const { userMessageBox, chatHistoryBox, chatHistoryJson } = elements;

    let scene2Scales = {};
    function calculateScene2Scales() {
        const dims = getDimensions(); // Use passed function
        scene2Scales = {
            boxToJsonScaleX: dims.chatJson.width / dims.chatBox.width, boxToJsonScaleY: dims.chatJson.height / dims.chatBox.height,
            jsonToBoxScaleX: dims.chatBox.width / dims.chatJson.width, jsonToBoxScaleY: dims.chatBox.height / dims.chatJson.height,
        };
        for (const key in scene2Scales) if (!isFinite(scene2Scales[key])) scene2Scales[key] = 1;
    }

    const boxSpacing = 20;
    let finalMsgBoxX, finalChatBoxX;

    // Set initial state for Scene 2 elements
    timeline.set([chatHistoryBox, chatHistoryJson], { opacity: 0 }, 0); // Ensure hidden at start
    timeline.set(chatHistoryBox, { transform: "translateX(-150vw)" }, 0); // Ensure off-screen

    // Calculate final positions
    timeline.call(() => {
        const dims = getDimensions();
        const totalWidth = dims.msgBox.width + dims.chatBox.width + boxSpacing;
        finalMsgBoxX = totalWidth / 2 - dims.msgBox.width / 2;
        finalChatBoxX = -totalWidth / 2 + dims.chatBox.width / 2;
    }, [], startTime);

    // 1. Slide in Chat History Box & Prep User Message Box
    timeline.to(chatHistoryBox, {
        opacity: 1,
        transform: "translateX(0)", // Bring to center
        duration: 1.0, ease: "power2.out"
    }, startTime)
    .to(userMessageBox, { // Placeholder tween to ensure timing sync if needed later
        duration: 1.0, ease: "power2.out"
    }, startTime);
    timeline.addLabel("chatBoxVisible", startTime + "+=1.0");

    // 2. Calculate scales for zoom
    timeline.addLabel("calc3", "chatBoxVisible+=0.5").call(calculateScene2Scales, [], "calc3");

    // 3. Zoom In: Box -> JSON
    timeline.to(chatHistoryBox, {
        opacity: 0, scaleX: () => scene2Scales.boxToJsonScaleX, scaleY: () => scene2Scales.boxToJsonScaleY,
        duration: 0.8, ease: "power1.inOut"
    }, "calc3")
    .fromTo(chatHistoryJson,
        { opacity: 0, scaleX: () => scene2Scales.jsonToBoxScaleX, scaleY: () => scene2Scales.jsonToBoxScaleY },
        { opacity: 1, scaleX: 1, scaleY: 1, duration: 0.8, ease: "power1.inOut" },
    "calc3")
    .addLabel("chatJsonVisible");

    // 4. Pause
    timeline.addLabel("zoomOutStart", "chatJsonVisible+=1.5");

    // 5. Zoom Out: JSON -> Box
    timeline.to(chatHistoryJson, {
        opacity: 0, scaleX: () => scene2Scales.jsonToBoxScaleX, scaleY: () => scene2Scales.jsonToBoxScaleY,
        duration: 0.8, ease: "power1.inOut"
    }, "zoomOutStart")
    .fromTo(chatHistoryBox,
        { opacity: 0, scaleX: () => scene2Scales.boxToJsonScaleX, scaleY: () => scene2Scales.boxToJsonScaleY },
        { opacity: 1, scaleX: 1, scaleY: 1, duration: 0.8, ease: "power1.inOut" },
    "zoomOutStart")
    .addLabel("chatBoxRestored");

    // 6. Move boxes side-by-side
    timeline.to(chatHistoryBox, {
        x: () => finalChatBoxX,
        duration: 0.6, ease: "power1.inOut"
    }, "chatBoxRestored+=0.2")
    .to(userMessageBox, {
        x: () => finalMsgBoxX,
        duration: 0.6, ease: "power1.inOut"
    }, "<"); // Move simultaneously

    return "chatBoxRestored+=0.8"; // End time = start + duration
}

// Export the function
export { createScene2Timeline };