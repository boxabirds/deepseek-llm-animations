// Three.js Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("canvas-container").appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0x00ffff, 1, 100);
pointLight.position.set(0, 0, 5);
scene.add(pointLight);

// Particles (for background)
const particles = new THREE.BufferGeometry();
const particleCount = 1000;
const posArray = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 10;
}
particles.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
const particleMaterial = new THREE.PointsMaterial({
  size: 0.02,
  color: 0x4fc3f7,
  transparent: true,
  opacity: 0.8,
});
const particleMesh = new THREE.Points(particles, particleMaterial);
scene.add(particleMesh);

// JSON Cube (final state)
const jsonCubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const jsonCubeMaterial = new THREE.MeshPhongMaterial({
  color: 0x00ffff,
  emissive: 0x004444,
  wireframe: true,
});
const jsonCube = new THREE.Mesh(jsonCubeGeometry, jsonCubeMaterial);
jsonCube.position.set(0, 0, 0);
jsonCube.scale.set(0, 0, 0); // Start invisible
scene.add(jsonCube);

// Text Typing Animation
const queryText = document.getElementById("query-text");
const queryContainer = document.getElementById("query-container");
const cursor = document.getElementById("cursor");
const query = "Capital of France?";
let charIndex = 0;

function typeWriter() {
  if (charIndex < query.length) {
    queryText.textContent += query.charAt(charIndex);
    charIndex++;
    setTimeout(typeWriter, 100);
  } else {
    cursor.style.display = "none"; // Hide cursor after typing
    setTimeout(startThreeJSAnimation, 1000);
  }
}

// Three.js Animation Timeline
function startThreeJSAnimation() {
  // Pulse the query container
  gsap.to(queryContainer, {
    scale: 1.05,
    duration: 0.3,
    yoyo: true,
    repeat: 1,
    ease: "power2.inOut",
    onComplete: () => {
      // Camera zoom into text
      camera.position.z = 5;
      gsap.to(camera.position, { z: 1, duration: 1.5, ease: "power2.inOut" });

      // Replace text with JSON after zoom
      setTimeout(() => {
        const jsonText = `{\n  "input": "Capital of France?",\n  "metadata": {\n    "language": "en",\n    "intent": "factual_query"\n  }\n}`;
        queryText.textContent = jsonText;
        queryText.style.fontSize = "0.9em";
        queryText.style.color = "#4fc3f7";
        queryContainer.style.width = "auto"; // Adjust container width

        // Compress into cube
        setTimeout(() => {
          gsap.to(queryContainer, { opacity: 0, duration: 0.5 });
          gsap.to(jsonCube.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "elastic.out" });
          gsap.to(camera.position, { z: 3, duration: 1.5 });
        }, 2000);
      }, 1500);
    }
  });
}

// Start the animation
typeWriter();

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  particleMesh.rotation.x += 0.0005;
  particleMesh.rotation.y += 0.0005;
  jsonCube.rotation.x += 0.01;
  jsonCube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
