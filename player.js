export class Player {
    constructor(name, imageSrc, width, height, x, y) {
        this.name = name;
        this.image = new Image();
        this.image.src = imageSrc;  // Set image for the player
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.speed = 200;  // Player movement speed (in pixels per second)
        
        this.inputSmoothing = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.moveDirection = { x: 0, y: 0 };
        this.inputResponsiveness = 3;
    }

    update(deltaTime, joystick) {
        // Get joystick direction and strength
        const joystickStrength = joystick.getStrength();
        let inputDirection = { x: joystickStrength.x, y: joystickStrength.y };

        // Smooth input movement using lerp
        this.inputSmoothing.x = this.lerp(this.inputSmoothing.x, inputDirection.x, this.inputResponsiveness * deltaTime);
        this.inputSmoothing.y = this.lerp(this.inputSmoothing.y, inputDirection.y, this.inputResponsiveness * deltaTime);

        // Apply velocity falloff
        this.velocity.x = this.lerp(this.velocity.x, 0, this.inputResponsiveness * deltaTime);
        this.velocity.y = this.lerp(this.velocity.y, 0, this.inputResponsiveness * deltaTime);

        // Combine velocity and input movement
        this.moveDirection.x = this.velocity.x + (this.inputSmoothing.x * this.speed);
        this.moveDirection.y = this.velocity.y + (this.inputSmoothing.y * this.speed);

        // Move the player
        this.x += this.moveDirection.x * deltaTime;
        this.y += this.moveDirection.y * deltaTime;
    }

    draw(context) {
        context.imageSmoothingEnabled = false;
        // Draw the player image at its position
        context.drawImage(this.image, this.x, this.y, this.width, this.height);

        // Draw player name
        context.fillStyle = 'white';
        context.font = '20px Tiny5, monospace';
        let textWidth = context.measureText(this.name).width;
        context.fillText(this.name, this.x + this.width / 2 - textWidth / 2, this.y - 12);
    }

    lerp(start, end, t) {
        return (1 - t) * start + t * end;
    }
}