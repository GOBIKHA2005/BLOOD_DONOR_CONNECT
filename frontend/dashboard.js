// Dashboard functionality
class DashboardManager {
    constructor() {
        this.apiBase = 'http://localhost:3001/api';
        this.init();
    }

    async init() {
        await this.loadStats();
        await this.loadRecentActivity();
        this.startRealTimeUpdates();
    }

    async loadStats() {
        try {
            const response = await fetch(`${this.apiBase}/donors/stats`);
            if (response.ok) {
                const stats = await response.json();
                this.updateStatsDisplay(stats);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            this.showFallbackStats();
        }
    }

    updateStatsDisplay(stats) {
        const elements = {
            livesSaved: document.getElementById('livesSaved'),
            activeDonors: document.getElementById('activeDonors'),
            successRate: document.getElementById('successRate'),
            emergencyStatus: document.getElementById('emergencyStatus')
        };

        if (elements.livesSaved) {
            this.animateCounter(elements.livesSaved, stats.livesSaved || 1247);
        }
        if (elements.activeDonors) {
            this.animateCounter(elements.activeDonors, stats.activeDonors || 892);
        }
        if (elements.successRate) {
            elements.successRate.textContent = `${stats.successRate || 94.7}%`;
        }
        if (elements.emergencyStatus) {
            this.animateCounter(elements.emergencyStatus, stats.emergencyStatus || 3);
        }
    }

    showFallbackStats() {
        // Show default stats if API fails
        const defaultStats = {
            livesSaved: 1247,
            activeDonors: 892,
            successRate: 94.7,
            emergencyStatus: 3
        };
        this.updateStatsDisplay(defaultStats);
    }

    animateCounter(element, target) {
        const start = 0;
        const duration = 2000;
        const startTime = Date.now();

        const updateCounter = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeOutCubic);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };

        updateCounter();
    }

    async loadRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');
        if (!activityContainer) return;

        try {
            const response = await fetch(`${this.apiBase}/donors/recent-activity`);
            if (response.ok) {
                const activities = await response.json();
                this.renderRecentActivity(activities);
            } else {
                this.showFallbackActivity();
            }
        } catch (error) {
            console.error('Error loading recent activity:', error);
            this.showFallbackActivity();
        }
    }

    renderRecentActivity(activities) {
        const activityContainer = document.getElementById('recentActivity');
        
        const activityHTML = activities.map(activity => `
            <div class="activity-item">
                <span class="activity-description">${activity.description}</span>
                <span class="activity-time">${this.formatTimeAgo(activity.timestamp)}</span>
            </div>
        `).join('');

        activityContainer.innerHTML = activityHTML;
    }

    showFallbackActivity() {
        const activityContainer = document.getElementById('recentActivity');
        const fallbackActivities = [
            { description: 'New donor registered in Mumbai', timestamp: new Date(Date.now() - 30 * 60 * 1000) },
            { description: 'Emergency request fulfilled in Delhi', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
            { description: 'Blood drive completed in Bangalore', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
            { description: 'Donor verification completed', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) }
        ];
        
        this.renderRecentActivity(fallbackActivities);
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - new Date(timestamp);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    startRealTimeUpdates() {
        // Update stats every 30 seconds
        setInterval(() => {
            this.loadStats();
        }, 30000);

        // Update activity every 60 seconds
        setInterval(() => {
            this.loadRecentActivity();
        }, 60000);
    }

    // Add smooth scroll behavior to view all links
    setupSmoothScrolling() {
        document.querySelectorAll('.view-all').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Add smooth scroll to relevant sections
            });
        });
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new DashboardManager();
    
    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.stat-card, .dashboard-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});