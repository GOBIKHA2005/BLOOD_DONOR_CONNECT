// Search functionality
class SearchManager {
    constructor() {
        this.apiBase = 'http://localhost:3001/api';
        this.searchButton = document.getElementById('searchButton');
        this.filterBloodGroup = document.getElementById('filterBloodGroup');
        this.filterCity = document.getElementById('filterCity');
        this.resultsTableBody = document.getElementById('resultsTableBody');
        this.resultsCount = document.getElementById('resultsCount');
        this.noResults = document.getElementById('noResults');
        this.resultsTable = document.getElementById('resultsTable');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAllDonors();
    }

    setupEventListeners() {
        this.searchButton.addEventListener('click', () => {
            this.performSearch();
        });

        // Allow search on Enter key press
        [this.filterBloodGroup, this.filterCity].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        });

        // Real-time search as user types (with debounce)
        let searchTimeout;
        this.filterCity.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch();
            }, 500);
        });

        this.filterBloodGroup.addEventListener('change', () => {
            this.performSearch();
        });
    }

    async loadAllDonors() {
        await this.performSearch();
    }

    async performSearch() {
        const bloodGroup = this.filterBloodGroup.value;
        const city = this.filterCity.value.trim();

        // Show loading state
        this.showLoading();

        try {
            let url = `${this.apiBase}/donors`;
            const params = new URLSearchParams();
            
            if (bloodGroup) {
                params.append('bloodGroup', bloodGroup);
            }
            if (city) {
                params.append('city', city);
            }
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            
            if (response.ok) {
                const donors = await response.json();
                this.renderSearchResults(donors);
            } else {
                this.showError('Failed to load donors');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Network error. Please try again.');
        }
    }

    showLoading() {
        this.resultsTableBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 2rem;">
                    <div class="loading"></div>
                    <span style="margin-left: 1rem;">Searching donors...</span>
                </td>
            </tr>
        `;
        this.resultsCount.textContent = 'Searching...';
    }

    renderSearchResults(donors) {
        if (donors.length === 0) {
            this.showNoResults();
            return;
        }

        this.resultsTable.style.display = 'table';
        this.noResults.style.display = 'none';
        
        const donorsHTML = donors.map(donor => `
            <tr data-donor-id="${donor.id}">
                <td>${this.escapeHtml(donor.name)}</td>
                <td><span class="blood-type">${donor.blood_group}</span></td>
                <td>${donor.age}</td>
                <td>${donor.gender}</td>
                <td>${this.escapeHtml(donor.city)}</td>
                <td>${this.escapeHtml(donor.state)}</td>
                <td>${this.formatPhone(donor.phone)}</td>
                <td>${this.formatDate(donor.last_donation)}</td>
                <td>
                    <span class="status-${donor.verified ? 'verified' : 'unverified'}">
                        ${donor.verified ? 'Verified' : 'Unverified'}
                    </span>
                </td>
                <td>
                    <button class="action-button" onclick="searchManager.deleteDonor(${donor.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');

        this.resultsTableBody.innerHTML = donorsHTML;
        this.resultsCount.textContent = `${donors.length} donor${donors.length > 1 ? 's' : ''} found`;

        // Add animation to rows
        const rows = this.resultsTableBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                row.style.transition = 'all 0.3s ease-out';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    showNoResults() {
        this.resultsTable.style.display = 'none';
        this.noResults.style.display = 'block';
        this.resultsCount.textContent = '0 donors found';
    }

    showError(message) {
        this.resultsTableBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 2rem; color: var(--error);">
                    ${message}
                </td>
            </tr>
        `;
        this.resultsCount.textContent = 'Error loading results';
    }

    async deleteDonor(donorId) {
        if (!confirm('Are you sure you want to delete this donor? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/donors/${donorId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Remove the row from the table
                const row = document.querySelector(`tr[data-donor-id="${donorId}"]`);
                if (row) {
                    row.style.transition = 'all 0.3s ease-out';
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(-100%)';
                    
                    setTimeout(() => {
                        row.remove();
                        this.updateResultsCount();
                    }, 300);
                }
                
                this.showTemporaryMessage('Donor deleted successfully', 'success');
            } else {
                const error = await response.json();
                this.showTemporaryMessage(error.message || 'Failed to delete donor', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showTemporaryMessage('Network error. Please try again.', 'error');
        }
    }

    updateResultsCount() {
        const rows = this.resultsTableBody.querySelectorAll('tr');
        const count = rows.length;
        this.resultsCount.textContent = `${count} donor${count > 1 ? 's' : ''} found`;
        
        if (count === 0) {
            this.showNoResults();
        }
    }

    showTemporaryMessage(message, type) {
        // Create temporary message element
        const messageElement = document.createElement('div');
        messageElement.className = `message-container ${type}`;
        messageElement.textContent = message;
        messageElement.style.position = 'fixed';
        messageElement.style.top = '20px';
        messageElement.style.right = '20px';
        messageElement.style.zIndex = '1000';
        messageElement.style.maxWidth = '400px';
        messageElement.style.animation = 'slideInRight 0.3s ease-out';
        
        document.body.appendChild(messageElement);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageElement.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 300);
        }, 3000);
    }

    formatPhone(phone) {
        // Format phone number for display
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        }
        return phone;
    }

    formatDate(dateString) {
        if (!dateString) return 'Never';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 30) return `${diffDays} days ago`;
        
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global reference for deletion functionality
let searchManager;

// Initialize search manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    searchManager = new SearchManager();
    
    // Add fade-in animation to search container
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        searchContainer.classList.add('fade-in');
    }
});

// Add CSS for sliding animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .form-input.error,
    .form-select.error {
        border-color: var(--error);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
`;
document.head.appendChild(style);