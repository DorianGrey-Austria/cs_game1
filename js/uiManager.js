// Advanced UI Manager with Material Design 3.0 and Microinteractions
// Handles notifications, animations, and user feedback

class UIManager {
    constructor() {
        this.notifications = [];
        this.rippleElements = new Set();
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        this.setupRippleEffects();
        this.setupButtonAnimations();
        this.setupAccessibility();
        this.setupNotificationContainer();
        
        this.isInitialized = true;
        console.log('🎨 UI Manager initialized with Material Design 3.0');
    }

    // Notification System
    showNotification(message, type = 'info', duration = 3000) {
        const notification = this.createNotification(message, type);
        document.body.appendChild(notification);
        
        // Trigger entrance animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Auto-remove notification
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
        
        this.notifications.push(notification);
        return notification;
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;
        
        // Add microinteraction
        notification.addEventListener('mouseenter', () => {
            notification.style.transform = 'translateX(-5px) scale(1.02)';
        });
        
        notification.addEventListener('mouseleave', () => {
            notification.style.transform = 'translateX(0) scale(1)';
        });
        
        return notification;
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    removeNotification(notification) {
        notification.style.transform = 'translateX(100%) scale(0.8)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }

    // Ripple Effects
    setupRippleEffects() {
        const rippleElements = document.querySelectorAll('.game-btn, .stat, .interactive-element');
        
        rippleElements.forEach(element => {
            this.addRippleEffect(element);
        });
    }

    addRippleEffect(element) {
        if (this.rippleElements.has(element)) return;
        
        element.classList.add('ripple-effect');
        element.addEventListener('click', this.createRipple.bind(this));
        this.rippleElements.add(element);
    }

    createRipple(event) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        button.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    // Enhanced Button Animations
    setupButtonAnimations() {
        const buttons = document.querySelectorAll('.game-btn');
        
        buttons.forEach(button => {
            this.enhanceButton(button);
        });
    }

    enhanceButton(button) {
        // Add loading state capability
        button.originalContent = button.innerHTML;
        
        // Enhanced hover effects
        button.addEventListener('mouseenter', () => {
            if (!button.disabled && !button.classList.contains('loading')) {
                button.style.transform = 'translateY(-3px) scale(1.05)';
                this.addButtonGlow(button);
            }
        });
        
        button.addEventListener('mouseleave', () => {
            if (!button.disabled && !button.classList.contains('loading')) {
                button.style.transform = 'translateY(0) scale(1)';
                this.removeButtonGlow(button);
            }
        });
        
        // Focus management
        button.addEventListener('focus', () => {
            this.addFocusRing(button);
        });
        
        button.addEventListener('blur', () => {
            this.removeFocusRing(button);
        });
    }

    addButtonGlow(button) {
        const glowColor = button.classList.contains('primary') ? 
            'rgba(255, 0, 128, 0.4)' : 'rgba(0, 255, 255, 0.4)';
        
        button.style.boxShadow = `
            ${button.style.boxShadow}, 
            0 0 30px ${glowColor},
            0 0 60px ${glowColor}
        `;
    }

    removeButtonGlow(button) {
        // Reset to original box-shadow
        if (button.classList.contains('primary')) {
            button.style.boxShadow = `
                0 4px 25px rgba(255, 0, 128, 0.5),
                0 0 20px rgba(0, 255, 255, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `;
        } else {
            button.style.boxShadow = `
                0 0 15px rgba(0, 255, 255, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `;
        }
    }

    addFocusRing(button) {
        button.style.outline = '3px solid rgba(0, 255, 255, 0.5)';
        button.style.outlineOffset = '2px';
    }

    removeFocusRing(button) {
        button.style.outline = 'none';
        button.style.outlineOffset = '0';
    }

    // Loading States
    setButtonLoading(button, loading = true) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
            button.innerHTML = `
                <span style="opacity: 0;">${button.originalContent}</span>
            `;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            button.innerHTML = button.originalContent;
        }
    }

    // Animated Counters
    animateCounter(element, startValue, endValue, duration = 1000) {
        const startTime = performance.now();
        const range = endValue - startValue;
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(startValue + (range * easeOut));
            
            element.textContent = currentValue.toLocaleString();
            element.classList.add('updated');
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                setTimeout(() => {
                    element.classList.remove('updated');
                }, 300);
            }
        };
        
        requestAnimationFrame(updateCounter);
    }

    // Progress Indicators
    createProgressBar(container, progress = 0) {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.innerHTML = `
            <div class="progress-track">
                <div class="progress-fill" style="width: ${progress}%"></div>
                <div class="progress-glow"></div>
            </div>
        `;
        
        container.appendChild(progressBar);
        return progressBar;
    }

    updateProgress(progressBar, newProgress, animated = true) {
        const fill = progressBar.querySelector('.progress-fill');
        const glow = progressBar.querySelector('.progress-glow');
        
        if (animated) {
            fill.style.transition = 'width 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)';
            glow.style.transition = 'left 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)';
        }
        
        fill.style.width = `${newProgress}%`;
        glow.style.left = `${newProgress}%`;
    }

    // Accessibility Features
    setupAccessibility() {
        // Keyboard navigation
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
        
        // Reduce motion for users who prefer it
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
        
        // High contrast mode detection
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
    }

    setupNotificationContainer() {
        // Create styles for notifications
        const notificationStyles = `
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .notification-icon {
                font-size: 1.2rem;
            }
            
            .notification-message {
                flex: 1;
                font-family: 'JetBrains Mono', monospace;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: currentColor;
                cursor: pointer;
                font-size: 1.1rem;
                padding: 4px;
                border-radius: 50%;
                transition: all 0.2s ease;
            }
            
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
            }
            
            .progress-bar {
                width: 100%;
                height: 8px;
                border-radius: 4px;
                overflow: hidden;
                background: rgba(255, 255, 255, 0.1);
                position: relative;
            }
            
            .progress-track {
                position: relative;
                height: 100%;
                width: 100%;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #ff0080, #00ffff);
                border-radius: 4px;
                transition: width 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .progress-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                animation: progress-shine 2s ease-in-out infinite;
            }
            
            @keyframes progress-shine {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            
            .progress-glow {
                position: absolute;
                top: -2px;
                left: 0;
                width: 4px;
                height: 12px;
                background: #00ffff;
                border-radius: 2px;
                box-shadow: 0 0 10px #00ffff;
                transform: translateX(-50%);
            }
            
            /* Reduced motion styles */
            .reduced-motion * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
            
            /* High contrast styles */
            .high-contrast .game-btn {
                border: 2px solid currentColor !important;
            }
            
            .high-contrast .notification {
                border: 2px solid currentColor !important;
            }
            
            /* Keyboard navigation */
            .keyboard-navigation *:focus {
                outline: 3px solid #00ffff !important;
                outline-offset: 2px !important;
            }
        `;
        
        // Inject styles
        const styleSheet = document.createElement('style');
        styleSheet.textContent = notificationStyles;
        document.head.appendChild(styleSheet);
    }

    // Theme Management
    applyTheme(theme = 'cyberpunk') {
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${theme}`);
        
        this.showNotification(`Theme changed to ${theme}`, 'info', 2000);
    }

    // Utility Methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Cleanup
    destroy() {
        this.notifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        
        this.rippleElements.clear();
        this.notifications = [];
        
        console.log('🧹 UI Manager destroyed');
    }
}

// Export for global use
window.UIManager = UIManager;