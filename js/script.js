/* Bean & Brew — client-side endterm features. */
$(function () {
    const byId = id => document.getElementById(id);
    const categories = ['Coffee', 'Desserts'];

    function bindValidation(form) {
        const fields = Array.from(form.querySelectorAll('[required]'));
        const password = form.querySelector('#reg-password');
        const confirmation = form.querySelector('#reg-confirmation');
        const summary = document.createElement('p');
        summary.className = 'form-summary';
        summary.setAttribute('role', 'status');
        form.append(summary);
        form.noValidate = true;
        form.querySelector('[type="submit"]').disabled = false;

        function strength() {
            const value = password.value;
            const missing = [];
            if (value.trim().length < 8) missing.push('at least 8 characters');
            if (!/[a-z]/.test(value)) missing.push('a lowercase letter');
            if (!/[A-Z]/.test(value)) missing.push('an uppercase letter');
            if (!/\d/.test(value)) missing.push('a number');
            if (!/[^\w\s]|_/.test(value)) missing.push('a symbol');
            const score = !value.trim() ? 0 : value.trim().length < 8 ? 1 :
                missing.length === 0 ? 3 : missing.length <= 2 ? 2 : 1;
            byId('strength').value = score;
            const label = ['Password strength', 'Weak', 'Medium', 'Strong'][score];
            byId('strength-hint').textContent = missing.length ?
                label + '. Include ' + missing.join(', ') + '.' : label + ' password.';
        }

        function check(field) {
            let error = '';
            if (!field.value.trim()) {
                error = 'Enter ' + field.labels[0].textContent.trim().toLowerCase() + '.';
            } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
                error = 'Use an email address such as name@example.com.';
            } else if (field === password && field.value.trim().length < 8) {
                error = 'Use at least 8 characters.';
            } else if (field === confirmation && field.value !== password.value) {
                error = 'Enter the same password in both fields.';
            }
            byId(field.id + '-feedback').textContent = error || 'Looks good.';
            field.setAttribute('aria-invalid', String(Boolean(error)));
            return !error;
        }

        fields.forEach(field => {
            const note = document.createElement('small');
            note.id = field.id + '-feedback';
            note.className = 'field-note';
            note.setAttribute('aria-live', 'polite');
            field.after(note);
            field.setAttribute('aria-describedby', note.id + (field === password ? ' strength-hint' : ''));
            field.addEventListener('input', () => {
                summary.textContent = '';
                check(field);
                if (field === password) {
                    strength();
                    if (confirmation.value || confirmation.hasAttribute('aria-invalid')) check(confirmation);
                }
            });
            field.addEventListener('blur', () => check(field));
        });

        form.addEventListener('submit', event => {
            event.preventDefault();
            if (password) strength();
            const invalid = fields.filter(field => !check(field));
            if (invalid.length) {
                summary.textContent = 'Please check ' + invalid.map(field => field.labels[0].textContent.trim()).join(', ') + '.';
                invalid[0].focus();
            } else {
                summary.textContent = password ? 'Registration details passed the local check. No account was created.' :
                    'Your message passed the local check. It has not been sent.';
            }
        });
    }

    function initMenu() {
        const drinks = Array.from(document.querySelectorAll('.coffee-table:not(#manager-table) tbody tr'));
        const desserts = Array.from(document.querySelectorAll('.menu-cards-section .coffee-card'));
        const items = [
            ...drinks.map(node => ({node, category: 'Coffee'})),
            ...desserts.map(card => ({node: card.parentElement, category: 'Desserts'}))
        ];
        const clean = text => text.trim().replace(/\s+/g, ' ').toLowerCase();
        items.forEach(item => { item.searchText = clean(item.node.textContent); });
        let category = 'All';

        function filterMenu() {
            const query = clean(byId('menu-search').value);
            let count = 0;
            items.forEach(item => {
                const show = (category === 'All' || category === item.category) && item.searchText.includes(query);
                item.node.hidden = !show;
                if (show) count++;
            });
            byId('match-count').textContent = count ? count + (count === 1 ? ' item found.' : ' items found.') :
                'No items found. Try another search or category.';
        }
        $('#menu-search').on('input', filterMenu);
        $('.filter-buttons button').on('click', function () {
            category = this.textContent;
            $('.filter-buttons button').attr('aria-pressed', 'false');
            this.setAttribute('aria-pressed', 'true');
            filterMenu();
        });
        filterMenu();

        const seed = [];
        const priceOf = cell => Number(cell.textContent.replace(/[, ]|KZT/g, '').trim());
        drinks.forEach(row => {
            const headings = row.closest('table').tHead.rows[0].cells;
            Array.from(row.cells).slice(1).forEach((cell, index) => {
                const name = row.cells[0].textContent + ' (' + headings[index + 1].textContent + ')';
                seed.push({id: 'base-' + seed.length, name, category: 'Coffee', price: priceOf(cell)});
            });
        });
        desserts.forEach(card => {
            seed.push({id: 'base-' + seed.length, name: card.querySelector('h3').textContent,
                category: 'Desserts', price: priceOf(card.querySelector('.price'))});
        });
        initManager(seed);
    }

    function initManager(seed) {
        const key = 'bean-brew.menu.v1';
        const tbody = byId('manager-table').tBodies[0];
        const dialog = byId('item-dialog');
        const form = byId('item-form');
        const name = byId('item-name');
        const category = byId('item-category');
        const price = byId('item-price');
        const status = byId('manager-status');
        const storageStatus = byId('storage-status');
        let records = seed;
        let editing = null;
        let memoryOnly = false;

        function unavailable() {
            memoryOnly = true;
            storageStatus.textContent = 'Browser storage is unavailable. Changes will last until you leave this page.';
        }

        function read() {
            if (memoryOnly) return;
            let raw;
            try {
                raw = localStorage.getItem(key);
            } catch {
                unavailable();
                return;
            }
            if (raw === null) {
                records = seed;
                return;
            }
            try {
                const saved = JSON.parse(raw);
                const valid = Array.isArray(saved) && saved.every(item => item &&
                    typeof item.id === 'string' && item.id.length && typeof item.name === 'string' &&
                    item.name.trim() && categories.includes(item.category) && Number.isFinite(item.price) && item.price > 0);
                if (!valid || new Set(saved.map(item => item.id)).size !== saved.length) throw new Error();
                records = saved;
                storageStatus.textContent = '';
            } catch {
                records = seed;
                storageStatus.textContent = 'Saved menu data could not be read. The original items are displayed.';
            }
        }

        function render() {
            tbody.replaceChildren();
            records.forEach(item => {
                const row = tbody.insertRow();
                [item.name, item.category, item.price.toLocaleString('en-US', {maximumFractionDigits: 2})]
                    .forEach(value => { row.insertCell().textContent = value; });
                const actions = row.insertCell();
                for (const action of ['Edit', 'Delete']) {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'plain-btn';
                    button.textContent = action;
                    button.setAttribute('aria-label', action + ' ' + item.name);
                    button.addEventListener('click', () => {
                        if (action === 'Edit') openEditor(item);
                        else if (window.confirm('Delete ' + item.name + ' from your menu?')) change(item, null);
                    });
                    actions.append(button);
                }
            });
            if (!records.length) {
                const cell = tbody.insertRow().insertCell();
                cell.colSpan = 4;
                cell.textContent = 'Your menu is empty. Choose Add item to start.';
            }
        }

        function change(previous, next) {
            function commit() {
                read();
                if (previous) {
                    const current = records.find(item => item.id === previous.id);
                    if (!current || current.name !== previous.name || current.category !== previous.category || current.price !== previous.price) {
                        status.textContent = 'This item changed in another tab. Review the current list and try again.';
                        render();
                        return;
                    }
                    records = next ? records.map(item => item.id === previous.id ? next : item) :
                        records.filter(item => item.id !== previous.id);
                } else {
                    records = [...records, next];
                }
                if (!memoryOnly) {
                    try {
                        localStorage.setItem(key, JSON.stringify(records));
                        storageStatus.textContent = '';
                    } catch { unavailable(); }
                }
                render();
                const verb = !next ? ' deleted.' : previous ? ' updated.' : ' added.';
                status.textContent = (next || previous).name + verb;
            }
            if (navigator.locks) navigator.locks.request(key, commit).catch(() => {
                status.textContent = 'The menu could not be updated. Please try again.';
            });
            else commit();
        }

        function openEditor(item) {
            editing = item;
            form.reset();
            name.setCustomValidity('');
            byId('editor-heading').textContent = item ? 'Edit item' : 'Add item';
            if (item) {
                name.value = item.name;
                category.value = item.category;
                price.value = item.price;
            }
            dialog.showModal();
            name.focus();
        }
        byId('add-item').addEventListener('click', () => openEditor(null));
        byId('cancel-edit').addEventListener('click', () => dialog.close());
        name.addEventListener('input', () => name.setCustomValidity(''));
        form.addEventListener('submit', event => {
            event.preventDefault();
            name.setCustomValidity(name.value.trim() ? '' : 'Enter an item name.');
            if (!form.reportValidity()) return;
            const id = editing ? editing.id : Array.from(crypto.getRandomValues(new Uint32Array(4))).join('-');
            change(editing, {id, name: name.value.trim(), category: category.value, price: price.valueAsNumber});
            dialog.close();
            byId('add-item').focus();
        });
        window.addEventListener('storage', event => {
            if (event.key === key || event.key === null) { read(); render(); }
        });
        read();
        render();
    }

    function initGallery(dialog) {
        const tiles = Array.from(document.querySelectorAll('.gallery-item'));
        const panel = $(dialog.querySelector('.photo-panel'));
        const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 160;
        let index = 0;
        let closing = false;

        function showPhoto(position) {
            index = (position + tiles.length) % tiles.length;
            const tile = tiles[index];
            const image = tile.querySelector('img');
            const caption = tile.querySelector('.gallery-caption').textContent.trim();
            byId('full-photo').src = image.src;
            byId('full-photo').alt = image.alt;
            byId('photo-caption').textContent = caption + ' · ' + (index + 1) + ' / ' + tiles.length;
        }
        function close() {
            if (closing) return;
            closing = true;
            panel.stop(true, true).fadeOut(duration, () => {
                dialog.close();
                closing = false;
            });
        }
        tiles.forEach((tile, position) => {
            tile.querySelector('button').addEventListener('click', () => {
                showPhoto(position);
                panel.hide();
                dialog.showModal();
                panel.fadeIn(duration);
                byId('close-photo').focus();
            });
        });
        byId('close-photo').addEventListener('click', close);
        byId('previous-photo').addEventListener('click', () => showPhoto(index - 1));
        byId('next-photo').addEventListener('click', () => showPhoto(index + 1));
        dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
        dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
        dialog.addEventListener('keydown', event => {
            if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
            event.preventDefault();
            showPhoto(index + (event.key === 'ArrowRight' ? 1 : -1));
        });
    }

    document.querySelectorAll('#contact, #registration').forEach(bindValidation);
    if (byId('menu-search')) initMenu();
    if (byId('lightbox')) initGallery(byId('lightbox'));
});
