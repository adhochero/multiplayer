import { Player } from './player.js';
import { Joystick } from './joystick.js';
import { WordDisplay } from './talking.js';

document.addEventListener('DOMContentLoaded', function() {

    const players = {};

    // Generate a random user ID
    const userId = Math.random().toString(36).substring(2, 15);
    let localPlayerPos = { x: 0, y: 0 };
    let isConnected = false;
    let userCount = 0;

    // ========== Supabase Setup ==========
    // Replace with your Supabase URL and public (anon) key
    const supabaseUrl = 'https://gqbeyhseepsnhxjblxzh.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxYmV5aHNlZXBzbmh4amJseHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3Njk5NDksImV4cCI6MjA1ODM0NTk0OX0.c-3qmp9WTVOEVMlJnSS4b128roCBHd978t3lGebWq4s';
        
    const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        
    // Join the players channel
    const channel = supabase.channel('players', {
      config: {
        broadcast: { self: true },
        presence: { key: userId } // Tracks this user
      }
    });

    // ========== Track Presence ==========
    channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
            
      // Update connection status
      if (Object.keys(state).length > 0 && !isConnected) {
          isConnected = true;
      }
            
      // Clean up disconnected users' cursors
      const connectedUserIds = Object.keys(state);
      Object.keys(players).forEach(id => {
        if (!connectedUserIds.includes(id) && id !== userId) {
          delete players[id];
        }
      });
    });
          
    // Also handle when users leave (presence diff)
    channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      leftPresences.forEach(presence => {
        const leftUserId = presence.key;
        if (players[leftUserId]) {
          delete players[leftUserId];
        }
      });
    });
        
    // Handle player broadcasts
    channel.on('broadcast', { event: 'player-position' }, (payload) => {
      const { senderId, x, y, word } = payload.payload;
            
      if (senderId !== userId) {
        if (!players[senderId]) {
          players[senderId] = {
            x: x,
            y: y,
            word: word
          };
        } else {
          // Update existing cursor
          players[senderId].x = x;
          players[senderId].y = y;
          players[senderId].word = word;
        }
      }
    });

    // Connect to the channel
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        isConnected = true;
      } else {
        isConnected = false;
      }
    });

    // ========== Page Visibility and Unload Handlers ==========
    // Remove user when page is closed/navigated away
    window.addEventListener('beforeunload', () => {
      if (channel) {
        // Remove presence when leaving
        channel.untrack();
        channel.unsubscribe();
      }
    });
          
    // Handle tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // User switched to another tab or minimized window
        channel.untrack();
      } else if (document.visibilityState === 'visible' && channel) {
        // User returned to the page
        channel.track({});
      }
    });  

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
let wordDisplay;
let speakIcon;

window.onload = init;
window.onresize = adjustCanvasSize;

function preventDefaultTouchBehavior() {
    // Add event listeners to prevent default touch actions globally
    document.addEventListener('touchstart', (event) => event.preventDefault(), { passive: false });
    document.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });
    document.addEventListener('touchend', (event) => event.preventDefault(), { passive: false });
    document.addEventListener('touchcancel', (event) => event.preventDefault(), { passive: false });
}

function init(){
    preventDefaultTouchBehavior();
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    canvas.width = canvasResolutionWidth;
    canvas.height = canvasResolutionHeight;
    adjustCanvasSize();

    // Initialize player and joystick
    player = new Player('mr. sphere', './assets/pixel_sphere_16x16.png', 50, 50, canvas.width / 2, canvas.height / 2);
    joystick = new Joystick();
    listenForJoystickEvents();

    speakIcon = new Image();
    speakIcon.src = './assets/speak.png'
    wordDisplay = new WordDisplay(player.x, player.y, context);

    camera.x = -player.x + canvas.width / 2;
    camera.y = -player.y + canvas.height / 2;

    const input = document.createElement("input");
    input.type = "text";
    input.style.position = "absolute";
    input.style.top = "-100px"; // Keep it way off-screen but focusable
    input.style.left = "-100px";
    input.style.width = "1px";
    input.style.height = "1px";
    input.style.opacity = "0";
    input.style.border = "none";
    input.style.outline = "none";
    document.body.appendChild(input);

    canvas.addEventListener("touchend", (event) => {
      const rect = canvas.getBoundingClientRect();
      const touch = event.changedTouches[0];
      const tapX = touch.clientX - rect.left;
      const tapY = touch.clientY - rect.top;
  
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const tapRadius = 50; // 50px leeway
  
      const distance = Math.sqrt((tapX - centerX) ** 2 + (tapY - centerY) ** 2);
  
      if (distance <= tapRadius) {
          input.focus(); // This should now reliably open the keyboard
      } else {
          input.blur(); // Close keyboard if tapping elsewhere
      }
  
      event.preventDefault(); // Stop accidental zooming/scrolling
  });
  
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
        joystick.startTouch(event);
    }, false);

    canvas.addEventListener('touchmove', (event) => {
        joystick.moveTouch(event);
    }, false);

    canvas.addEventListener('touchend', (event) => {
        joystick.endTouch();
    }, false);

    canvas.addEventListener('touchcancel', (event) => {
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
    //console.log('fps: ' + fps);
    player.update(deltaTime, joystick);

    wordDisplay.updatePosition(player.x, player.y -170);

    localPlayerPos = {
        x: player.x,
        y: player.y
      };

      if (isConnected) {
        channel.send({
          type: 'broadcast',
          event: 'player-position',
          payload: {
            senderId: userId,
            x: localPlayerPos.x,
            y: localPlayerPos.y,
            word: wordDisplay.displayedWord
          }
        });
      }
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
    //draw other players
    for (const id in players) {
        if (id !== userId) {
          const player = players[id];
          drawOthers(player.x, player.y);
          drawOthersWords(player.x, player.y, player.word)
        }
    }

    wordDisplay.draw();

    context.restore();

    context.imageSmoothingEnabled = false;
    context.drawImage(speakIcon, 600, 610, 50, 50);
}

function drawOthers(x, y){
    let image = new Image();
    image.src = './assets/pixel_sphere_16x16.png'
    context.drawImage(image, x - 25, y - 25, 50, 50);
}

function drawOthersWords(x, y, word){
    context.fillStyle = 'white';
    context.font = 'bold 28px "Courier New", monospace';
    let textWidth = context.measureText(word).width;
    context.fillText(word, x - textWidth / 2, y - 40);
}

function lerp(start, end, t){
    return  (1 - t) * start + end * t;
}

function drawGrid(offsetX, offsetY) {
    let gridSize = 50; // Size of each grid cell
    context.strokeStyle = "#cccccc"; // Light grey color
    context.lineWidth = 3;

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

});