
// FIXLY TALLER - FUNCIONALIDADES JAVASCRIPT
// ==========================================

class FixlyTaller {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 Fixly Taller System Initialized');
        this.setupSmoothScroll();
        this.setupPlanInteractions();
        this.setupFAQToggle();
        this.setupFormValidations();
        this.setupAnimations();
    }

    // Navegación suave entre secciones
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Interacciones con los planes de precios
    setupPlanInteractions() {
        document.querySelectorAll('.plan-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
                card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            });
        });
    }

    // Toggle para FAQ
    setupFAQToggle() {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const icon = question.querySelector('.faq-icon');

                if (answer.style.display === 'none' || !answer.style.display) {
                    answer.style.display = 'block';
                    icon.style.transform = 'rotate(45deg)';
                } else {
                    answer.style.display = 'none';
                    icon.style.transform = 'rotate(0deg)';
                }
            });
        });
    }

    // Validaciones de formularios
    setupFormValidations() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                    this.showNotification('Por favor, completa todos los campos requeridos', 'error');
                }
            });
        });
    }

    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('border-red-500');
                isValid = false;
            } else {
                field.classList.remove('border-red-500');
            }
        });

        return isValid;
    }

    // Animaciones de entrada
    setupAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        });

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    // Sistema de notificaciones
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'error' ? 'bg-red-500 text-white' : 
            type === 'success' ? 'bg-green-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Simulador de contacto por WhatsApp
    contactWhatsApp(message = '') {
        const phoneNumber = '1234567890'; // Reemplazar con número real
        const defaultMessage = message || 'Hola, me interesa conocer más sobre Fixly Taller';
        const encodedMessage = encodeURIComponent(defaultMessage);
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

        window.open(whatsappURL, '_blank');
    }

    // Calculadora de ROI simple
    calculateROI(monthlyRevenue, currentCosts) {
        const fixlyPlanCost = 19900; // Plan Pro
        const estimatedSavings = currentCosts * 0.15; // 15% de ahorro estimado
        const monthlyBenefit = estimatedSavings - fixlyPlanCost;
        const annualROI = (monthlyBenefit * 12 / fixlyPlanCost) * 100;

        return {
            monthlyBenefit,
            annualROI: Math.round(annualROI * 100) / 100
        };
    }
}

// Utilidades adicionales
const FixlyUtils = {
    // Formatear números como moneda
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(amount);
    },

    // Validar RUT chileno
    validateRUT(rut) {
        const cleanRUT = rut.replace(/[^0-9kK]/g, '');
        if (cleanRUT.length < 2) return false;

        const body = cleanRUT.slice(0, -1);
        const checkDigit = cleanRUT.slice(-1).toLowerCase();

        let sum = 0;
        let multiplier = 2;

        for (let i = body.length - 1; i >= 0; i--) {
            sum += parseInt(body[i]) * multiplier;
            multiplier = multiplier === 7 ? 2 : multiplier + 1;
        }

        const remainder = sum % 11;
        const calculatedDigit = remainder < 2 ? remainder.toString() : 'k';

        return calculatedDigit === checkDigit;
    },

    // Debounce para optimizar eventos
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
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.fixlyTaller = new FixlyTaller();
    window.fixlyUtils = FixlyUtils;
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FixlyTaller, FixlyUtils };
}
