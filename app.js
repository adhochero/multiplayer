import { Player } from './player.js';
import { Joystick } from './joystick.js';

let canvas;
let context;
let canvasViewportPercentage = 0.9;
let canvasResolutionWidth = 666;
let canvasResolutionHeight = 666;
let camera = {x: 0, y: 0};
let cameraFollowSpeed = 0.05;
let lastTimeStamp = 0;
let fps;

let player;
let joystick;

window.onload = init;
window.onresize = adjustCanvasSize;

function init(){
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    canvas.width = canvasResolutionWidth;
    canvas.height = canvasResolutionHeight;
    adjustCanvasSize();

    // Initialize player and joystick
    player = new Player('mr. sphere', './assets/pixel_sphere_16x16.png', 50, 50, canvas.width / 2, canvas.height / 2);
    joystick = new Joystick();
    listenForJoystickEvents();

    camera.x = -player.x + canvas.width / 2;
    camera.y = -player.y + canvas.height / 2;

    //start the first frame request
    window.requestAnimationFrame(gameLoop);
}

function adjustCanvasSize() {
    // Calculate the scale based on the width and height
    let scaleX = window.innerWidth / canvasResolutionWidth;
    let scaleY = window.innerHeight / canvasResolutionHeight;

    // Use the smaller scale to ensure the canvas stays within the bounds
    let scale = Math.min(scaleX, scaleY) * canvasViewportPercentage;

    // Apply the scale to the canvas element
    canvas.style.width = canvasResolutionWidth * scale + 'px';
    canvas.style.height = canvasResolutionHeight * scale + 'px';
}

function listenForJoystickEvents()
{
    canvas.addEventListener('touchstart', (event) => {
        event.preventDefault();
        joystick.startTouch(event);
    }, false);

    canvas.addEventListener('touchmove', (event) => {
        event.preventDefault();
        joystick.moveTouch(event);
    }, false);

    canvas.addEventListener('touchend', (event) => {
        event.preventDefault();
        joystick.endTouch();
    }, false);

    canvas.addEventListener('touchcancel', (event) => {
        event.preventDefault();
        joystick.endTouch();
    }, false);
}

function gameLoop(timeStamp){
    const maxDeltaTime = 0.1; // Maximum time difference between frames (in seconds)
    const deltaTime = Math.min((timeStamp - lastTimeStamp) / 1000, maxDeltaTime);
    lastTimeStamp = timeStamp;
    fps = deltaTime > 0 ? Math.round(1 / deltaTime) : 0;

    //update game objects in the loop
    update(deltaTime);
    draw();

    //keep requesting new frames
    window.requestAnimationFrame(gameLoop);
}

function update(deltaTime){
    console.log('fps: ' + fps);
    player.update(deltaTime, joystick);
}

function draw(){
    //clear the entire canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    camera.x = lerp(camera.x, -player.x + canvas.width / 2, cameraFollowSpeed);
    camera.y = lerp(camera.y, -player.y + canvas.height / 2, cameraFollowSpeed);

    context.save();

    drawGrid(-(camera.x + canvas.width / 2), -(camera.y + canvas.height / 2));
    context.translate(camera.x, camera.y);
    player.draw(context);

    context.restore();
}

function lerp(start, end, t){
    return  (1 - t) * start + end * t;
}

function drawGrid(offsetX, offsetY) {
    let gridSize = 50; // Size of each grid cell
    context.strokeStyle = "#cccccc"; // Light grey color
    context.lineWidth = 1;

    // Find the top-left corner of the grid relative to the camera
    let startX = Math.floor(offsetX / gridSize) * gridSize - offsetX;
    let startY = Math.floor(offsetY / gridSize) * gridSize - offsetY;

    // Draw vertical grid lines
    for (let x = startX; x < canvas.width; x += gridSize) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
    }

    // Draw horizontal grid lines
    for (let y = startY; y < canvas.height; y += gridSize) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
    }
}

