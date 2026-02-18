document.addEventListener("DOMContentLoaded", () => {

  // دسترسی‌ها
  const authPopup = document.getElementById("auth-popup");
  const openAuthBtn = document.getElementById("open-auth");
  const closePopupBtn = document.querySelector(".close-popup");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const showSignup = document.getElementById("show-signup");
  const showLogin = document.getElementById("show-login");
  const loginLink = document.querySelector(".login a");

  if (!authPopup || !loginForm || !signupForm || !loginLink) return;

  // =========================
  // سوئیچ فرم‌ها
  // =========================
  showSignup?.addEventListener("click", () => {
    loginForm.classList.remove("active");
    signupForm.classList.add("active");
  });

  showLogin?.addEventListener("click", () => {
    signupForm.classList.remove("active");
    loginForm.classList.add("active");
  });

  // =========================
  // نمایش / مخفی کردن پسورد
  // =========================
  document.querySelectorAll(".toggle-password").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const wrapper = btn.closest(".password-wrapper");
      if (!wrapper) return;
      const input = wrapper.querySelector("input[type='password'], input[type='text']");
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
    });
  });

  // =========================
  // باز کردن پاپ‌آپ
  // =========================
  function openAuthPopup(e) {
    e?.preventDefault();
    authPopup.classList.add("active");
    loginForm.classList.add("active");
    signupForm.classList.remove("active");
  }

  openAuthBtn?.addEventListener("click", openAuthPopup);

  // بستن پاپ‌آپ
  closePopupBtn?.addEventListener("click", () => {
    authPopup.classList.remove("active");
  });

  // =========================
  // ثبت‌نام
  // =========================
  signupForm.addEventListener("submit", e => {
    e.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const pass = document.getElementById("signup-password").value;
    const pass2 = document.getElementById("signup-password2").value;

    signupForm.querySelectorAll(".error-message").forEach(span => span.textContent = "");

    let valid = true;

    if (name.length < 3) {
      document.querySelector("#signup-name").nextElementSibling.textContent = "نام کوتاه است";
      valid = false;
    }

    if (!email.includes("@")) {
      document.querySelector("#signup-email").nextElementSibling.textContent = "ایمیل نامعتبر";
      valid = false;
    }

    if (pass.length < 6) {
      document.querySelector("#signup-password").parentElement.nextElementSibling.textContent = "رمز حداقل ۶ کاراکتر";
      valid = false;
    }

    if (pass !== pass2) {
      document.querySelector("#signup-password2").parentElement.nextElementSibling.textContent = "رمزها مطابقت ندارند";
      valid = false;
    }

    if (!valid) return;

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.find(u => u.email === email)) {
      alert("ایمیل قبلا ثبت شده است!");
      return;
    }

    users.push({ name, email, password: pass });
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify({ name, email }));

    setUserUI();
    authPopup.classList.remove("active");
  });

  // =========================
  // ورود
  // =========================
  loginForm.addEventListener("submit", e => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const pass = document.getElementById("login-password").value;

    loginForm.querySelectorAll(".error-message").forEach(span => span.textContent = "");

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(u => u.email === email && u.password === pass);

    if (!user) {
      document.querySelector("#login-password").parentElement.nextElementSibling.textContent =
        "ایمیل یا رمز اشتباه است";
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify({
      name: user.name,
      email: user.email
    }));

    setUserUI();
    authPopup.classList.remove("active");
  });

  // =========================
  // وضعیت کاربر (نمایش نام / خروج با تایید)
  // =========================
  function setUserUI() {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (user) {
      loginLink.textContent = user.name + " | خروج";

      loginLink.onclick = (e) => {
        e.preventDefault();
        if (confirm("آیا مطمئن هستید می‌خواهید خارج شوید؟")) {
          localStorage.removeItem("currentUser");
          setUserUI();
        }
      };

    } else {
      loginLink.textContent = "ثبت‌نام | ورود";
      loginLink.onclick = openAuthPopup;
    }
  }

  // اجرای اولیه
  setUserUI();

});
