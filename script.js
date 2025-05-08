document.addEventListener('DOMContentLoaded', function() {
    // Add loading animation
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loading);

    // Remove loading animation after page loads
    window.addEventListener('load', () => {
        loading.style.opacity = '0';
        setTimeout(() => loading.remove(), 300);
    });

    // Mobile menu functionality
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!hamburger.contains(event.target) && !navLinks.contains(event.target)) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });

    // Animate product items on scroll
    const productItems = document.querySelectorAll('.product-item');
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    productItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        observer.observe(item);
    });

    // Cart functionality
    const cartIcon = document.querySelector('.cart-icon');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const closeCart = document.querySelector('.close-cart');
    const cartItems = document.querySelector('.cart-items');
    const cartCount = document.querySelector('.cart-count');
    const cartTotal = document.querySelector('.cart-total span');
    const checkoutBtn = document.querySelector('.checkout-btn');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Toggle cart sidebar with animation
    cartIcon.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    closeCart.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    cartOverlay.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Add to cart animation
    function animateAddToCart(button) {
        button.classList.add('adding');
        setTimeout(() => button.classList.remove('adding'), 1000);
    }

    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const product = this.parentElement;
            const productId = product.dataset.id;
            const productName = product.dataset.name;
            const productPrice = parseInt(product.dataset.price);
            const productImage = product.querySelector('img').src;
            
            animateAddToCart(this);
            addToCart(productId, productName, productPrice, productImage);
            updateCartUI();
            showNotification(`${productName} added to cart!`);
        });
    });

    function addToCart(id, name, price, image) {
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id,
                name,
                price,
                image,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function updateCartUI() {
        // Update cart count
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Update cart items
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">₹${item.price}/kg</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Update total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `₹${total}`;

        // Add event listeners for quantity buttons and remove buttons
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', handleQuantityChange);
        });

        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', handleQuantityInput);
        });

        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', handleRemoveItem);
        });
    }

    function handleQuantityChange(e) {
        const button = e.target;
        const id = button.dataset.id;
        const item = cart.find(item => item.id === id);
        
        if (button.classList.contains('plus')) {
            item.quantity += 1;
        } else if (button.classList.contains('minus') && item.quantity > 1) {
            item.quantity -= 1;
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    }

    function handleQuantityInput(e) {
        const input = e.target;
        const id = input.dataset.id;
        const item = cart.find(item => item.id === id);
        
        const newQuantity = parseInt(input.value);
        if (newQuantity > 0) {
            item.quantity = newQuantity;
        } else {
            item.quantity = 1;
            input.value = 1;
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    }

    function handleRemoveItem(e) {
        const button = e.target.closest('.remove-item');
        const id = button.dataset.id;
        
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    }

    // Enhanced notification animation
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Trigger reflow
        notification.offsetHeight;

        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Animate category items
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-5px)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0)';
        });
    });

    // Animate form inputs
    const formInputs = document.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });

    // Animate payment methods
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('mouseenter', () => {
            method.style.transform = 'translateY(-5px)';
        });
        method.addEventListener('mouseleave', () => {
            method.style.transform = 'translateY(0)';
        });
    });

    // Checkout functionality
    const checkoutModal = document.querySelector('.checkout-modal');
    const checkoutOverlay = document.querySelector('.checkout-overlay');
    const closeCheckout = document.querySelector('.close-checkout');
    const steps = document.querySelectorAll('.step');
    const forms = document.querySelectorAll('.checkout-form');
    const nextStepButtons = document.querySelectorAll('.next-step');
    const prevStepButtons = document.querySelectorAll('.prev-step');
    const confirmOrderBtn = document.querySelector('.confirm-order');
    const paymentMethodInputs = document.querySelectorAll('input[name="payment"]');
    const upiDetails = document.querySelector('.upi-details');
    const cardDetails = document.querySelector('.card-details');

    // Open checkout modal
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showNotification('Your cart is empty!', 'error');
            return;
        }
        checkoutModal.classList.add('active');
        checkoutOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateOrderSummary();
    });

    // Close checkout modal
    closeCheckout.addEventListener('click', () => {
        checkoutModal.classList.remove('active');
        checkoutOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    checkoutOverlay.addEventListener('click', () => {
        checkoutModal.classList.remove('active');
        checkoutOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Handle next step buttons
    nextStepButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentForm = button.closest('.checkout-form');
            const nextStep = button.dataset.next;
            
            if (validateForm(currentForm)) {
                currentForm.classList.add('hidden');
                document.getElementById(`${nextStep}-form`).classList.remove('hidden');
                updateSteps(nextStep);
            }
        });
    });

    // Handle previous step buttons
    prevStepButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentForm = button.closest('.checkout-form');
            const prevStep = button.dataset.prev;
            
            currentForm.classList.add('hidden');
            document.getElementById(`${prevStep}-form`).classList.remove('hidden');
            updateSteps(prevStep);
        });
    });

    // Handle payment method selection
    paymentMethodInputs.forEach(method => {
        method.addEventListener('change', () => {
            const selectedMethod = method.value;
            upiDetails.classList.toggle('hidden', selectedMethod !== 'upi');
            cardDetails.classList.toggle('hidden', selectedMethod !== 'card');
        });
    });

    // Confirm order
    confirmOrderBtn.addEventListener('click', () => {
        if (validateForm(document.getElementById('confirmation-form'))) {
            // Show success message
            showNotification('Order placed successfully!', 'success');
            
            // Clear cart
            cart = [];
            localStorage.removeItem('cart');
            
            // Close modals
            checkoutModal.classList.remove('active');
            checkoutOverlay.classList.remove('active');
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
            
            // Reset checkout forms
            document.getElementById('delivery-form').classList.remove('hidden');
            document.getElementById('payment-form').classList.add('hidden');
            document.getElementById('confirmation-form').classList.add('hidden');
            updateSteps('delivery');
            
            // Update cart UI
            updateCartUI();
        }
    });

    // Update steps UI
    function updateSteps(activeStep) {
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
            if (step.dataset.step === activeStep) {
                step.classList.add('active');
            }
        });
    }

    // Validate form
    function validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
                showNotification(`Please fill in ${input.previousElementSibling.textContent}`, 'error');
            } else {
                input.classList.remove('error');
            }
        });
        
        return isValid;
    }

    // Update order summary
    function updateOrderSummary() {
        const summaryItems = document.querySelector('.summary-items');
        const subtotal = document.querySelector('.subtotal');
        const finalTotal = document.querySelector('.final-total');
        const deliveryInfo = document.querySelector('.delivery-info');
        
        // Update items
        summaryItems.innerHTML = cart.map(item => `
            <div class="summary-row">
                <span>${item.name} x ${item.quantity}</span>
                <span>₹${item.price * item.quantity}</span>
            </div>
        `).join('');
        
        // Update totals
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = 50;
        subtotal.textContent = `₹${total}`;
        finalTotal.textContent = `₹${total + deliveryFee}`;
        
        // Update delivery info
        const fullName = document.getElementById('fullName').value;
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const pincode = document.getElementById('pincode').value;
        
        deliveryInfo.innerHTML = `
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Address:</strong> ${address}</p>
            <p><strong>City:</strong> ${city}</p>
            <p><strong>State:</strong> ${state}</p>
            <p><strong>Pincode:</strong> ${pincode}</p>
        `;
    }

    // Initialize cart UI
    updateCartUI();

    // Set hero section background to walnut farm.jpg
    const heroSection = document.querySelector('.hero');
    heroSection.style.backgroundImage = "url('walnut farm.jpg')";
}); 