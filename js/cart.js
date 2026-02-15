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


const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function toPersianNumber(n) {
    const formatted = n.toLocaleString('en-US');
    const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    return formatted.replace(/\d/g, d => persianDigits[d]);
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="cart-empty">سبد خرید خالی است</p>';
        cartTotalElement.textContent = '۰ تومان';
        return;
    }

    let total = 0;

    cart.forEach(item => {
        total += item.price * item.qty;

        const optionsText = Object.entries(item.options || {})
            .map(([k,v]) => `${k}: ${v}`)
            .join(', ');

        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.dataset.cartId = item.cartId;

        div.innerHTML = `
            <div>
                <h4>${item.title}</h4>
                <p>${toPersianNumber(item.price)} تومان</p>
                ${optionsText ? `<p>${optionsText}</p>` : ''}
            </div>
            <div class="cart-actions">
                <button class="decrease">−</button>
                <span class="qty">${item.qty}</span>
                <button class="increase">+</button>
                <button class="remove">حذف</button>
            </div>
        `;
        cartItemsContainer.appendChild(div);
    });

    cartTotalElement.textContent = toPersianNumber(total) + ' تومان';

    // اضافه کردن event listener به دکمه‌ها
    cartItemsContainer.querySelectorAll('.increase').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.closest('.cart-item').dataset.cartId;
            increaseQty(id);
        });
    });
    cartItemsContainer.querySelectorAll('.decrease').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.closest('.cart-item').dataset.cartId;
            decreaseQty(id);
        });
    });
    cartItemsContainer.querySelectorAll('.remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.closest('.cart-item').dataset.cartId;
            removeItem(id);
        });
    });
}

function syncCart() {
    if (cart.length === 0) localStorage.removeItem('cart');
    else localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartBadge();
}

function increaseQty(cartId) {
    const item = cart.find(p => p.cartId === cartId);
    if (!item) return;
    item.qty++;
    syncCart();
}

function decreaseQty(cartId) {
    const index = cart.findIndex(p => p.cartId === cartId);
    if (index === -1) return;
    if (cart[index].qty === 1) cart.splice(index, 1);
    else cart[index].qty--;
    syncCart();
}

function removeItem(cartId) {
    cart = cart.filter(item => item.cartId !== cartId);
    syncCart();
}

function updateCartBadge() {
    const cartCountEl = document.querySelector('.cart-count');
    if (!cartCountEl) return;
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.textContent = totalQty;
}

// اجرای اولیه
renderCart();
updateCartBadge();

////////////////////////////بازگشت
const closeCartBtn = document.getElementById('close-cart');
closeCartBtn?.addEventListener('click', () => {
    window.location.href = 'index.html';
});
