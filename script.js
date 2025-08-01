class PopetteApp {
    constructor() {
        this.storageKey = 'popette_last_watered';
        this.wateringDays = [1, 4]; // Monday (1) and Thursday (4)
        this.init();
    }

    init() {
        this.loadData();
        this.updateDisplay();
        this.setupEventListeners();
    }

    loadData() {
        const stored = localStorage.getItem(this.storageKey);
        this.lastWatered = stored ? new Date(stored) : null;
    }

    saveData() {
        if (this.lastWatered) {
            localStorage.setItem(this.storageKey, this.lastWatered.toISOString());
        }
    }

    getNextWateringDay() {
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Find the next watering day
        for (let i = 1; i <= 7; i++) {
            const checkDay = (currentDay + i) % 7;
            if (this.wateringDays.includes(checkDay)) {
                const nextWatering = new Date(today);
                nextWatering.setDate(today.getDate() + i);
                return nextWatering;
            }
        }
        
        // If no next day found in this week, get the first watering day of next week
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + (7 - currentDay) + this.wateringDays[0]);
        return nextWeek;
    }

    getDaysUntilNextWatering() {
        const nextWatering = this.getNextWateringDay();
        const today = new Date();
        const diffTime = nextWatering - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    isWateringDay() {
        const today = new Date();
        const currentDay = today.getDay();
        return this.wateringDays.includes(currentDay);
    }

    shouldWaterToday() {
        if (!this.lastWatered) return true;
        
        const today = new Date();
        const lastWatered = new Date(this.lastWatered);
        
        // Check if it's been at least 3 days since last watering
        const daysSinceWatering = Math.floor((today - lastWatered) / (1000 * 60 * 60 * 24));
        return daysSinceWatering >= 3;
    }

    getStatus() {
        if (!this.lastWatered) {
            return {
                type: 'ready',
                message: 'Ready for first watering! 💧'
            };
        }

        const today = new Date();
        const lastWatered = new Date(this.lastWatered);
        const daysSinceWatering = Math.floor((today - lastWatered) / (1000 * 60 * 60 * 24));

        if (daysSinceWatering >= 7) {
            return {
                type: 'overdue',
                message: 'Overdue for watering! 🚨'
            };
        } else if (this.isWateringDay() && this.shouldWaterToday()) {
            return {
                type: 'ready',
                message: 'Time to water Popette! 💧'
            };
        } else {
            const daysUntil = this.getDaysUntilNextWatering();
            return {
                type: 'waiting',
                message: `Come back in ${daysUntil} day${daysUntil !== 1 ? 's' : ''} 🌱`
            };
        }
    }

    formatDate(date) {
        if (!date) return 'Never';
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatNextWatering() {
        const nextWatering = this.getNextWateringDay();
        return nextWatering.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
    }

    updateDisplay() {
        const status = this.getStatus();
        const statusDisplay = document.getElementById('status-display');
        const lastWateredDate = document.getElementById('last-watered-date');
        const nextWateringDate = document.getElementById('next-watering-date');
        const waterButton = document.getElementById('water-button');

        // Update status
        statusDisplay.className = `status-display ${status.type}`;
        statusDisplay.textContent = status.message;

        // Update dates
        lastWateredDate.textContent = this.formatDate(this.lastWatered);
        nextWateringDate.textContent = this.formatNextWatering();

        // Update button state
        if (status.type === 'ready') {
            waterButton.disabled = false;
            waterButton.textContent = '💧 Water Popette';
        } else {
            waterButton.disabled = true;
            waterButton.textContent = 'Not time yet 🌱';
        }
    }

    waterPlant() {
        this.lastWatered = new Date();
        this.saveData();
        this.updateDisplay();
        
        // Add success animation
        const plantCard = document.querySelector('.plant-card');
        plantCard.classList.add('success');
        
        // Show success message
        const statusDisplay = document.getElementById('status-display');
        statusDisplay.className = 'status-display ready';
        statusDisplay.textContent = 'Popette has been watered! 💚';
        
        // Remove animation class after animation completes
        setTimeout(() => {
            plantCard.classList.remove('success');
        }, 600);
        
        // Update display after a short delay
        setTimeout(() => {
            this.updateDisplay();
        }, 2000);
    }

    setupEventListeners() {
        const waterButton = document.getElementById('water-button');
        waterButton.addEventListener('click', () => {
            if (!waterButton.disabled) {
                this.waterPlant();
            }
        });
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PopetteApp();
}); 