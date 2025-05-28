// script.js
document.addEventListener('DOMContentLoaded', () => {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.getElementById('background-svg');

  let width = window.innerWidth;
  let height = window.innerHeight;

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  // Clear previous children if any
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  // iRacing colors
  const colors = [
    { fill: 'rgba(35, 164, 85, 0.2)', stroke: 'rgba(35, 164, 85, 0.7)' },  // Green
    { fill: 'rgba(224, 59, 62, 0.15)', stroke: 'rgba(224, 59, 62, 0.6)' },   // Red
    { fill: 'rgba(255, 255, 255, 0.12)', stroke: 'rgba(255, 255, 255, 0.5)' } // White
  ];

  const shapes = [];

  function createSwoop(id, fill, stroke, startX, startY, scaleX, scaleY, rotation) {
    const path = document.createElementNS(svgNS, 'path');

    path.setAttribute('fill', fill);
    path.setAttribute('stroke', stroke);
    path.setAttribute('stroke-width', '3');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('filter', `drop-shadow(0 0 6px ${stroke})`);
    path.style.mixBlendMode = 'screen'; // nice blending

    svg.appendChild(path);

    // Large swooping Bezier path (a stylized wave)
    // Start far left offscreen, swoop high, curve low, and go off right side
    const basePath = `
      M -200,${height * 0.8}
      C ${width * 0.2},${height * 0.5}
        ${width * 0.4},${height * 1.2}
        ${width * 0.6},${height * 0.7}
      S ${width * 1.2},${height * 0.2}
        ${width + 200},${height * 0.6}
      L ${width + 300},${height + 300}
      L -300,${height + 300}
      Z
    `;

    return {
      id,
      path,
      basePath,
      startX,
      startY,
      scaleX,
      scaleY,
      rotation,
      progress: 0,
      direction: 1,
      opacityBase: parseFloat(fill.match(/[\d\.]+(?=\))/g)?.[3]) || 0.15,
    };
  }

  // Create 3 swooping shapes with varying positions and transforms
  shapes.push(createSwoop(0, colors[0].fill, colors[0].stroke, -100, 0, 1.2, 1.4, -8));
  shapes.push(createSwoop(1, colors[1].fill, colors[1].stroke, 0, -50, 1.5, 1.3, 5));
  shapes.push(createSwoop(2, colors[2].fill, colors[2].stroke, -150, 30, 1.1, 1.2, -3));

  // Resize handler to update viewbox and shape basePaths
  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    shapes.forEach(shape => {
      shape.basePath = `
        M -200,${height * 0.8}
        C ${width * 0.2},${height * 0.5}
          ${width * 0.4},${height * 1.2}
          ${width * 0.6},${height * 0.7}
        S ${width * 1.2},${height * 0.2}
          ${width + 200},${height * 0.6}
        L ${width + 300},${height + 300}
        L -300,${height + 300}
        Z
      `;
    });
  });

  // Animate shapes by slowly moving them left/right and pulsating opacity
  function animate(t = 0) {
    shapes.forEach((shape, i) => {
      // Update horizontal offset as sine wave for smooth flow
      shape.progress += 0.0015 * (i + 1);
      if (shape.progress > 1) shape.progress -= 1;

      // Compute translation offset: oscillate ±80px horizontally
      const xOffset = Math.sin(shape.progress * 2 * Math.PI) * 80;

      // Compute pulsating opacity between base and base + 0.05
      const opacity = shape.opacityBase + 0.05 * Math.sin(t * 0.002 + i);

      // Apply updated path + transform
      shape.path.setAttribute('d', shape.basePath);
      shape.path.style.opacity = opacity.toFixed(3);
      shape.path.style.transform = `
        translateX(${xOffset + shape.startX}px)
        translateY(${shape.startY}px)
        scale(${shape.scaleX}, ${shape.scaleY})
        rotate(${shape.rotation}deg)
      `;
    });

    requestAnimationFrame(animate);
  }

  animate();
});
