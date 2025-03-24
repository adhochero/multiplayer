export class Player {
    constructor(name, imageSrc, x, y, width, height) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = imageSrc;  // Set image for the player
        this.speed = 100;  // Player movement speed (in pixels per second)
    }

    update(deltaTime, joystick) {
        // Update player position based on joystick input (smooth movement)
        const joystickStrength = joystick.getStrength();  // Get joystick direction and strength
        this.x += joystickStrength.x * this.speed * deltaTime;
        this.y += joystickStrength.y * this.speed * deltaTime;
    }

    draw(context) {
        // Draw the player image at its position
        context.drawImage(this.image, this.x, this.y, this.width, this.height);

        context.fillStyle = 'white';
        context.font = '20px Helvetica';
        let textWidth = context.measureText(this.name).width;
        context.fillText(this.name, this.x + this.width / 2 - textWidth / 2, this.y - 10);
    }
}
