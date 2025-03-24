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

        // Calculate the difference between start and end touch positions
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;

        // Normalize the values to be between -1 and 1
        const maxMovement = 100;  // Max distance for full joystick range
        const x = Math.min(Math.max(deltaX / maxMovement, -1), 1);
        const y = Math.min(Math.max(deltaY / maxMovement, -1), 1);

        return { x, y };
    }
}
