class PopetteApp {
    constructor() {
        this.wateringDays = [1, 4]; // Monday (1) and Thursday (4)
        this.lastWatered = null;
        this.init();
    }

    async init() {
        await this.loadData();
        this.updateDisplay();
        this.setupEventListeners();
    }

    async loadData() {
        try {
            const response = await fetch('/api/status');
            const data = await response.json();
            this.lastWatered = data.lastWatered ? new Date(data.lastWatered) : null;
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback to localStorage if server is unavailable
            const stored = localStorage.getItem('popette_last_watered');
            this.lastWatered = stored ? new Date(stored) : null;
        }
    }

    async saveData() {
        try {
            const wateredBy = this.getUserName();
            const response = await fetch('/api/water', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ wateredBy })
            });
            
            const data = await response.json();
            if (data.success) {
                this.lastWatered = new Date(data.lastWatered);
                // Also save to localStorage as backup
                localStorage.setItem('popette_last_watered', this.lastWatered.toISOString());
                return data;
            }
        } catch (error) {
            console.error('Error saving to server:', error);
            // Fallback to localStorage
            if (this.lastWatered) {
                localStorage.setItem('popette_last_watered', this.lastWatered.toISOString());
            }
        }
    }

    getUserName() {
        // Try to get user name from localStorage, or prompt for it
        let userName = localStorage.getItem('popette_user_name');
        if (!userName) {
            userName = prompt('What\'s your name? (for watering logs)') || 'Unknown';
            localStorage.setItem('popette_user_name', userName);
        }
        return userName;
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
        // Always allow watering - removed the 3-day restriction
        return true;
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
        } else if (this.isWateringDay()) {
            return {
                type: 'ready',
                message: 'Time to water Popette! 💧'
            };
        } else {
            const daysUntil = this.getDaysUntilNextWatering();
            return {
                type: 'ready',
                message: `You can water Popette anytime! Next scheduled: ${daysUntil} day${daysUntil !== 1 ? 's' : ''} 🌱`
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

    async updateDisplay() {
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

        // Update button state - always enabled now
        waterButton.disabled = false;
        waterButton.textContent = '💧 Water Popette';

        // Update leaderboard
        await this.updateLeaderboard();
    }

    async updateLeaderboard() {
        try {
            const response = await fetch('/api/leaderboard');
            const data = await response.json();
            const leaderboardList = document.getElementById('leaderboard-list');
            
            if (data.leaderboard && data.leaderboard.length > 0) {
                leaderboardList.innerHTML = data.leaderboard.map((item, index) => `
                    <div class="leaderboard-item">
                        <span class="leaderboard-rank">${index + 1}.</span>
                        <span class="leaderboard-name">${item.user}</span>
                        <span class="leaderboard-count">${item.count} 💧</span>
                    </div>
                `).join('');
            } else {
                leaderboardList.innerHTML = '<p>No watering data yet!</p>';
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            document.getElementById('leaderboard-list').innerHTML = '<p>Error loading leaderboard</p>';
        }
    }

    async waterPlant() {
        // Play water sound
        const waterSound = document.getElementById('water-sound');
        if (waterSound) {
            waterSound.currentTime = 0;
            waterSound.play().catch(e => console.log('Could not play sound:', e));
        }

        const result = await this.saveData();
        this.updateDisplay();
        
        // Add success animation
        const plantCard = document.querySelector('.plant-card');
        plantCard.classList.add('success');
        
        // Show success message with user name
        const statusDisplay = document.getElementById('status-display');
        statusDisplay.className = 'status-display ready';
        const userName = this.getUserName();
        statusDisplay.textContent = `Popette has been watered by ${userName}! 💚`;
        
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