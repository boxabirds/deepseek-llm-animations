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

// Particles (for background and morphing)
const particles = new THREE.BufferGeometry();
const particleCount = 2000;
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
jsonCube.scale.set(0, 0, 0);
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
    cursor.style.display = "none";
    setTimeout(startMorphAnimation, 1000);
  }
}

// Morph Animation: Text → Particles → JSON
function startMorphAnimation() {
  // Step 1: Pulse and dissolve text into particles
  gsap.to(queryContainer, {
    scale: 1.05,
    duration: 0.5,
    yoyo: true,
    repeat: 1,
    ease: "power2.inOut",
    onComplete: () => {
      // Hide the DOM text
      gsap.to(queryContainer, { opacity: 0, duration: 0.5 });

      // Create particle explosion (simulate text dissolving)
      const textParticles = createTextParticles(queryText.textContent);
      scene.add(textParticles);

      // Camera zoom in
      camera.position.z = 5;
      gsap.to(camera.position, { z: 1.5, duration: 1.5, ease: "power2.inOut" });

      // Step 2: Reconfigure particles into JSON
      setTimeout(() => {
        // Animate particles to form JSON structure
        animateParticlesToJSON(textParticles, () => {
          // Step 3: Compress into cube
          setTimeout(() => {
            scene.remove(textParticles);
            gsap.to(jsonCube.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "elastic.out" });
            gsap.to(camera.position, { z: 3, duration: 1.5 });
          }, 1500);
        });
      }, 1000);
    }
  });
}

// Helper: Create particles from text
function createTextParticles(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.font = "Bold 48px Fira Code";
  ctx.fillStyle = "#00ffff";
  ctx.fillText(text, 10, 50);

  const texture = new THREE.CanvasTexture(canvas);
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  // Sample pixels from the text canvas
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  let particleIndex = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 0 && particleIndex < particleCount) {
      const x = (i / 4) % canvas.width;
      const y = Math.floor((i / 4) / canvas.width);
      positions[particleIndex * 3] = (x / canvas.width - 0.5) * 5;
      positions[particleIndex * 3 + 1] = -(y / canvas.height - 0.5) * 2;
      positions[particleIndex * 3 + 2] = 0;
      colors[particleIndex * 3] = 0.0;
      colors[particleIndex * 3 + 1] = 0.8;
      colors[particleIndex * 3 + 2] = 1.0;
      particleIndex++;
    }
  }

  particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  particles.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
  });
  return new THREE.Points(particles, material);
}

// Helper: Animate particles to form JSON
function animateParticlesToJSON(particles, onComplete) {
  const jsonPositions = [];
  const jsonText = `{\n  "input": "Capital of France?",\n  "metadata": {\n    "language": "en",\n    "intent": "factual_query"\n  }\n}`;
  const jsonLines = jsonText.split("\n");

  // Generate target positions for particles (spelling out JSON)
  for (let i = 0; i < jsonLines.length; i++) {
    for (let j = 0; j < jsonLines[i].length; j++) {
      jsonPositions.push({
        x: (j * 0.1) - (jsonLines[i].length * 0.05),
        y: -i * 0.2 + 0.5,
        z: 0,
      });
    }
  }

  // Animate particles to new positions
  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const target = jsonPositions[i % jsonPositions.length];
    gsap.to(positions, {
      [i]: target.x,
      [i + 1]: target.y,
      [i + 2]: target.z,
      duration: 2,
      ease: "power2.inOut",
      onComplete: i === 0 ? onComplete : null,
    });
  }
  particles.geometry.attributes.position.needsUpdate = true;
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
