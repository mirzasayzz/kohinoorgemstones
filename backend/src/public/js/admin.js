// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

function initializeAdmin() {
    setupFileUploads();
    setupFormValidation();
    setupConfirmDialogs();
    setupImagePreviews();
    setupDragAndDrop();
    setupTooltips();
}

// File upload handling
function setupFileUploads() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        if (input.multiple) {
            input.addEventListener('change', handleMultipleFileUpload);
        } else {
            input.addEventListener('change', handleSingleFileUpload);
        }
    });
}

function handleMultipleFileUpload(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById('image-preview-container');
    
    if (previewContainer) {
        previewContainer.innerHTML = '';
        
        Array.from(files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                createImagePreview(file, previewContainer, index);
            }
        });
    }
}

function handleSingleFileUpload(event) {
    const file = event.target.files[0];
    const previewContainer = document.getElementById('single-image-preview');
    
    if (previewContainer && file && file.type.startsWith('image/')) {
        previewContainer.innerHTML = '';
        createImagePreview(file, previewContainer, 0);
    }
}

function createImagePreview(file, container, index) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const previewDiv = document.createElement('div');
        previewDiv.className = 'image-preview';
        previewDiv.innerHTML = `
            <img src="${e.target.result}" alt="Preview ${index + 1}">
            <button type="button" class="remove-btn" onclick="removeImagePreview(this, ${index})">
                ×
            </button>
        `;
        container.appendChild(previewDiv);
    };
    
    reader.readAsDataURL(file);
}

function removeImagePreview(button, index) {
    const preview = button.closest('.image-preview');
    preview.remove();
    
    // Clear the file input if this was the only image
    const container = document.getElementById('image-preview-container');
    if (container && container.children.length === 0) {
        const fileInput = document.querySelector('input[type="file"][multiple]');
        if (fileInput) {
            fileInput.value = '';
        }
    }
}

// Form validation
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(form)) {
                e.preventDefault();
                showNotification('Please fill in all required fields correctly.', 'error');
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(input);
            });
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error styling
    field.classList.remove('border-red-500');
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required.';
    }
    
    // Email validation
    if (fieldType === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address.';
        }
    }
    
    // URL validation
    if (fieldType === 'url' && value) {
        try {
            new URL(value);
        } catch {
            isValid = false;
            errorMessage = 'Please enter a valid URL.';
        }
    }
    
    // Show error if validation failed
    if (!isValid) {
        field.classList.add('border-red-500');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-sm text-red-600 mt-1';
        errorDiv.textContent = errorMessage;
        field.parentNode.appendChild(errorDiv);
    }
    
    return isValid;
}

// Confirm dialogs
function setupConfirmDialogs() {
    const deleteButtons = document.querySelectorAll('[data-confirm]');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const message = button.getAttribute('data-confirm');
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });
}

// Image previews for existing images
function setupImagePreviews() {
    const existingImages = document.querySelectorAll('.existing-image');
    
    existingImages.forEach(img => {
        img.addEventListener('click', function() {
            openImageModal(img.src, img.alt);
        });
    });
}

function openImageModal(src, alt) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="relative max-w-4xl max-h-full">
            <img src="${src}" alt="${alt}" class="max-w-full max-h-full object-contain">
            <button onclick="closeImageModal(this)" class="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75">
                ×
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeImageModal(modal.querySelector('button'));
        }
    });
}

function closeImageModal(button) {
    const modal = button.closest('.fixed');
    modal.remove();
}

// Drag and drop functionality
function setupDragAndDrop() {
    const dropZones = document.querySelectorAll('.file-upload-area');
    
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', function(e) {
            e.preventDefault();
            zone.classList.add('dragover');
        });
        
        zone.addEventListener('dragleave', function(e) {
            if (!zone.contains(e.relatedTarget)) {
                zone.classList.remove('dragover');
            }
        });
        
        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            zone.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            const fileInput = zone.querySelector('input[type="file"]');
            
            if (fileInput && files.length > 0) {
                fileInput.files = files;
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    });
}

// Tooltips
function setupTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const text = e.target.getAttribute('data-tooltip');
    const tooltip = document.createElement('div');
    tooltip.className = 'absolute bg-gray-900 text-white px-2 py-1 rounded text-sm z-50 pointer-events-none';
    tooltip.textContent = text;
    tooltip.id = 'tooltip';
    
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification p-4 rounded-md shadow-lg ${getNotificationClass(type)}`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <div class="flex-shrink-0">
                ${getNotificationIcon(type)}
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <div class="ml-auto pl-3">
                <button onclick="closeNotification(this)" class="text-sm font-medium underline">
                    Dismiss
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            closeNotification(notification.querySelector('button'));
        }
    }, 5000);
}

function getNotificationClass(type) {
    switch (type) {
        case 'success': return 'bg-green-100 border border-green-400 text-green-700';
        case 'error': return 'bg-red-100 border border-red-400 text-red-700';
        case 'warning': return 'bg-yellow-100 border border-yellow-400 text-yellow-700';
        default: return 'bg-blue-100 border border-blue-400 text-blue-700';
    }
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '<i data-lucide="check-circle" class="w-5 h-5"></i>';
        case 'error': return '<i data-lucide="alert-circle" class="w-5 h-5"></i>';
        case 'warning': return '<i data-lucide="alert-triangle" class="w-5 h-5"></i>';
        default: return '<i data-lucide="info" class="w-5 h-5"></i>';
    }
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    notification.classList.add('slide-out');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

// Utility functions
function editGemstone(gemstoneId) {
    // Navigate to the edit gemstone page
    window.location.href = `/admin/gemstones/edit/${gemstoneId}`;
}

function toggleTrending(gemstoneId) {
    if (confirm('Are you sure you want to toggle the trending status of this gemstone?')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/gemstones/toggle-trending/${gemstoneId}`;
        document.body.appendChild(form);
        form.submit();
    }
}

function deleteGemstone(gemstoneId, gemstoneName) {
    if (confirm(`Are you sure you want to delete "${gemstoneName}"? This action cannot be undone.`)) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/gemstones/delete/${gemstoneId}`;
        document.body.appendChild(form);
        form.submit();
    }
}

// Loading states
function showLoading(button) {
    const originalText = button.textContent;
    button.textContent = 'Loading...';
    button.disabled = true;
    
    return function() {
        button.textContent = originalText;
        button.disabled = false;
    };
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(searchInput.value);
            }, 300);
        });
    }
}

function performSearch(query) {
    // This would be implemented based on your search requirements
    console.log('Searching for:', query);
}

// Responsive layout handling - Fixed mobile menu conflict
function handleResponsiveLayout() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-menu-overlay');
    
    if (!sidebar) return;
    
    function isDesktop() {
        return window.innerWidth >= 1024;
    }
    
    function updateLayout() {
        if (isDesktop()) {
            // Desktop: sidebar always visible, ensure overlay is hidden
            sidebar.classList.remove('-translate-x-full');
            if (overlay) overlay.classList.add('hidden');
        } else {
            // Mobile: only hide sidebar and overlay if not intentionally opened
            // Don't interfere with mobile menu functionality
            if (!sidebar.classList.contains('mobile-menu-open')) {
                sidebar.classList.add('-translate-x-full');
            }
            // Don't auto-hide overlay if mobile menu is open
            if (overlay && !overlay.classList.contains('mobile-menu-active')) {
                overlay.classList.add('hidden');
            }
        }
    }
    
    // Debounced resize handler to avoid conflicts
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateLayout, 100);
    });
    
    // Initial setup - only if mobile menu is not active
    setTimeout(() => {
        if (!sidebar.classList.contains('mobile-menu-open')) {
            updateLayout();
        }
    }, 100);
}

// Enhanced mobile menu functionality for all templates
function enhanceMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-menu-overlay');
    const closeSidebar = document.getElementById('close-sidebar');
    
    if (!sidebar) return;
    
    function openMobileSidebar() {
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.add('mobile-menu-open');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.classList.add('mobile-menu-active');
        }
    }
    
    function closeMobileSidebar() {
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.remove('mobile-menu-open');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.classList.remove('mobile-menu-active');
        }
    }
    
    // Mobile menu button click
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', openMobileSidebar);
    }
    
    // Close button click
    if (closeSidebar) {
        closeSidebar.addEventListener('click', closeMobileSidebar);
    }
    
    // Overlay click
    if (overlay) {
        overlay.addEventListener('click', closeMobileSidebar);
    }
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && window.innerWidth < 1024) {
            closeMobileSidebar();
        }
    });
}

// Initialize both responsive layout and mobile menu
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        handleResponsiveLayout();
        enhanceMobileMenu();
    });
} else {
    handleResponsiveLayout();
    enhanceMobileMenu();
}

// Export functions for global use
window.AdminJS = {
    showNotification,
    editGemstone,
    toggleTrending,
    deleteGemstone,
    showLoading,
    closeImageModal,
    closeNotification,
    handleResponsiveLayout,
    enhanceMobileMenu
}; 