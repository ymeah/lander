const startBtn = document.getElementById("startBtn");
const statusDiv = document.getElementById("status");
const canvas = document.getElementById("game-area");
const ctx = canvas.getContext("2d");

let prjs=[];

// Set the canvas size to 400x400
canvas.width = 400;
canvas.height = 400;

const gravity = 0.01;
const sideEngineThrust = 0.01;
const mainEngineThrust = 0.03;
const lzBluffer = 5;
const ship = {
  color: "blue",
  // height, width
  w: 10,
  h: 22,
  // position
  x: 0,
  y: 0,
  // velocity
  dx: 0,
  dy: 0,
  mainEngine: false,
  leftEngine: false,
  rightEngine: false,
  crashed: false,
  landed: false,
};

const platform = {
  color: 'black',
  w: 20,
  h: 5,
  x: 190,
  y: 345,
  top: 350,
  bottom: 345,
  left: 190,
  right: 210,
}

function drawPlatform() {
  ctx.fillStyle = platform.color;
  ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
}

function initShip() {
  // position
  ship.x = 150 + Math.random() * 100;
  ship.y = 150 + Math.random() * 100;
  // velocity
  ship.dx = Math.random();
  ship.dy = Math.random();
  ship.mainEngine = false;
  ship.leftEngine = false;
  ship.rightEngine = false;
  ship.crashed = false;
  ship.landed = false;
}

function initPrjs() {
  for (let i = 0; i < 10; i++) {
    let prj = {
      x: Math.floor(Math.random() * 400),
      y: 0,
      dx: 1 - (Math.random() * 2),
      dy: Math.random(),
      h: 4,
      w: 4,
      color: 'brown'
    };
    prjs.push(prj);
  }
}

function drawTriangle(a, b, c, fillStyle) {
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.lineTo(c[0], c[1]);
  // TODO: draw a triange from three points a, b, and c.
  // points are arrays, [0] - x coordinate, [1] - y coordinate
  // see ctx.moveTo and ctx.lineTo
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function drawShip() {
  ctx.save();
  ctx.beginPath();
  ctx.translate(ship.x, ship.y);
  ctx.rect(ship.w * -0.5, ship.h * -0.5, ship.w, ship.h);
  ctx.fillStyle = ship.color;
  ctx.fill();
  ctx.closePath();

  // Draw the flame if engine is on
  if (ship.mainEngine) {
    drawTriangle(
      [ship.w * -0.5, ship.h * 0.5],
      [ship.w * 0.5, ship.h * 0.5],
      [0, ship.h * 0.5 + Math.random() * 10],
      "orange"
    );
  }
  if (ship.rightEngine) {
    drawTriangle(
      [ship.w * 0.5, ship.h * -0.25],
      [ship.w * 0.5 + Math.random() * 10, 0],
      [ship.w * 0.5, ship.h * 0.25],
      "orange"
    );
  }
  if (ship.leftEngine) {
    drawTriangle(
      [ship.w * -0.5, ship.h * -0.25],
      [ship.w * -0.5 - Math.random() * 10, 0],
      [ship.w * -0.5, ship.h * 0.25],
      "orange"
    );
  }
  ctx.restore();
}

function updateShip() {


ship.dy += gravity;
if(ship.mainEngine){
  ship.dy -= mainEngineThrust;
}
if(ship.rightEngine){
  ship.dx -= sideEngineThrust;
}
if(ship.leftEngine){
  ship.dx += sideEngineThrust;
}
ship.y += ship.dy;
ship.x += ship.dx;

  // TODO: update ship.dx, dy
  // what forces acting on the ship?
  // - left, right, main thruster
  // - gravity
  // TODO: update the position - how does dx, dy affect x, y?
}

function drawPrjs() {
  for (let i= 0; i < prjs.length; i++) {
    let prj = prjs[i];
    ctx.fillStyle = prj.color;
    ctx.fillRect(prj.x, prj.y, prj.w, prj.h);
  }
}
function updatePjrs() {
  for (let i = 0; i < prjs.length; i++) {
    let prj = prjs[i];
    prj.dy += gravity
    prj.y += prj.dy;
    prj.x += prj.dx;
  }
}
function checkCollision() {
  const top = ship.y - ship.h / 2;
  const bottom = ship.y + ship.h / 2;
  const left = ship.x - ship.w / 2;
  const right = ship.x + ship.w / 2;
  // TODO: check that ship flew out of bounds. If so, set ship.crashed = true
  if(top < 0|| bottom > canvas.height|| right > canvas.width|| left < 0){
    ship.crashed = true;
    return;
  }

  const isNotOverlapingPlatform =
    bottom < platform.top ||
    top > platform.bottom ||
    left > platform.right ||
    right < platform.left;
   if (!isNotOverlapingPlatform) {
    ship.crashed = true;
    return;
   }

   if ( 
    ship.dx < 0.2 &&
    ship.dy < 0.2 &&
    left > platform.left &&
    right < platform.right &&
    bottom < platform.top &&
    platform.top - bottom < lzBluffer
    ) {
      ship.landed = true;
      return;

    }
  // TODO: check if ship landed. If so, set ship.landed = true
  // - What conditions have to be true for a soft landing?
}

function gameLoop() {
  updateShip();
  updatePjrs();

  checkCollision();
  if (ship.crashed) {
    statusDiv.innerHTML = "GAME OVER - crashed";
    endGame();
  } else if (ship.landed) {
    statusDiv.innerHTML = "LANDED - you win!";
    endGame();
  } else {
    // Clear entire screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShip();
    drawPrjs();
    drawPlatform();
    requestAnimationFrame(gameLoop);
  }
}

function keyLetGo(event) {
  switch (event.keyCode) {
    case 37: // Left Arrow key
      ship.leftEngine = false;
      break;
    case 39: // Right Arrow key
      ship.rightEngine = false;
      break;
    case 40: // Down Arrow key
      ship.mainEngine = false;
      break;
    default:
      return;
  }
  // don't let arrow keys move screen around
  event.preventDefault();
}

function keyPressed(event) {
  switch (event.keyCode) {
    case 37: // Left Arrow key
      ship.leftEngine = true;
      break;
    case 39: // Right Arrow key
      ship.rightEngine = true;
      break;
    case 40: // Down Arrow key
      ship.mainEngine = true;
      break;
    default:
      return;
  }
  // don't let arrow keys move screen around
  event.preventDefault();
}

function start() {
  // console.log("start", ship);
  startBtn.disabled = true;
  statusDiv.innerHTML = "";
  initShip();

  initPrjs();
  document.addEventListener("keyup", keyLetGo);
  document.addEventListener("keydown", keyPressed);
  requestAnimationFrame(gameLoop);
}

function endGame() {
  // console.log("endGame", ship);
  startBtn.disabled = false;
  document.removeEventListener("keyup", keyLetGo);
  document.removeEventListener("keydown", keyPressed);
}
