import * as THREE from 'three';

// Constants
export const PARTICLE_COUNT = 15000;
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1000;

// Helper to get random point in sphere
export const getSpherePositions = (count: number, radius: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius * Math.cbrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
};

// Helper to get cone/tree positions
export const getTreePositions = (count: number): { positions: Float32Array, colors: Float32Array } => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color1 = new THREE.Color('#0f5e2d'); // Dark Green
  const color2 = new THREE.Color('#3fc973'); // Light Green
  const gold = new THREE.Color('#FFD700');
  const red = new THREE.Color('#FF0000');
  const blue = new THREE.Color('#00BFFF');

  for (let i = 0; i < count; i++) {
    // 80% tree body, 20% ornaments/star
    const isBody = Math.random() < 0.85;
    
    // Normalized height 0 to 1
    const h = Math.random(); 
    // Radius decreases as height increases (Cone)
    const r = (1 - h) * 15 * Math.sqrt(Math.random()); 
    const theta = h * 50 + Math.random() * Math.PI * 2; // Spiral effect

    const x = r * Math.cos(theta);
    const y = h * 30 - 15; // Centered vertically
    const z = r * Math.sin(theta);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Coloring
    if (isBody) {
      const c = color1.clone().lerp(color2, Math.random());
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    } else {
      // Ornaments
      const choice = Math.random();
      let c;
      if (h > 0.98) c = gold; // Star at top
      else if (choice < 0.33) c = red;
      else if (choice < 0.66) c = gold;
      else c = blue;
      
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
  }
  return { positions, colors };
};

// Helper to get galaxy/explosion positions
export const getGalaxyPositions = (count: number): { positions: Float32Array, colors: Float32Array } => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const centerColor = new THREE.Color('#ffaa00');
    const outerColor = new THREE.Color('#aa00ff');
    const colorsPalette = [
        new THREE.Color('#FF0000'), // Red
        new THREE.Color('#FFFF00'), // Yellow
        new THREE.Color('#00FFFF'), // Cyan
        new THREE.Color('#FF00FF'), // Magenta
        new THREE.Color('#FFFFFF'), // White
    ];

    for(let i=0; i<count; i++) {
        // Spiral galaxy + random sphere distribution
        const r = Math.random() * 30;
        const spinAngle = r * 0.5;
        const branchAngle = (Math.floor(Math.random() * 3) * 2 * Math.PI) / 3;
        
        const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 5;
        const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 5;
        const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 5;

        positions[i*3] = Math.cos(branchAngle + spinAngle) * r + randomX;
        positions[i*3+1] = (Math.random() - 0.5) * (r/2) + randomY; // Flatter
        positions[i*3+2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

        // Color based on radius or random "photo" color
        const isPhoto = Math.random() > 0.5;
        let c;
        if(isPhoto) {
            c = colorsPalette[Math.floor(Math.random() * colorsPalette.length)];
        } else {
            c = centerColor.clone().lerp(outerColor, r / 30);
        }

        colors[i*3] = c.r;
        colors[i*3+1] = c.g;
        colors[i*3+2] = c.b;
    }

    return { positions, colors };
}


// Canvas-based Text Sampler
// This generates coordinates based on 2D text rendering
export const getTextPositions = (text: string, count: number, fontSize: number = 300): Float32Array => {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Float32Array(count * 3);

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${fontSize}px "Arial", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

  const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const data = imageData.data;
  
  const validPixels: [number, number][] = [];
  
  // Scan specifically where pixels are white
  for (let y = 0; y < CANVAS_HEIGHT; y += 4) { // Optimization: skip rows/cols
    for (let x = 0; x < CANVAS_WIDTH; x += 4) {
      const index = (y * CANVAS_WIDTH + x) * 4;
      if (data[index] > 128) { // Red channel > 128
        validPixels.push([x, y]);
      }
    }
  }

  const positions = new Float32Array(count * 3);
  
  if (validPixels.length === 0) return getSpherePositions(count, 10);

  for (let i = 0; i < count; i++) {
    // If we have more particles than pixels, reuse pixels randomly
    // If fewer, sample randomly
    const sampleIndex = Math.floor(Math.random() * validPixels.length);
    const [x, y] = validPixels[sampleIndex];

    // Map 2D canvas to 3D world space
    // Scale down to fit view
    const posX = (x - CANVAS_WIDTH / 2) * 0.08;
    const posY = -(y - CANVAS_HEIGHT / 2) * 0.08; // Invert Y for 3D
    const posZ = (Math.random() - 0.5) * 2; // Add slight depth

    positions[i * 3] = posX;
    positions[i * 3 + 1] = posY;
    positions[i * 3 + 2] = posZ;
  }

  return positions;
};
