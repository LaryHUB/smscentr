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

    // --- 2. Empty state: when there are no real data rows, hide column headers
    //        + checkbox toolbar and replace with a single centered placeholder ---
    function isControlRow(tr) {
        // Rows that contain only navigation links, checkbox toolbars, or form fields are not data
        var hasCheckboxAll = tr.querySelector('input[type="checkbox"]#chkAll, input[type="checkbox"]#chkAll0');
        if (hasCheckboxAll) return true;
        var t = (tr.textContent || '').replace(/\s+/g, ' ').trim();
        if (/(Choose current page|Choose all|Now (choosed|selected) \d+ Channels)/i.test(t)) return true;
        // Navigation row in goip.php
        if (/Navigation\s*:|Refresh\s*\|\s*GoIP List|GSM LOGOUT Long Time/.test(t)) return true;
        return false;
    }

    function isDataRow(tr) {
        var cls = tr.className || '';
        if (cls.indexOf('title') !== -1) return false;     // header
        if (cls.indexOf('topbg') !== -1) return false;     // status bar
        if (isControlRow(tr)) return false;
        // Must be a tdbg/even row with at least one visible cell of content
        if (cls.indexOf('tdbg') === -1 && cls.indexOf('even') === -1) return false;
        return (tr.textContent || '').trim().length > 0;
    }

    function addEmptyState() {
        var tables = document.querySelectorAll('table.border');
        var best = null, bestRows = 0;
        for (var i = 0; i < tables.length; i++) {
            var rows = tables[i].rows ? tables[i].rows.length : 0;
            if (rows > bestRows) { bestRows = rows; best = tables[i]; }
        }
        if (!best) return;

        var dataRows = 0, headerRows = [], lastHeaderRow = null;
        for (var k = 0; k < best.rows.length; k++) {
            var r = best.rows[k];
            var cls = r.className || '';
            if (cls.indexOf('title') !== -1) { headerRows.push(r); lastHeaderRow = r; continue; }
            if (isDataRow(r)) dataRows++;
        }
        if (dataRows > 0 || !lastHeaderRow) return;

        // Hide header(s) — useless without data
        for (var h = 0; h < headerRows.length; h++) headerRows[h].style.display = 'none';
        // Hide checkbox toolbar rows just below
        for (var m = 0; m < best.rows.length; m++) {
            if (isControlRow(best.rows[m]) && best.rows[m].querySelector('input[type="checkbox"]')) {
                best.rows[m].style.display = 'none';
            }
        }
        // Add big empty state row
        var span = lastHeaderRow.cells.length;
        var tr = document.createElement('tr');
        tr.className = 'empty-row';
        tr.innerHTML = '<td colspan="' + span + '" class="empty-state">' +
            '<div class="empty-icon">&#9744;</div>' +
            '<div class="empty-text">No GoIP devices yet</div>' +
            '<div class="empty-hint">Devices will appear here once they register. Use <b>Add GoIP</b> above to provision one manually.</div>' +
            '</td>';
        var insertAfter = lastHeaderRow.nextSibling;
        if (insertAfter) lastHeaderRow.parentNode.insertBefore(tr, insertAfter);
        else lastHeaderRow.parentNode.appendChild(tr);
    }

    // --- 3. Hide "Now choosed/selected N Channels" status bars while N==0,
    //        show them when user actually picks something, dedupe footer copy ---
    function rowOf(el) { while (el && el.tagName !== 'TR') el = el.parentNode; return el; }

    function setStatusBarsVisibility() {
        var ids = ['td01', 'td02'];
        for (var i = 0; i < ids.length; i++) {
            var td = document.getElementById(ids[i]);
            if (!td) continue;
            var t = (td.textContent || '').trim();
            // Hide on the duplicate footer always; hide top bar when count is 0
            var isFooter = (ids[i] === 'td02');
            var isZero = /(\b0\s+Channels|\bchoosed\s+0|\bselected\s+0)/i.test(t);
            var tr = rowOf(td);
            if (!tr) continue;
            if (isFooter) {
                tr.style.display = 'none';
            } else {
                tr.style.display = isZero ? 'none' : '';
            }
        }
    }

    function watchStatusBars() {
        var td01 = document.getElementById('td01');
        if (!td01) return;
        // Re-evaluate when text changes (CheckAll/trclick updates innerText)
        var mo = new MutationObserver(setStatusBarsVisibility);
        mo.observe(td01, { childList: true, subtree: true, characterData: true });
        // Also re-check on any checkbox change in the form
        document.addEventListener('change', function(e){
            if (e.target && e.target.type === 'checkbox') setStatusBarsVisibility();
        });
    }

    function dedupStatusBars() {
        setStatusBarsVisibility();
        watchStatusBars();
    }

    // --- 4. Hide the vendor "Search Column / Search Type / Key" row entirely ---
    function hideSearchRow() {
        var cells = document.querySelectorAll('td');
        for (var i = 0; i < cells.length; i++) {
            var t = cells[i].textContent || '';
            if (t.indexOf('Search Column') !== -1 && t.indexOf('Search Type') !== -1) {
                var tr = rowOf(cells[i]);
                if (tr) tr.style.display = 'none';
            }
        }
    }

    // --- 5. Make 'Choose current page' / 'Choose all' look like a compact toolbar ---
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
        hideSearchRow();
        addEmptyState();
        stylePagination();
        styleChecks();
    });
})();
