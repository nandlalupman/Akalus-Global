# Akalus Global Website - Complete Architecture & Context

**This file ensures that AI Agents can instantly understand the project without re-analyzing the entire codebase.**

## Project Overview
- **Name:** AKALUs Global
- **Type:** Static Landing Page with Admin Dashboard
- **Tech Stack:** Vanilla HTML, CSS, JavaScript (No frameworks)
- **Styling:** Custom CSS (styles.css) with modern glassmorphism, flex/grid layouts.
- **Animations:** GreenSock (GSAP) and ScrollTrigger used in `script.js` for professional fade-ins, parallax, and scroll animations.

## File Structure & Purpose
1. **`index.html`**
   - The main landing page.
   - Sections: Hero (Video background), Who We Help, Our Promise, Personalized Journey, Comparison, Organizations, Testimonials, Footer.
   - Includes Auth Modal logic and GSAP CDN links.
2. **`admin.html`**
   - A newly added Admin Dashboard for managing users and inquiries.
   - Currently uses mock data, protected via Firebase Auth state.
3. **`styles.css`**
   - Core stylesheet (over 1900 lines). Contains responsive breakpoints, typography, and utility classes for animations and modals.
4. **`script.js`**
   - Handles DOM manipulation, IntersectionObserver, mobile menu toggle, smooth scrolling, and GSAP ScrollTrigger animations.
   - Handles opening/closing of the Auth Modal.
5. **`firebase-config.js`**
   - Contains Firebase initialization and exports auth/db modules. Currently uses placeholder keys until real ones are provided.

## Authentication & Database Strategy
- **Service:** Firebase (via CDN)
- **Current State:** Setup with placeholders. The UI uses mock `setTimeout` responses for demonstration.
- **Next Steps (User action required):**
  - Replace `YOUR_API_KEY` etc., in `firebase-config.js` with actual Firebase project credentials.
  - Uncomment the window redirection in `admin.html` to fully protect the route.

## Recent Updates
- Added Firebase configuration placeholders.
- Added a full Auth Modal (Sign In / Sign Up) in `index.html`.
- Added GSAP animations to `script.js`.
- Created an `admin.html` dashboard.
- Set up `.agents/AGENTS.md` for global agent context.
