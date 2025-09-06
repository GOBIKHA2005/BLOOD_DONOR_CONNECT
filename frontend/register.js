// Registration functionality
class RegistrationManager {
    constructor() {
        this.apiBase = 'http://localhost:3001/api';
        this.form = document.getElementById('donorRegistrationForm');
        this.messageContainer = document.getElementById('messageContainer');
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.setupFormSubmission();
        this.setupInputAnimations();
    }

    setupFormValidation() {
        const inputs = this.form.querySelectorAll('.form-input, .form-select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.name) {
            case 'name':
                if (!value || value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters long';
                }
                break;
                
            case 'age':
                const age = parseInt(value);
                if (!age || age < 18 || age > 65) {
                    isValid = false;
                    errorMessage = 'Age must be between 18 and 65';
                }
                break;
                
            case 'phone':
                const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
                if (!value || !phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;
                
            case 'city':
            case 'state':
                if (!value || value.length < 2) {
                    isValid = false;
                    errorMessage = `${field.name.charAt(0).toUpperCase() + field.name.slice(1)} is required`;
                }
                break;
                
            case 'bloodGroup':
            case 'gender':
                if (!value) {
                    isValid = false;
                    errorMessage = `${field.name.charAt(0).toUpperCase() + field.name.slice(1)} selection is required`;
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorElement = document.createElement('span');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.color = 'var(--error)';
        errorElement.style.fontSize = '0.75rem';
        errorElement.style.marginTop = 'var(--spacing-xs)';
        
        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    setupFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitForm();
        });
    }

    async submitForm() {
        // Validate all fields
        const inputs = this.form.querySelectorAll('.form-input, .form-select');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showMessage('Please correct the errors above', 'error');
            return;
        }

        // Collect form data
        const formData = new FormData(this.form);
        const donorData = {
            name: formData.get('name'),
            bloodGroup: formData.get('bloodGroup'),
            age: parseInt(formData.get('age')),
            gender: formData.get('gender'),
            phone: formData.get('phone'),
            city: formData.get('city'),
            state: formData.get('state'),
            lastDonation: formData.get('lastDonation') || null
        };

        // Show loading state
        const submitButton = this.form.querySelector('.submit-button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Registering...';
        submitButton.disabled = true;

        try {
            const response = await fetch(`${this.apiBase}/donors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(donorData)
            });

            if (response.ok) {
                const result = await response.json();
                this.showMessage('Registration successful! Thank you for becoming a blood donor.', 'success');
                this.form.reset();
                
                // Redirect to dashboard after success
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                const error = await response.json();
                this.showMessage(error.message || 'Registration failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage('Network error. Please check your connection and try again.', 'error');
        } finally {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    showMessage(message, type) {
        this.messageContainer.className = `message-container ${type}`;
        this.messageContainer.textContent = message;
        this.messageContainer.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                this.messageContainer.style.display = 'none';
            }, 5000);
        }
    }

    setupInputAnimations() {
        const inputs = this.form.querySelectorAll('.form-input, .form-select');
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentNode.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                input.parentNode.classList.remove('focused');
            });
        });
    }
}

// Initialize registration manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegistrationManager();
    
    // Add fade-in animation to form
    const form = document.querySelector('.registration-form');
    if (form) {
        form.classList.add('fade-in');
    }
});