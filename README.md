# Bean & Brew — Coffee Shop Website

<<<<<<< HEAD
## Project Topic

Bean & Brew is a responsive multi-page coffee shop website.

## Group Members

- Yerkezhan Vassenzhan
- Suleimen Khanzere
- Aikyn Sabit
## LINK OF THE PAGE: https://khanziik.github.io/webmidcoffee/
## Description

Bean & Brew is a modern coffee shop website where users can view the coffee menu, learn about the coffee shop, see the gallery and contact the coffee shop.
=======
Bean & Brew is a responsive multi-page coffee shop website. The project keeps the original coffee shop concept and extends the existing HTML, CSS, JavaScript and jQuery implementation for the Web Final Project.
>>>>>>> 657d4c2 (Update Bean & Brew final project)

## Pages

- `index.html` — home page
- `about.html` — coffee shop story and team
- `menu.html` — drinks, desserts, menu search and category filters, menu manager, and Open Food Facts product search
- `gallery.html` — photo gallery with an image lightbox
- `contact.html` — contact details, validated demo forms, and FAQ

All five pages share the same navigation, theme controls, sign-in dialog, footer and visual design.

## Implemented features

### HTML and CSS
- HTML5 document structure and semantic page sections
- External stylesheets: `style.css` and `endterm.css`
- Responsive layouts using Flexbox, Grid and Bootstrap utility classes
- Shared navigation and local image assets

### JavaScript
- Light/Dark theme toggle saved in `localStorage` and restored on every page
- Demo sign-in form with name, email and password validation
- Non-sensitive sign-in state (name and email only) stored in `localStorage`
- Sign-out clears the saved sign-in state
- Existing menu manager supports adding, editing and deleting menu entries in `localStorage`
- Existing gallery lightbox supports next/previous image navigation

The sign-in is a front-end demonstration only. It does not create real accounts, authenticate against a server, or provide production security. Passwords are not stored.

### jQuery
- Five coffee-shop FAQ entries on the Contact page
- FAQ answers open and close with jQuery `.slideToggle()`
- The plus/minus indicator and `aria-expanded` state update with the animation

### Public API
- Open Food Facts public product database
- JavaScript `fetch()` requests the legacy full-text search endpoint and processes JSON
- Search results are rendered dynamically with product name, brand, quantity, category and image when available
- Search button and Enter key trigger a new search
- Empty input, empty results, HTTP errors and network errors are handled

API documentation: https://openfoodfacts.github.io/openfoodfacts-server/api/

Open Food Facts applies rate limits to search requests. Avoid repeated rapid searches. The live API must be checked again from the deployed GitHub Pages website before submission.

## Run locally

Use a local web server rather than opening the HTML files directly:

1. Install Python 3 if it is not already installed.
2. Open a terminal in the project folder.
3. Run:

   ```bash
   python3 -m http.server 8000
   ```

4. Open `http://localhost:8000` in your browser.

## Publish with GitHub Pages

1. Create or open the group's GitHub repository.
2. Upload the project contents. Keep `index.html` in the repository root.
3. Commit and push all changes before the LMS deadline.
4. In GitHub, open **Settings → Pages**.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Select the `main` branch and `/ (root)` folder, then save.
7. Wait for the deployment to finish and open the published URL.
8. Test all five pages, theme persistence, sign-in persistence, FAQ, menu filters, gallery and API search on the deployed website.
9. Submit both the repository URL and deployed website URL individually to LMS.

## Before submission

- Replace the group-member and contribution placeholders in the report with the actual information.
- Add genuine screenshots of the deployed pages and working features to the report.
- Add the final GitHub repository URL and deployed GitHub Pages URL to the report and LMS.
- Confirm that the API search succeeds on the deployed site.
- Ensure the commit history reflects the group's actual work and all commits are before the deadline.
- Each group member must submit their own LMS entry.

## AI acknowledgement

AI tools were used as supporting tools for code review, implementation assistance and documentation. This acknowledgement must remain visible on the website and in the report, in accordance with the course AI usage policy. The group should accurately describe the assistance used.
