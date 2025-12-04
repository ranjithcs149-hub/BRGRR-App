# BRGRR – Burger Builder App

A fully client-side burger customizer built with **vanilla HTML, CSS, and JavaScript**.  
Features live price calculation, favorites using `localStorage`, login simulation and order history using `sessionStorage`, and a checkout summary flow.

---

## Live Demo

- **Live deployment:** `https://your-brgrr-app.netlify.app/`
- **GitHub repository:** `https://github.com/ranjithcs149-hub/BRGRR-App`

> Replace the above URLs with your actual Netlify / Vercel / GitHub Pages links.

---

## Features (Mapped to Parts I–V)

- **Part I – Core Builder**
  - Interactive burger customizer (bun + dynamic toppings)
  - Real-time burger preview (stacked bun + toppings)

- **Part II – Pricing**
  - Centralized price calculation function
  - Live subtotal, tax (5%), and total
  - Checkout summary shows full breakdown

- **Part III – Validation & UX**
  - Required bun selection with real-time validation message
  - Clear error feedback and actionable messages
  - Conditional button states (disabled until valid)

- **Part IV – Storage**
  - Favorites saved in `localStorage` (persist across sessions)
  - Click a favorite to rebuild that burger and auto-update price
  - Login simulation using `sessionStorage`
  - Order history stored per session (clears when session ends)

- **Part V – Polish & Responsiveness**
  - Fully responsive layout (mobile / tablet / desktop)
  - Micro-interactions on buttons (scale, shadow)
  - Smooth fade-in animations for new items
  - Accessible semantics, `aria-live` feedback

---

## How to Run Locally

1. Clone the repo:

   ```bash
   git clone https://github.com/your-username/BRGRR-App.git
   cd BRGRR-App
