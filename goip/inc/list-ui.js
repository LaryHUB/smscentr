// Cosmetic polish for legacy GoIP list pages:
//  * collapses duplicate "Now choosed N Channels" footer bar (td02)
//  * styles pagination text as proper buttons
//  * adds an empty-state placeholder when no data rows
//  * wraps the search form into a single tidy row
//  * fixes "Choose current page" / "Choose all" controls placement
(function(){
    function ready(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }

    function isEmpty(s) { return !s || !s.replace(/\s+/g, ''); }

    // --- 1. Pagination buttons ---
    // Vendor outputs:  Total 0 row(s)  index  backward  forward  end  pages: 1/0page  30row(s)/page  goto: [select]
    function stylePagination() {
        var bodyText = document.body.innerHTML;
        if (bodyText.indexOf('row(s)') === -1) return;
        // Find all elements containing "row(s)" pagination block
        var all = document.querySelectorAll('td, div, p');
        for (var i = 0; i < all.length; i++) {
            var el = all[i];
            var t = el.textContent || '';
            if (t.indexOf('row(s)') === -1 || t.indexOf('page') === -1) continue;
            if (el.children.length > 4) continue; // skip wrappers
            if (el.dataset.paginated) continue;
            // Locate "index backward forward end" links/spans within this cell
            var links = el.querySelectorAll('a, span.spanpage');
            for (var j = 0; j < links.length; j++) {
                var l = links[j];
                var txt = (l.textContent || '').trim().toLowerCase();
                if (txt === 'index' || txt === 'backward' || txt === 'forward' || txt === 'end' || txt === 'next' || txt === 'prev' || txt === 'first' || txt === 'last') {
                    l.classList.add('pg-btn');
                }
            }
            el.dataset.paginated = '1';
            el.classList.add('pg-wrap');
        }
    }

    // --- 2. Empty state ---
    function addEmptyState() {
        // Find the largest .border table (the data list)
        var tables = document.querySelectorAll('table.border');
        var best = null, bestRows = 0;
        for (var i = 0; i < tables.length; i++) {
            var rows = tables[i].rows.length;
            if (rows > bestRows) { bestRows = rows; best = tables[i]; }
        }
        if (!best) return;

        // Detect "data rows" — rows with class tdbg or even, but NOT title/topbg
        var dataRows = 0, lastHeaderRow = null, hasHeader = false;
        for (var k = 0; k < best.rows.length; k++) {
            var cls = best.rows[k].className || '';
            if (cls.indexOf('title') !== -1) { hasHeader = true; lastHeaderRow = best.rows[k]; }
            else if ((cls.indexOf('tdbg') !== -1 || cls.indexOf('even') !== -1) && !best.rows[k].querySelector('input,select,button,textarea')) {
                dataRows++;
            }
        }
        if (dataRows > 0) return;
        if (!hasHeader) return;
        // Insert empty placeholder row after the header
        var span = lastHeaderRow ? lastHeaderRow.cells.length : 8;
        var tr = document.createElement('tr');
        tr.className = 'tdbg empty-row';
        tr.innerHTML = '<td colspan="' + span + '" class="empty-state">' +
            '<div class="empty-icon">&#9744;</div>' +
            '<div class="empty-text">No data yet</div>' +
            '<div class="empty-hint">Rows will appear here automatically when devices come online.</div></td>';
        var insertAfter = lastHeaderRow.nextSibling;
        if (insertAfter) lastHeaderRow.parentNode.insertBefore(tr, insertAfter);
        else lastHeaderRow.parentNode.appendChild(tr);
    }

    // --- 3. Deduplicate footer "Now choosed N Channels" status bar ---
    function dedupStatusBars() {
        var td01 = document.getElementById('td01');
        var td02 = document.getElementById('td02');
        if (td01 && td02) {
            // Keep td01 only — hide td02 row
            var row = td02;
            while (row && row.tagName !== 'TR') row = row.parentNode;
            if (row) row.style.display = 'none';
        }
    }

    // --- 4. Make 'Choose current page' / 'Choose all' look like a compact toolbar ---
    function styleChecks() {
        var labels = document.querySelectorAll('label, td');
        for (var i = 0; i < labels.length; i++) {
            var t = labels[i].textContent || '';
            if (t.indexOf('Choose current page') !== -1 || t.indexOf('Choose all') !== -1) {
                labels[i].classList.add('choose-toolbar');
            }
        }
    }

    ready(function(){
        dedupStatusBars();
        addEmptyState();
        stylePagination();
        styleChecks();
    });
})();
