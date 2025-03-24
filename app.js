import { Player } from './player.js';
import { Joystick } from './joystick.js';

let canvas;
let context;
let canvasViewportPercentage = 0.9;
let canvasResolutionWidth = 666;
let canvasResolutionHeight = 666;
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
    player = new Player('mr. sphere', './assets/pixel_sphere_16x16.png', 100, 100, 30, 30);
    joystick = new Joystick();
    listenForJoystickEvents();

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

    player.draw(context);
}
