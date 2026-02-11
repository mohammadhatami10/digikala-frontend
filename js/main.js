function toEnglishNumber(str) {
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    return str.replace(/[۰-۹]/g, d => persianDigits.indexOf(d));
}

/******************** اسلایدر ********************/
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

let currentIndex = 0;
const totalSlides = slides.length;

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.className = 'slide';

        if (i === index) {
            slide.classList.add('active');
        }
        else if (i === (index - 1 + totalSlides) % totalSlides) {
            slide.classList.add('prev');
        }
        else if (i === (index + 1) % totalSlides) {
            slide.classList.add('next');
        }
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}


nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalSlides;
    showSlide(currentIndex);
});

prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    showSlide(currentIndex);
});

dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
        currentIndex = i;
        showSlide(currentIndex);
    });
});

setInterval(() => {
    currentIndex = (currentIndex + 1) % totalSlides;
    showSlide(currentIndex);
}, 5000);

showSlide(currentIndex);



/******************** سبد خرید + انیمیشن ********************/
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cartContainer = document.querySelector('.cart-container');

// دریافت سبد خرید
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// حذف آیتم‌های با qty صفر (ایمن‌سازی)
cart = cart.filter(item => item.qty > 0);
localStorage.setItem('cart', JSON.stringify(cart));

// آپدیت badge
function updateCartBadge() {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;

    // ایمن‌سازی دوباره
    cart = cart.filter(item => item.qty > 0);
    localStorage.setItem('cart', JSON.stringify(cart));

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalQty;
}

// اجرای اولیه
updateCartBadge();

addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        const id = button.dataset.id;
        const title = button.dataset.title;
        const price = parseInt(button.dataset.price);

        const existingProduct = cart.find(item => item.id === id);
        if (existingProduct) {
            existingProduct.qty++;
        } else {
            cart.push({
                cartId: `${id}|default`,
                id: id,
                title: title,
                price: price,
                options: {},
                qty: 1
            });

        }

        localStorage.setItem('cart', JSON.stringify(cart));

        // انیمیشن پرواز تصویر
        const img = button.closest('.product-card')?.querySelector('img');
        if (img) {
            const flyingImg = img.cloneNode(true);
            flyingImg.classList.add('flying-img');
            document.body.appendChild(flyingImg);

            const imgRect = img.getBoundingClientRect();
            flyingImg.style.left = imgRect.left + 'px';
            flyingImg.style.top = imgRect.top + 'px';

            const cartRect = cartContainer.getBoundingClientRect();

            requestAnimationFrame(() => {
                flyingImg.style.transform = `translate(${cartRect.left - imgRect.left}px, ${cartRect.top - imgRect.top}px) scale(0.1)`;
                flyingImg.style.opacity = '0.5';
            });

            setTimeout(() => flyingImg.remove(), 800);
        }

        updateCartBadge();

        // افکت badge
        const badge = cartContainer?.querySelector('.cart-count');
        badge?.classList.add('pop');
        setTimeout(() => badge?.classList.remove('pop'), 200);
    });
});

// Toggle mobile menu
const mobileToggle = document.querySelector('.mobile-menu-toggle');
const mainNav = document.querySelector('.main-nav');

mobileToggle.addEventListener('click', () => {
    // باز و بسته شدن منو با انیمیشن
    mainNav.classList.toggle('active');

    // انیمیشن همبرگر → ضربدر
    mobileToggle.classList.toggle('active');
});


////////////////// سرچ واقعی
const searchInput = document.getElementById('search-input');
const productCards = document.querySelectorAll('.product-card');
const noResults = document.getElementById('no-results');

let debounceTimer;

searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        const query = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        productCards.forEach(card => {
            const title = card.querySelector('.product-name').textContent.toLowerCase();
            if (title.includes(query)) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // نمایش یا مخفی کردن پیام
        if (visibleCount === 0) {
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
        }
    }, 300); // 300ms delay برای debounce
});

//////////////////// فیلتر محصولات
const categoryFilter = document.getElementById('category-filter');
const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');

function filterProducts() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    const minPrice = parseInt(minPriceInput.value) || 0;
    const maxPrice = parseInt(maxPriceInput.value) || Infinity;

    let visibleCount = 0;

    productCards.forEach(card => {
        const title = card.querySelector('.product-name').textContent.toLowerCase();
        const priceText = card.querySelector('.product-price').textContent;
        const price = parseInt(
            toEnglishNumber(priceText).replace(/[^0-9]/g, '')
        );
        const category = card.dataset.category || ""; // باید category به data-category اضافه بشه

        // بررسی همه فیلترها
        const matchesSearch = title.includes(query);
        const matchesCategory = !selectedCategory || category === selectedCategory;
        const matchesPrice = price >= minPrice && price <= maxPrice;

        if (matchesSearch && matchesCategory && matchesPrice) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
}

// event listener ها
searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(filterProducts, 300);
});

categoryFilter.addEventListener('change', filterProducts);
minPriceInput.addEventListener('input', filterProducts);
maxPriceInput.addEventListener('input', filterProducts);

productCards.forEach(card => {
    const link = card.querySelector('a');
    link.addEventListener('click', (e) => {
        e.preventDefault();

        const id = card.dataset.id;
        const product = {
            id: id,
            title: card.dataset.title,
            price: parseInt(card.dataset.price),
            img: card.dataset.image,
            gallery: [
                card.dataset.image,
                `assets/images/img${Math.min(10, parseInt(id) + 1)}.jpg`,
                `assets/images/img${Math.min(10, parseInt(id) + 2)}.jpg`,
                `assets/images/img${Math.min(10, parseInt(id) + 3)}.jpg`
            ],
            options: [
                {
                    type: 'رنگ', values: [
                        { name: 'مشکی', diff: 0, available: true },
                        { name: 'نقره‌ای', diff: 500000, available: false },
                        { name: 'آبی', diff: 1000000, available: true }
                    ]
                },
                {
                    type: 'ظرفیت', values: [
                        { name: '128GB', diff: 0, available: true },
                        { name: '256GB', diff: 2000000, available: false }
                    ]
                }
            ]
        };

        localStorage.setItem('selectedProduct', JSON.stringify(product));
        window.location.href = 'product.html';
    });
});

// حالت شب
/* ================== Dark Mode (Global) ================== */
const themeToggleBtn = document.getElementById('theme-toggle');

// اعمال حالت ذخیره‌شده
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
} else {
    if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
}

// تغییر حالت با کلیک
themeToggleBtn?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');

    themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
});
/* ================== End Dark Mode ================== */


// //////////////////////////////////////////////////////////////////////////////
// ==== پاپ‌آپ محصولات ====
const modal = document.getElementById('productModal');
const frame = document.getElementById('productFrame');
const closeBtn = document.querySelector('.close-modal');

function openProductPopup(product) {
    localStorage.setItem('selectedProduct', JSON.stringify(product));
    frame.src = 'product.html';
    modal.classList.add('active');
}

closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    frame.src = '';
});

productCards.forEach(card => {
    const link = card.querySelector('.product-link');
    link.addEventListener('click', e => {
        e.preventDefault(); // مهم: جلوگیری از دنبال کردن href
        const product = {
            id: card.dataset.id,
            title: card.dataset.title,
            price: parseInt(card.dataset.price),
            img: card.dataset.image,
            gallery: JSON.parse(card.dataset.gallery),
            options: JSON.parse(card.dataset.options)
        };
        openProductPopup(product); // تابعی که modal رو باز می‌کنه
    });
});



