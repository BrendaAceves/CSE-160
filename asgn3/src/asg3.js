// Shaders
var VSHADER_SOURCE = `
  precision mediump float;

  attribute vec4 a_Position;
  attribute vec2 a_UV;

  varying vec2 v_UV;

  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_GlobalRotateMatrix;

  void main() {
    gl_Position =
      u_ProjectionMatrix *
      u_ViewMatrix *
      u_GlobalRotateMatrix *
      u_ModelMatrix *
      a_Position;

    v_UV = a_UV;
  }
`;

var FSHADER_SOURCE = `
  precision mediump float;

  varying vec2 v_UV;

  uniform vec4 u_FragColor;

  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;

  uniform int u_whichTexture;

  void main() {

    if(u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    }

    else if(u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    }

    else if(u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    }

    else {
      gl_FragColor = vec4(1,0,1,1);
    }
  }
`;


// Globals
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_GlobalRotateMatrix;

let u_Sampler0;
let u_Sampler1;

let u_whichTexture;

let g_camera;

let g_globalAngle = 0;

let lastX = null;
let lastY = null;

let g_startTime = performance.now();
let g_frameCount = 0;

let g_treasureX = 0;
let g_treasureZ = 0;

let g_gameStarted = false;
let g_timeLimit = 60;
let g_startTimeGame = 0;
let g_gameOver = false;

// Global Map
let g_map = [];

for(let x = 0; x < 32; x++) {
  g_map.push([]);
  for(let z = 0; z < 32; z++) {

    // border walls
    if( x == 0 || z == 0 || x == 31 || z == 31) {
      g_map[x].push(4);
    }

    else {
      let rand = Math.random();

      if(rand < 0.08) {
        g_map[x].push(4);
      }

      else if(rand < 0.15) {
        g_map[x].push(3);
      }

      else if(rand < 0.25) {
        g_map[x].push(2);
      }

      else if(rand < 0.35) {
        g_map[x].push(1);
      }

      else {
        g_map[x].push(0);
      }
    }
  }
}

function spawnTreasure() {

  while(true) {
    let x = Math.floor(Math.random() * 30) + 1;
    let z = Math.floor(Math.random() * 30) + 1;

    // avoid giant towers
    if(g_map[x][z] < 3) {
      g_treasureX = x;
      g_treasureZ = z;
      return;
    }
  }
}

// Main
function main() {
  setupWebGL();
  connectVariablesToGLSL();

  g_camera = new Camera();
  document.onkeydown = keydown;

  initTextures();
  setupMouseControls();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  alert("Find the hidden treasure within 60 seconds!");
  spawnTreasure();

  g_startTimeGame = performance.now();
  g_gameStarted = true;

  tick();
}

// WebGL Setup

function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext("webgl");

  if (!gl) {
    console.log('Failed to get WebGL context');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');

  let identityM = new Matrix4();

  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

  initTriangle3DUV();
}

// Textures
function initTextures() {
  let image0 = new Image();
  image0.onload = function() { sendTextureToGLSL(image0, 0); };
  image0.src = 'dirt.jpg';

  let image1 = new Image();
  image1.onload = function() { sendTextureToGLSL(image1, 1);};
  image1.src = 'grass.jpg';
}


function sendTextureToGLSL(image, textureUnit) {
  let texture = gl.createTexture();
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  if(textureUnit == 0) {
    gl.activeTexture(gl.TEXTURE0);
  }

  else if(textureUnit == 1) {
    gl.activeTexture(gl.TEXTURE1);
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB,
    gl.RGB,
    gl.UNSIGNED_BYTE,
    image
  );

  if(textureUnit == 0) {
    gl.uniform1i(u_Sampler0, 0);
  }

  else if(textureUnit == 1) {
    gl.uniform1i(u_Sampler1, 1);
  }

  renderAllShapes();
}

// Keyboard Controls
function keydown(ev) {

  switch(ev.key.toLowerCase()) {
    case 'w':
      g_camera.moveForward();
      break;

    case 's':
      g_camera.moveBackward();
      break;

    case 'a':
      g_camera.moveLeft();
      break;

    case 'd':
      g_camera.moveRight();
      break;

    case 'q':
      g_camera.panLeft();
      break;

    case 'e':
      g_camera.panRight();
      break;

    case 'f':
      addBlock();
      break;

    case 'g':
      removeBlock();
      break;
  }

  checkTreasure();
  renderAllShapes();
}

// Mouse Controls
function setupMouseControls() {
  canvas.onmousemove = function(ev) {

    if (lastX === null) {
      lastX = ev.clientX;
      lastY = ev.clientY;
      return;
    }

    let dx = ev.clientX - lastX;
    let dy = ev.clientY - lastY;

    lastX = ev.clientX;
    lastY = ev.clientY;

    // Horizontal mouse movement
    if (dx > 0) {
      g_camera.panRight(dx * 0.2);
    } else {
      g_camera.panLeft(-dx * 0.2);
    }

    // Vertical mouse movement
    g_camera.panUp(-dy * 0.2);

    renderAllShapes();
  };

  canvas.onmousedown = function(ev) {

    // left click (remove/confirm treasure)
    if(ev.button == 0) {
      removeBlock();
    }

    // right click = add
    else if(ev.button == 2) {
      addBlock();
    }

    renderAllShapes();
  };  

  canvas.oncontextmenu = function(ev) {
    ev.preventDefault(); 
  };
}

function drawMap() {
  for(let x = 0; x < 32; x++) {
    
    for(let z = 0; z < 32; z++) {
      let height = g_map[x][z];
      
      for(let y = 0; y < height; y++) {
        
        let wall = new Cube();
        wall.textureNum = 0;
        wall.matrix.translate(
          x - 16,
          y - 1,
          z - 16
        );

        wall.render();
      }
    }
  }
}

function getForwardBlock() {

  let eyeX = g_camera.eye.elements[0];
  let eyeY = g_camera.eye.elements[1];
  let eyeZ = g_camera.eye.elements[2];

  let dirX = g_camera.at.elements[0] - eyeX;

  let dirY = g_camera.at.elements[1] - eyeY;

  let dirZ = g_camera.at.elements[2] - eyeZ;

  let len = Math.sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ);

  dirX /= len;
  dirY /= len;
  dirZ /= len;

  for(let t = 0; t < 8; t += 0.05) {

    let wx = eyeX + dirX * t;
    let wy = eyeY + dirY * t;
    let wz = eyeZ + dirZ * t;

    let mapX = Math.floor(wx + 16);
    let mapZ = Math.floor(wz + 16);

    let mapY = Math.floor(wy + 1);

    if( mapX >= 0 && mapX < 32 && mapZ >= 0 && mapZ < 32) {

      if(mapY < g_map[mapX][mapZ]) {

        return {
          x: mapX,
          y: mapY,
          z: mapZ,

          placeX: mapX,
          placeZ: mapZ
        };
      }
    }
  }

  return null;
}

function removeBlock() {
  let hit = getForwardBlock();
  if(hit) {
    if(g_map[hit.x][hit.z] > 0) {
      g_map[hit.x][hit.z]--;
    }
  }
}

function addBlock() {
  let hit = getForwardBlock();

  if(hit) {
    let x = hit.placeX;
    let z = hit.placeZ;

    if( x >= 0 && x < 32 && z >= 0 && z < 32 ) {
      if(g_map[x][z] < 8) {
        g_map[x][z]++;
      }
    }
  }
}

function checkTreasure() {

  if(g_gameOver) return;

  let px = g_camera.eye.elements[0] + 16;
  let pz = g_camera.eye.elements[2] + 16;

  let dx = px - g_treasureX;
  let dz = pz - g_treasureZ;

  let distance = Math.sqrt(dx * dx + dz * dz);

  // player is close enough
  if(distance < 1.5) {
    g_gameStarted = false;

    let again = confirm(
      "You found the treasure! Play again?"
    );

    if(again) {
      location.reload();
    }
  }
}

function renderAllShapes() {

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // projection matrix
  gl.uniformMatrix4fv( u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);

  // view matrix
  gl.uniformMatrix4fv( u_ViewMatrix, false, g_camera.viewMatrix.elements);

  // global rotation
  let globalRotMat = new Matrix4();

  globalRotMat.rotate(g_globalAngle, 0, 1, 0);

  gl.uniformMatrix4fv( u_GlobalRotateMatrix, false, globalRotMat.elements);


  // floor
  let floor = new Cube();
  floor.textureNum = 1;
  floor.matrix.translate(0, -1, 0);
  floor.matrix.scale(40, 0.01, 40);
  floor.matrix.translate(-0.5, 0, -0.5);
  floor.render();


  // sky

  let sky = new Cube();
  sky.textureNum = -2;
  sky.color = [0.4, 0.7, 1.0, 1.0];
  sky.matrix.scale(100,100,100);
  sky.matrix.translate(-0.5,-0.5,-0.5);
  sky.render();

  // world
  drawMap();

  // Treasure
  let treasure = new Cube();
  treasure.textureNum = -2;
  treasure.color = [1.0, 0.85, 0.0, 1.0];

  treasure.matrix.translate(g_treasureX - 16, g_map[g_treasureX][g_treasureZ], g_treasureZ - 16);
  treasure.render();

  // fps
  g_frameCount++;
  let now = performance.now();
  if(now - g_startTime >= 1000) {
    let fps = g_frameCount;
    console.log("FPS:", fps);
    document.getElementById("fps").innerText = "FPS: " + fps;
    g_frameCount = 0;
    g_startTime = now;
  }
}

function tick() {

  if(g_gameStarted) {

    let elapsed = (performance.now() - g_startTimeGame) / 1000;

    let timeLeft = Math.ceil(g_timeLimit - elapsed);

    document.getElementById("timer").innerText =
      "Time Left: " + timeLeft;

    if(timeLeft <= 0 && !g_gameOver) {
        g_gameOver = true;
        g_gameStarted = false;

      alert("Time's up! You failed to find the treasure.");

      location.reload();

      return;
    }
  }

  renderAllShapes();

  requestAnimationFrame(tick);
}