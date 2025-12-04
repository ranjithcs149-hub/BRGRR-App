// ---------- DATA ----------

const BUNS = {
  classic: { label: "Classic", price: 30 },
  sesame: { label: "Sesame", price: 35 },
  glutenFree: { label: "Gluten-Free", price: 40 }
};

const TOPPINGS = [
  { id: "cheese", label: "Cheese", price: 20 },
  { id: "bacon", label: "Bacon", price: 30 },
  { id: "lettuce", label: "Lettuce", price: 10 },
  { id: "tomato", label: "Tomato", price: 10 },
  { id: "onions", label: "Caramelized Onions", price: 15 },
  { id: "jalapeno", label: "Jalapeños", price: 15 },
  { id: "mushroom", label: "Mushrooms", price: 20 },
  { id: "sauce", label: "Special Sauce", price: 10 }
];

const TAX_RATE = 0.05;
const STORAGE_KEYS = {
  favorites: "brgrr_favorites",
  user: "brgrr_user",
  history: "brgrr_order_history"
};

// ---------- STATE ----------

let currentBurger = {
  bun: null, // key in BUNS
  toppings: new Set() // store topping ids
};

let priceState = {
  subtotal: 0,
  tax: 0,
  total: 0
};

// ---------- HELPERS: STORAGE ----------

function safeParse(json, fallback) {
  try {
    return JSON.parse(json) ?? fallback;
  } catch {
    return fallback;
  }
}

function getFavorites() {
  const raw = localStorage.getItem(STORAGE_KEYS.favorites);
  return safeParse(raw, []);
}

function setFavorites(favs) {
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favs));
}

function getUser() {
  const raw = sessionStorage.getItem(STORAGE_KEYS.user);
  return safeParse(raw, null);
}

function setUser(username) {
  if (username) {
    sessionStorage.setItem(STORAGE_KEYS.user, JSON.stringify({ username }));
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.user);
  }
}

function getHistory() {
  const raw = sessionStorage.getItem(STORAGE_KEYS.history);
  return safeParse(raw, []);
}

function setHistory(history) {
  sessionStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
}

// ---------- HELPERS: PRICE ----------

function calculatePrice(burger) {
  let subtotal = 0;

  if (burger.bun && BUNS[burger.bun]) {
    subtotal += BUNS[burger.bun].price;
  }

  burger.toppings.forEach((id) => {
    const topping = TOPPINGS.find((t) => t.id === id);
    if (topping) subtotal += topping.price;
  });

  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  return { subtotal, tax, total };
}

function formatRupees(amount) {
  return `₹${amount}`;
}

// ---------- UI: DOM REFERENCES ----------

const bunErrorEl = document.getElementById("bun-error");
const toppingsListEl = document.getElementById("toppings-list");
const previewToppingsEl = document.getElementById("preview-toppings");
const subtotalEl = document.getElementById("subtotal-amount");
const taxEl = document.getElementById("tax-amount");
const totalEl = document.getElementById("total-amount");
const saveFavoriteBtn = document.getElementById("save-favorite-btn");
const checkoutBtn = document.getElementById("checkout-btn");
const favoritesListEl = document.getElementById("favorites-list");
const orderHistoryEl = document.getElementById("order-history");
const checkoutOverlayEl = document.getElementById("checkout-overlay");
const summaryBunEl = document.getElementById("summary-bun");
const summaryToppingsEl = document.getElementById("summary-toppings");
const summarySubtotalEl = document.getElementById("summary-subtotal");
const summaryTaxEl = document.getElementById("summary-tax");
const summaryTotalEl = document.getElementById("summary-total");
const checkoutMessageEl = document.getElementById("checkout-message");
const confirmOrderBtn = document.getElementById("confirm-order-btn");
const cancelCheckoutBtn = document.getElementById("cancel-checkout-btn");
const yearEl = document.getElementById("year");

const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const greetingEl = document.getElementById("greeting");

// ---------- INIT ----------

document.addEventListener("DOMContentLoaded", () => {
  renderToppingsOptions();
  attachEventListeners();
  restoreSession();
  updatePriceAndUI();
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// ---------- RENDER FUNCTIONS ----------

function renderToppingsOptions() {
  toppingsListEl.innerHTML = "";
  TOPPINGS.forEach((topping) => {
    const label = document.createElement("label");
    label.className = "topping-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = topping.id;
    checkbox.dataset.toppingId = topping.id;

    const textNode = document.createElement("span");
    textNode.textContent = `${topping.label} (${formatRupees(topping.price)})`;

    label.appendChild(checkbox);
    label.appendChild(textNode);
    toppingsListEl.appendChild(label);
  });
}

function renderBurgerPreview() {
  previewToppingsEl.innerHTML = "";
  currentBurger.toppings.forEach((id) => {
    const topping = TOPPINGS.find((t) => t.id === id);
    if (!topping) return;
    const li = document.createElement("li");
    li.className = "preview-layer";
    li.textContent = topping.label;
    previewToppingsEl.appendChild(li);
  });
}

function renderFavorites() {
  const favorites = getFavorites();
  favoritesListEl.innerHTML = "";

  if (!favorites.length) {
    const li = document.createElement("li");
    li.className = "item-sub";
    li.textContent = "No favorites yet. Save your first combo!";
    favoritesListEl.appendChild(li);
    return;
  }

  favorites.forEach((fav, index) => {
    const li = document.createElement("li");
    li.className = "favorite-item fade-in";
    li.dataset.index = index;

    const meta = document.createElement("div");
    meta.className = "item-meta";

    const title = document.createElement("span");
    title.textContent = fav.name ?? `Favorite #${index + 1}`;

    const price = document.createElement("span");
    price.className = "price";
    price.textContent = formatRupees(fav.total);

    meta.appendChild(title);
    meta.appendChild(price);

    const sub = document.createElement("div");
    sub.className = "item-sub";
    const bunLabel = BUNS[fav.bun]?.label ?? "Unknown bun";
    const toppingsText = fav.toppings.length
      ? fav.toppings.map((id) => TOPPINGS.find((t) => t.id === id)?.label || id).join(", ")
      : "No toppings";

    sub.textContent = `${bunLabel} • ${toppingsText}`;

    li.appendChild(meta);
    li.appendChild(sub);

    li.addEventListener("click", () => applyFavorite(fav));

    favoritesListEl.appendChild(li);
  });
}

function renderHistory() {
  const history = getHistory();
  orderHistoryEl.innerHTML = "";

  if (!history.length) {
    const li = document.createElement("li");
    li.className = "item-sub";
    li.textContent = "No orders yet this session.";
    orderHistoryEl.appendChild(li);
    return;
  }

  history.forEach((order) => {
    const li = document.createElement("li");
    li.className = "history-item fade-in";

    const meta = document.createElement("div");
    meta.className = "item-meta";

    const title = document.createElement("span");
    const date = new Date(order.timestamp);
    title.textContent = `${order.username || "Guest"} – ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })}`;

    const price = document.createElement("span");
    price.className = "price";
    price.textContent = formatRupees(order.total);

    meta.appendChild(title);
    meta.appendChild(price);

    const sub = document.createElement("div");
    sub.className = "item-sub";
    const bunLabel = BUNS[order.bun]?.label ?? "Unknown bun";
    const toppingsText = order.toppings.length
      ? order.toppings.map((id) => TOPPINGS.find((t) => t.id === id)?.label || id).join(", ")
      : "No toppings";

    sub.textContent = `${bunLabel} • ${toppingsText}`;

    li.appendChild(meta);
    li.appendChild(sub);
    orderHistoryEl.appendChild(li);
  });
}

// ---------- LOGIN ----------

function restoreSession() {
  const user = getUser();
  if (user?.username) {
    usernameInput.value = user.username;
    setLoggedInState(user.username);
  } else {
    setLoggedOutState();
  }

  renderFavorites();
  renderHistory();
}

function setLoggedInState(username) {
  greetingEl.textContent = `Hi, ${username}!`;
  loginBtn.hidden = true;
  logoutBtn.hidden = false;
}

function setLoggedOutState() {
  greetingEl.textContent = "";
  loginBtn.hidden = false;
  logoutBtn.hidden = true;
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  if (!username) return;

  setUser(username);
  setLoggedInState(username);
});

logoutBtn.addEventListener("click", () => {
  setUser(null);
  setHistory([]); // clear session orders
  setLoggedOutState();
  renderHistory();
});

// ---------- EVENT LISTENERS ----------

function attachEventListeners() {
  // Bun change (radio buttons)
  document.querySelectorAll('input[name="bun"]').forEach((input) => {
    input.addEventListener("change", () => {
      currentBurger.bun = input.value;
      clearBunError();
      updatePriceAndUI();
    });
  });

  // Toppings checkboxes
  toppingsListEl.addEventListener("change", (e) => {
    const checkbox = e.target;
    if (!checkbox.matches('input[type="checkbox"][data-topping-id]')) return;

    const id = checkbox.dataset.toppingId;
    if (checkbox.checked) {
      currentBurger.toppings.add(id);
    } else {
      currentBurger.toppings.delete(id);
    }

    renderBurgerPreview();
    updatePriceAndUI();
  });

  // Save favorite
  saveFavoriteBtn.addEventListener("click", () => {
    if (!currentBurger.bun) {
      showBunError("Please choose a bun before saving a favorite.");
      return;
    }

    const { subtotal, tax, total } = priceState;

    const name = prompt("Name this favorite (optional):") || null; // allowed, not core UX
    const fav = {
      bun: currentBurger.bun,
      toppings: Array.from(currentBurger.toppings),
      subtotal,
      tax,
      total,
      name
    };

    const favorites = getFavorites();
    favorites.push(fav);
    setFavorites(favorites);
    renderFavorites();
  });

  // Checkout
  checkoutBtn.addEventListener("click", () => {
    if (!validateBurger()) return;
    openCheckout();
  });

  cancelCheckoutBtn.addEventListener("click", () => {
    closeCheckout();
  });

  confirmOrderBtn.addEventListener("click", () => {
    handleOrderConfirm();
  });
}

// ---------- VALIDATION ----------

function validateBurger() {
  let valid = true;

  if (!currentBurger.bun) {
    showBunError("Please choose a bun to continue.");
    valid = false;
  }

  return valid;
}

function showBunError(message) {
  bunErrorEl.textContent = message;
}

function clearBunError() {
  bunErrorEl.textContent = "";
}

// ---------- PRICE + UI STATE ----------

function updatePriceAndUI() {
  priceState = calculatePrice(currentBurger);

  subtotalEl.textContent = formatRupees(priceState.subtotal);
  taxEl.textContent = formatRupees(priceState.tax);
  totalEl.textContent = formatRupees(priceState.total);

  // Buttons: require bun
  const hasBun = !!currentBurger.bun;
  saveFavoriteBtn.disabled = !hasBun;
  checkoutBtn.disabled = !hasBun || priceState.total === 0;

  renderBurgerPreview();
}

// ---------- FAVORITES ----------

function applyFavorite(fav) {
  currentBurger.bun = fav.bun;
  currentBurger.toppings = new Set(fav.toppings);

  // update bun radios
  document.querySelectorAll('input[name="bun"]').forEach((input) => {
    input.checked = input.value === fav.bun;
  });

  // update topping checkboxes
  toppingsListEl.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    const id = checkbox.dataset.toppingId;
    checkbox.checked = currentBurger.toppings.has(id);
  });

  clearBunError();
  updatePriceAndUI();
}

// ---------- CHECKOUT FLOW ----------

function openCheckout() {
  // Fill summary
  const bunLabel = BUNS[currentBurger.bun]?.label ?? "Unknown bun";
  const toppingsText = currentBurger.toppings.size
    ? Array.from(currentBurger.toppings)
        .map((id) => TOPPINGS.find((t) => t.id === id)?.label || id)
        .join(", ")
    : "No toppings";

  const { subtotal, tax, total } = priceState;

  summaryBunEl.textContent = bunLabel;
  summaryToppingsEl.textContent = toppingsText;
  summarySubtotalEl.textContent = formatRupees(subtotal);
  summaryTaxEl.textContent = formatRupees(tax);
  summaryTotalEl.textContent = formatRupees(total);

  checkoutMessageEl.textContent = "";
  checkoutOverlayEl.classList.remove("hidden");
}

function closeCheckout() {
  checkoutOverlayEl.classList.add("hidden");
}

function handleOrderConfirm() {
  const user = getUser();
  const { subtotal, tax, total } = priceState;

  const history = getHistory();
  history.push({
    bun: currentBurger.bun,
    toppings: Array.from(currentBurger.toppings),
    subtotal,
    tax,
    total,
    username: user?.username ?? "Guest",
    timestamp: Date.now()
  });
  setHistory(history);
  renderHistory();

  checkoutMessageEl.textContent = "Order placed successfully! 🎉";
  // Micro delay before closing for nicer UX
  setTimeout(() => {
    closeCheckout();
  }, 700);
}
