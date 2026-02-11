// اعمال حالت شب در همه صفحات
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



document.addEventListener("DOMContentLoaded", function () {
    const productData = JSON.parse(localStorage.getItem('selectedProduct'));
    if (!productData) return window.location.href = 'index.html';

    const mainImage = document.querySelector('.main-image');
    const thumbnailsContainer = document.querySelector('.thumbnail-list');
    const productTitle = document.querySelector('.product-title');
    const productPrice = document.querySelector('.product-price');
    const optionsContainer = document.querySelector('.product-options');
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const cartCountEl = document.querySelector('.cart-count');

    function toPersianNumber(n) {
        const formatted = n.toLocaleString('en-US');
        const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
        return formatted.replace(/\d/g, d => persianDigits[d]);
    }

    mainImage.src = productData.img;
    productTitle.textContent = productData.title;
    productPrice.textContent = toPersianNumber(productData.price) + " تومان";

    // گالری
    thumbnailsContainer.innerHTML = '';
    productData.gallery.forEach((src, i) => {
        const img = document.createElement('img');
        img.src = src;
        if (i === 0) img.classList.add('active');
        img.addEventListener('click', () => {
            mainImage.src = src;
            thumbnailsContainer.querySelectorAll('img').forEach(t => t.classList.remove('active'));
            img.classList.add('active');
        });
        thumbnailsContainer.appendChild(img);
    });

    // گزینه‌ها
    optionsContainer.innerHTML = '';
    productData.options.forEach(optGroup => {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('option-group');
        const p = document.createElement('p');
        p.textContent = optGroup.type + ':';
        groupDiv.appendChild(p);

        optGroup.values.forEach((val, i) => {
            const btn = document.createElement('button');
            btn.classList.add('option-btn');
            if (i === 0) btn.classList.add('active');
            btn.textContent = val.name;
            btn.dataset.priceDiff = val.diff;
            btn.dataset.available = val.available;

            if (!val.available) {
                btn.disabled = true;
                btn.style.opacity = "0.5";
                btn.style.cursor = "not-allowed";
            }

            btn.addEventListener('click', () => {
                if (btn.disabled) return;
                groupDiv.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updatePrice();
            });

            groupDiv.appendChild(btn);
        });

        optionsContainer.appendChild(groupDiv);
    });

    function updatePrice() {
        let totalDiff = 0;
        document.querySelectorAll('.option-group').forEach(group => {
            const activeBtn = group.querySelector('.option-btn.active');
            if (activeBtn) totalDiff += parseInt(activeBtn.dataset.priceDiff) || 0;
        });
        productPrice.textContent = toPersianNumber(productData.price + totalDiff) + " تومان";
    }

    function getSelectedOptions() {
        const result = {};
        document.querySelectorAll('.option-group').forEach(group => {
            const type = group.querySelector('p').textContent.replace(':', '');
            const activeBtn = group.querySelector('.option-btn.active');
            if (activeBtn) result[type] = activeBtn.textContent;
        });
        return result;
    }

    function getFinalPrice() {
        let totalDiff = 0;
        document.querySelectorAll('.option-group').forEach(group => {
            const activeBtn = group.querySelector('.option-btn.active');
            if (activeBtn) totalDiff += parseInt(activeBtn.dataset.priceDiff) || 0;
        });
        return productData.price + totalDiff;
    }

    function generateCartId(id, options) {
        const sortedKeys = Object.keys(options).sort();
        let keyStr = sortedKeys.map(k => `${k}:${options[k]}`).join('|');
        return `${id}|${keyStr}`;
    }

    function updateCartBadge() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
        if (cartCountEl) cartCountEl.textContent = totalQty;
    }

    addToCartBtn.addEventListener('click', () => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const selectedOptions = getSelectedOptions();
        const finalPrice = getFinalPrice();
        const cartId = generateCartId(productData.id, selectedOptions);

        const existingProduct = cart.find(item => item.cartId === cartId);

        if (existingProduct) existingProduct.qty++;
        else cart.push({
            cartId,
            id: productData.id,
            title: productData.title,
            price: finalPrice,
            options: selectedOptions,
            qty: 1
        });

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
    });

    updateCartBadge();
});
