export class WordDisplay {
    constructor(x = 0, y = 0, ctx) {
        this.ctx = ctx;
        this.currentWord = "";
        this.displayedWord = "";
        this.wordDisplayTime = 0;
        this.wordQueue = [];

        this.displayDuration = 1000; // Normal display duration
        this.finalWordDuration = 2000; // Last word duration
        this.autoFinalizeTime = 1000; // Auto-finalize after time of inactivity
        this.lastKeyPressTime = Date.now();

        // Position for the text box
        this.x = x;
        this.y = y;

        this.boxWidth = 300;
        this.boxHeight = 150;
        this.lineHeight = 20;
        this.allowedChars = /^[a-zA-Z0-9.,!?;:'"(){}[\]<>@#$%^&*+=_ -]$/;

        window.addEventListener("keydown", this.handleKeydown.bind(this));
    }

    handleKeydown(event) {
        const key = event.key;
        this.lastKeyPressTime = Date.now(); // Reset inactivity timer

        if (key === "Backspace") {
            this.currentWord = this.currentWord.slice(0, -1);
        } else if ((key === " " || key === "Enter") && this.currentWord.length > 0) {
            this.finalizeWord();
        } else if (this.allowedChars.test(key)) {
            this.currentWord += key;
        }
    }

    finalizeWord() {
        if (this.currentWord.length > 0) {
            this.wordQueue.push(this.currentWord); // Queue the word
            this.currentWord = ""; // Reset input buffer
        }
    }

    updateDisplayedWord() {
        if (!this.displayedWord && this.wordQueue.length > 0) {
            this.displayedWord = this.wordQueue.shift(); // Take the next word from the queue
            this.wordDisplayTime = Date.now(); // Start its display timer
        }
    }

    drawCenteredText(text, x, y, maxWidth, lineHeight, maxHeight) {
        let words = text.split("");
        let lines = [];
        let line = "";

        for (let i = 0; i < words.length; i++) {
            let testLine = line + words[i];
            let testWidth = this.ctx.measureText(testLine).width;

            if (testWidth > maxWidth && line.length > 0) {
                lines.push(line);
                line = words[i];
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        let totalTextHeight = lines.length * lineHeight;
        let startY = Math.max(y + maxHeight - totalTextHeight, y + lineHeight);

        for (let i = 0; i < lines.length; i++) {
            let lineWidth = this.ctx.measureText(lines[i]).width;
            let centeredX = x + (maxWidth - lineWidth) / 2;
            this.ctx.fillText(lines[i], centeredX, startY + i * lineHeight);
        }
    }

    draw() {
        this.ctx.font = '20px "Courier New", monospace';
        this.ctx.fillStyle = "white";

        const now = Date.now();

        // Auto-finalize word if no key press for a set duration
        if (this.currentWord.length > 0 && now - this.lastKeyPressTime > this.autoFinalizeTime) {
            this.finalizeWord();
        }

        // Determine how long the current word should stay up
        let duration = this.wordQueue.length > 0 ? this.displayDuration : this.finalWordDuration;

        // Update displayed word when needed
        if (this.displayedWord && now - this.wordDisplayTime > duration) {
            this.displayedWord = ""; // Clear word after time expires
        }
        this.updateDisplayedWord(); // Check for new word after clearing

        // Display the finalized word
        if (this.displayedWord) {
            this.drawCenteredText(this.displayedWord, this.x, this.y, this.boxWidth, this.lineHeight, this.boxHeight);
        }
    }

    // Method to update the position dynamically
    updatePosition(x, y) {
        this.x = x - this.boxWidth / 2;
        this.y = y;
    }
}
