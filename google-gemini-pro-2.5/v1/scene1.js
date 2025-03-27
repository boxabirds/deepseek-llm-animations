// scene1.js

// This function now accepts the timeline, element references, and the dimension function
function createScene1Timeline(timeline, elements, getDimensions) {
    // Destructure needed elements from the passed object
    const { textBox, queryText, cursor, jsonView, userMessageBox } = elements;

    let scales1 = {}; let scales2 = {};
    function calculateScene1Scales() {
        const dims = getDimensions(); // Use the passed function
        scales1 = {
            textToJsonScaleX: dims.jsonView.width / dims.textBox.width, textToJsonScaleY: dims.jsonView.height / dims.textBox.height,
            jsonToTextScaleX: dims.textBox.width / dims.jsonView.width, jsonToTextScaleY: dims.textBox.height / dims.jsonView.height,
        };
        scales2 = {
            jsonToMsgScaleX: dims.msgBox.width / dims.jsonView.width, jsonToMsgScaleY: dims.msgBox.height / dims.jsonView.height,
            msgToJsonScaleX: dims.jsonView.width / dims.msgBox.width, msgToJsonScaleY: dims.jsonView.height / dims.msgBox.height,
        };
        for (const key in scales1) if (!isFinite(scales1[key])) scales1[key] = 1;
        for (const key in scales2) if (!isFinite(scales2[key])) scales2[key] = 1;
    }

    // Add Scene 1 animations to the passed timeline instance
    timeline
        // Note: Initial .set for all elements is better done in the main script or respective scene starts
        .set([jsonView, userMessageBox], { opacity: 0 }) // Ensure Scene 1 elements start correctly
        .to(textBox, { opacity: 1, duration: 0.5, ease: "power1.out" })
        .to(queryText, { duration: 1.5, text: "Capital of France?", ease: "none", onComplete: () => { gsap.to(cursor, { opacity: 0, duration: 0.3 }); } })
        .to(textBox, { scale: 1.05, duration: 0.2, repeat: 1, yoyo: true, ease: "power1.inOut", onComplete: () => gsap.set(textBox, { scale: 1 }) })
        .addLabel("initialEnd");
    timeline.addLabel("calc1", "initialEnd+=1.0").call(calculateScene1Scales, [], "calc1");
    timeline.to(textBox, { opacity: 0, scaleX: () => scales1.textToJsonScaleX, scaleY: () => scales1.textToJsonScaleY, duration: 1.0, ease: "power1.inOut" }, "calc1")
            .fromTo(jsonView, { opacity: 0, scaleX: () => scales1.jsonToTextScaleX, scaleY: () => scales1.jsonToTextScaleY }, { opacity: 1, scaleX: 1, scaleY: 1, duration: 1.0, ease: "power1.inOut" }, "calc1")
            .addLabel("transition1End");
    timeline.addLabel("calc2", "transition1End+=1.0").call(calculateScene1Scales, [], "calc2");
    timeline.to(jsonView, { opacity: 0, scaleX: () => scales2.jsonToMsgScaleX, scaleY: () => scales2.jsonToMsgScaleY, duration: 1.0, ease: "power1.inOut" }, "calc2")
            .fromTo(userMessageBox, { opacity: 0, scaleX: () => scales2.msgToJsonScaleX, scaleY: () => scales2.msgToJsonScaleY }, { opacity: 1, scaleX: 1, scaleY: 1, duration: 1.0, ease: "power1.inOut" }, "calc2")
            .addLabel("transition2End");
    timeline.to({}, { duration: 1.0 }, "transition2End"); // Final 1s pause of Scene 1

    return "transition2End+=1.0"; // Point where Scene 2 starts
}

// Export the function to make it available for import
export { createScene1Timeline };