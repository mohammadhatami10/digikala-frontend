/* ================== Utilities ================== */
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

function toEnglishNumber(str) {
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    return str.replace(/[۰-۹]/g, d => persianDigits.indexOf(d));
}

/* ================== Slider ================== */
(function initSlider() {
    const slides = $$('.slide');
    const dots = $$('.dot');
    const prevBtn = $('.prev');
    const nextBtn = $('.next');

    if (!slides.length) return;

    let currentIndex = 0;
    const total = slides.length;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.className = 'slide';
            if (i === index) slide.classList.add('active');
            else if (i === (index - 1 + total) % total) slide.classList.add('prev');
            else if (i === (index + 1) % total) slide.classList.add('next');
        });

        dots.forEach((dot, i) =>
            dot.classList.toggle('active', i === index)
        );
    }

    const slider = document.querySelector('.slider');

    let startX = 0;
    let endX = 0;

    slider?.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    slider?.addEventListener('touchmove', (e) => {
        endX = e.touches[0].clientX;
    });

    slider?.addEventListener('touchend', () => {
        const diff = startX - endX;

        if (Math.abs(diff) > 60) { // حداقل فاصله برای تشخیص swipe
            if (diff > 0) {
                // رفتن به اسلاید قبلی
                currentIndex = (currentIndex - 1 + total) % total;
            } else {
                // رفتن به اسلاید بعدی
                currentIndex = (currentIndex + 1) % total;
            }

            showSlide(currentIndex);
        }

        startX = 0;
        endX = 0;
    });

    nextBtn?.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % total;
        showSlide(currentIndex);
    });

    prevBtn?.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + total) % total;
        showSlide(currentIndex);
    });

    dots.forEach((dot, i) =>
        dot.addEventListener('click', () => {
            currentIndex = i;
            showSlide(currentIndex);
        })
    );

    setInterval(() => {
        currentIndex = (currentIndex + 1) % total;
        showSlide(currentIndex);
    }, 5000);

    showSlide(currentIndex);
})();

/* ================== Cart ================== */
(function initCart() {
    const buttons = $$('.add-to-cart');
    const cartContainer = $('.cart-container');
    const cartCount = $('.cart-count');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.qty > 0);
    saveCart();

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function updateBadge() {
        if (!cartCount) return;
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCount.textContent = totalQty;
    }

    updateBadge();

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const { id, title, price } = btn.dataset;
            const existing = cart.find(item => item.id === id);

            if (existing) existing.qty++;
            else {
                cart.push({
                    cartId: `${id}|default`,
                    id,
                    title,
                    price: parseInt(price),
                    options: {},
                    qty: 1
                });
            }

            saveCart();
            updateBadge();

            animateToCart(btn, cartContainer);
        });
    });

    function animateToCart(button, cartEl) {
        if (!cartEl) return;

        const img = button.closest('.product-card')?.querySelector('img');
        if (!img) return;

        const flying = img.cloneNode(true);
        flying.classList.add('flying-img');
        document.body.appendChild(flying);

        const imgRect = img.getBoundingClientRect();
        const cartRect = cartEl.getBoundingClientRect();

        flying.style.left = imgRect.left + 'px';
        flying.style.top = imgRect.top + 'px';

        requestAnimationFrame(() => {
            flying.style.transform = `translate(${cartRect.left - imgRect.left}px, ${cartRect.top - imgRect.top}px) scale(0.1)`;
            flying.style.opacity = '0.5';
        });

        setTimeout(() => flying.remove(), 800);

        cartCount?.classList.add('pop');
        setTimeout(() => cartCount?.classList.remove('pop'), 200);
    }
})();

/* ================== Search + Filter ================== */
(function initFilters() {
    const searchInput = $('#search-input');
    const cards = $$('.product-card');
    const noResults = $('#no-results');
    const categoryFilter = $('#category-filter');
    const minPriceInput = $('#min-price');
    const maxPriceInput = $('#max-price');

    if (!searchInput) return;

    let debounceTimer;

    function filterProducts() {
        const query = searchInput.value.trim().toLowerCase();
        const selectedCategory = categoryFilter?.value || "";
        const minPrice = parseInt(minPriceInput?.value) || 0;
        const maxPrice = parseInt(maxPriceInput?.value) || Infinity;

        let visibleCount = 0;

        cards.forEach(card => {
            const title = card.querySelector('.product-name').textContent.toLowerCase();
            const priceText = card.querySelector('.product-price').textContent;
            const price = parseInt(
                toEnglishNumber(priceText).replace(/[^0-9]/g, '')
            );
            const category = card.dataset.category || "";

            const matches =
                title.includes(query) &&
                (!selectedCategory || category === selectedCategory) &&
                price >= minPrice &&
                price <= maxPrice;

            card.style.display = matches ? 'block' : 'none';
            if (matches) visibleCount++;
        });

        if (noResults)
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(filterProducts, 300);
    });

    categoryFilter?.addEventListener('change', filterProducts);
    minPriceInput?.addEventListener('input', filterProducts);
    maxPriceInput?.addEventListener('input', filterProducts);
})();

/* ================== Dark Mode ================== */
(function initDarkMode() {
    const toggleBtn = $('#theme-toggle');
    const isDark = localStorage.getItem('darkMode') === 'enabled';

    if (isDark) document.body.classList.add('dark-mode');
    if (toggleBtn) toggleBtn.textContent = isDark ? '☀️' : '🌙';

    toggleBtn?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const dark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', dark ? 'enabled' : 'disabled');
        toggleBtn.textContent = dark ? '☀️' : '🌙';
    });
})();

/* ================== Product Popup ================== */
(function initProductPopup() {
    const modal = $('#productModal');
    const frame = $('#productFrame');
    const closeBtn = $('.close-modal');
    const cards = $$('.product-card');

    if (!modal || !frame) return;

    function openPopup(product) {
        localStorage.setItem('selectedProduct', JSON.stringify(product));
        frame.src = 'product.html';
        modal.classList.add('active');
    }

    closeBtn?.addEventListener('click', () => {
        modal.classList.remove('active');
        frame.src = '';
    });

    cards.forEach(card => {
        const link = card.querySelector('.product-link');
        if (!link) return;

        link.addEventListener('click', e => {
            e.preventDefault();

            const product = {
                id: card.dataset.id,
                title: card.dataset.title,
                price: parseInt(card.dataset.price),
                img: card.dataset.image,
                gallery: JSON.parse(card.dataset.gallery || "[]"),
                options: JSON.parse(card.dataset.options || "[]")
            };

            openPopup(product);
        });
    });
})();

/* ================= mobile hamburger ================= */
(function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.main-nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        nav.classList.toggle('active'); // کلاس active که در CSS داریم
    });
})();

/* ================== Auth Modal ================== */
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const showSignup = document.getElementById("show-signup");
const showLogin = document.getElementById("show-login");

const authPopup = document.getElementById("auth-popup");
const openAuthBtn = document.getElementById("open-auth");
const closePopupBtn = document.querySelector(".close-popup");

// باز کردن پاپ‌آپ
openAuthBtn.addEventListener("click", (e) => {
    e.preventDefault();
    authPopup.classList.add("active");
    loginForm.classList.add("active");
    signupForm.classList.remove("active");
});

// بستن پاپ‌آپ
closePopupBtn.addEventListener("click", () => authPopup.classList.remove("active"));

// سوئیچ فرم
showSignup.addEventListener("click", () => {
    loginForm.classList.remove("active");
    signupForm.classList.add("active");
});
showLogin.addEventListener("click", () => {
    signupForm.classList.remove("active");
    loginForm.classList.add("active");
});

// نمایش/مخفی کردن پسورد
document.querySelectorAll(".toggle-password").forEach(btn => {
    btn.addEventListener("click", () => {
        const input = btn.previousElementSibling;
        input.type = input.type === "password" ? "text" : "password";
    });
});

// اعتبارسنجی ساده ثبت‌نام
signupForm.addEventListener("submit", e => {
    e.preventDefault();
    let valid = true;
    const name = document.getElementById("signup-name");
    const email = document.getElementById("signup-email");
    const pass = document.getElementById("signup-password");
    const pass2 = document.getElementById("signup-password2");
    document.querySelectorAll("#signup-form .error-message").forEach(span => span.textContent = "");

    if (name.value.trim().length < 3) { name.nextElementSibling.textContent = "نام کوتاه است"; valid = false; }
    if (!email.value.includes("@")) { email.nextElementSibling.textContent = "ایمیل نامعتبر"; valid = false; }
    if (pass.value.length < 6) { pass.nextElementSibling.textContent = "رمز حداقل ۶ کاراکتر"; valid = false; }
    if (pass.value !== pass2.value) { pass2.nextElementSibling.textContent = "رمزها مطابقت ندارند"; valid = false; }

    if (valid) alert("ثبت نام موفق!");
});