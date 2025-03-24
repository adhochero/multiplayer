export class Joystick {
    constructor() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.isTouching = false;
    }

    startTouch(event) {
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
        this.touchEndX = this.touchStartX; // Initialize to prevent incorrect displacement
        this.touchEndY = this.touchStartY;
        this.isTouching = true;
    }

    moveTouch(event) {
        if (!this.isTouching) return;

        this.touchEndX = event.touches[0].clientX;
        this.touchEndY = event.touches[0].clientY;
    }

    endTouch() {
        this.isTouching = false;
    }

    getStrength() {
        if (!this.isTouching) return { x: 0, y: 0 };
    
        // Calculate displacement
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
    
        // Max movement distance for full joystick range
        const maxMovement = 100;
    
        // Convert to -1 to 1 range
        let x = deltaX / maxMovement;
        let y = deltaY / maxMovement;
    
        // Calculate magnitude
        const magnitude = Math.sqrt(x * x + y * y);
    
        // Normalize if magnitude > 1
        if (magnitude > 1) {
            x /= magnitude;
            y /= magnitude;
        }
    
        return { x, y };
    }
}