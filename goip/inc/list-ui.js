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
            var isFooter = (ids[i] === 'td02');
            var isZero = /(\b0\s+Channels|\bchoosed\s+0|\bselected\s+0)/i.test(t);
            var tr = rowOf(td);
            if (!tr) continue;
            if (isFooter) {
                if (tr.parentNode) tr.parentNode.removeChild(tr);
                continue;
            }
            tr.style.display = isZero ? 'none' : '';
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

    // --- Keep only these two actions in the top toolbar; drop the rest. ---
    var KEEP_LINKS = ['Add GoIP', 'Export'];
    var LABEL_MAP = {
        'Add GoIP': 'Add',
        'Export':   'Export'
    };
    function colorFor(label) {
        var l = label.toLowerCase();
        if (l.indexOf('add') !== -1) return ['#0a7d2a', '#075f1f'];        // green
        if (l.indexOf('export') !== -1) return ['#6b46c1', '#553aa0'];     // purple
        return ['#215DC6', '#1a4ba0'];                                     // default
    }

    function promoteNavLinks() {
        var navRow = null, navCells = document.querySelectorAll('td');
        for (var i = 0; i < navCells.length; i++) {
            var t = (navCells[i].textContent || '').trim();
            if (t === 'Navigation:' || /^Navigation\s*:?$/.test(t) || t === 'goip管理导航:') {
                navRow = rowOf(navCells[i]);
                break;
            }
        }
        if (!navRow) return;

        var links = navRow.querySelectorAll('a');
        var picked = [];
        for (var j = 0; j < links.length; j++) {
            var raw = (links[j].textContent || '').trim();
            if (!raw) continue;
            // Only keep whitelisted actions
            if (KEEP_LINKS.indexOf(raw) === -1) continue;
            picked.push({
                label: LABEL_MAP[raw] || raw,
                fullLabel: raw,
                href: links[j].getAttribute('href'),
                target: links[j].getAttribute('target') || 'main'
            });
        }
        if (navRow.parentNode) navRow.parentNode.removeChild(navRow);
        if (!picked.length) return;

        if (!document.getElementById('goip-toolbar-style')) {
            var st = document.createElement('style');
            st.id = 'goip-toolbar-style';
            st.appendChild(document.createTextNode(
                '#goip-toolbar{position:fixed;top:6px;right:80px;z-index:9000;display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end;max-width:calc(100vw - 100px);font:12px -apple-system,Segoe UI,sans-serif}' +
                '#goip-toolbar a{display:inline-flex;align-items:center;padding:5px 12px;color:#fff;border-radius:14px;text-decoration:none;font-weight:500;line-height:1;box-shadow:0 1px 3px rgba(0,0,0,.12);transition:background .15s,transform .05s,box-shadow .15s;white-space:nowrap;border:1px solid rgba(0,0,0,.08)}' +
                '#goip-toolbar a:hover{text-decoration:none;color:#fff;box-shadow:0 2px 5px rgba(0,0,0,.18)}' +
                '#goip-toolbar a:active{transform:translateY(1px)}' +
                '@media (max-width:720px){#goip-toolbar{right:50px;top:50px;max-width:calc(100vw - 12px)}}'
            ));
            document.head.appendChild(st);
        }
        var tb = document.getElementById('goip-toolbar');
        if (tb) tb.parentNode.removeChild(tb);
        tb = document.createElement('div');
        tb.id = 'goip-toolbar';
        for (var p = 0; p < picked.length; p++) {
            var c = colorFor(picked[p].label);
            var a = document.createElement('a');
            a.href = picked[p].href;
            a.target = picked[p].target;
            a.textContent = picked[p].label;
            a.title = picked[p].fullLabel;
            a.style.background = c[0];
            a.style.borderColor = c[1];
            a.addEventListener('mouseenter', (function(bg){ return function(){ this.style.background = bg; }; })(c[1]));
            a.addEventListener('mouseleave', (function(bg){ return function(){ this.style.background = bg; }; })(c[0]));
            tb.appendChild(a);
        }
        document.body.appendChild(tb);
    }

    // --- 4. Remove the vendor "Search Column / Search Type / Key" row entirely ---
    function hideSearchRow() {
        var cells = document.querySelectorAll('td');
        for (var i = 0; i < cells.length; i++) {
            var t = cells[i].textContent || '';
            if (t.indexOf('Search Column') !== -1 && t.indexOf('Search Type') !== -1) {
                var tr = rowOf(cells[i]);
                if (tr && tr.parentNode) tr.parentNode.removeChild(tr);
            }
        }
    }

    // --- Batch Operation: hide the inline "Batch Operation [select]" widget,
    //     replace with a floating "+" FAB at 10% from bottom/right that opens
    //     a popover menu of the operation options. ---
    function setupBatchFab() {
        var sel = document.getElementById('cmd');
        if (!sel || sel.tagName !== 'SELECT') return;
        // Find the wrapping row (tr) so we can hide the inline copy
        var row = rowOf(sel);
        // Hide everything inline that's purely the entry point. The sub-divs
        // (#input_ussd, #input_sms, #prov_div, etc.) stay in DOM because they're
        // shown via check_action()/toggle_div() after a value is picked.
        if (row) {
            // Tag for CSS targeting; keep in form, just visually collapsed
            row.classList.add('batch-row');
        }

        // Inject styles once
        if (!document.getElementById('goip-fab-style')) {
            var st = document.createElement('style');
            st.id = 'goip-fab-style';
            st.appendChild(document.createTextNode(
                '.batch-row { position:absolute; left:-99999px; height:0; overflow:hidden; }' +
                '.batch-row.show { position:fixed; left:auto; right:5%; bottom:calc(5% + 60px); height:auto; z-index:8500; background:#fff; border:1px solid #b7c8e8; border-radius:8px; padding:14px 18px; box-shadow:0 10px 30px rgba(0,0,0,.18); display:block; max-width:90vw; }' +
                '.batch-row.show td { display:block; padding:4px 0; }' +
                '#goip-fab { position:fixed; right:5%; bottom:5%; width:45px; height:45px; border-radius:50%; background:#215DC6; color:#fff; border:0; cursor:pointer; box-shadow:0 5px 14px rgba(33,93,198,.45); z-index:8900; display:flex; align-items:center; justify-content:center; padding:0; line-height:1; transition:transform .25s ease, background .15s, box-shadow .15s; }' +
                '#goip-fab:hover { background:#1a4ba0; box-shadow:0 7px 18px rgba(33,93,198,.55); }' +
                '#goip-fab:focus { outline:none; box-shadow:0 5px 14px rgba(33,93,198,.55), 0 0 0 3px rgba(66,142,255,.35); }' +
                '#goip-fab.open { transform:rotate(45deg); background:#c53030; }' +
                '#goip-fab .plus { display:block; width:24px; height:24px; position:relative; }' +
                '#goip-fab .plus::before, #goip-fab .plus::after { content:""; position:absolute; background:#fff; border-radius:1px; left:50%; top:50%; }' +
                '#goip-fab .plus::before { width:14px; height:2px; transform:translate(-50%,-50%); }' +
                '#goip-fab .plus::after { width:2px; height:14px; transform:translate(-50%,-50%); }' +
                '#goip-fab-menu { position:fixed; right:5%; bottom:calc(5% + 60px); z-index:8400; min-width:220px; max-width:80vw; max-height:60vh; overflow:auto; background:#fff; border:1px solid #b7c8e8; border-radius:8px; padding:6px; box-shadow:0 10px 30px rgba(0,0,0,.18); display:none; }' +
                '#goip-fab-menu.open { display:block; }' +
                '#goip-fab-menu .gm-item { display:block; padding:8px 12px; color:#1f2f46; text-decoration:none; border-radius:5px; font:13px/1.3 -apple-system,Segoe UI,sans-serif; cursor:pointer; border:0; background:transparent; width:100%; text-align:left; }' +
                '#goip-fab-menu .gm-item:hover { background:#eef5ff; color:#1a4ba0; }' +
                '#goip-fab-menu .gm-sep { height:1px; background:#eef3fb; margin:4px 0; }' +
                '#goip-fab-menu .gm-danger:hover { background:#fef2f2; color:#c53030; }' +
                '@media (max-width:720px){ #goip-fab{right:14px;bottom:14px;} #goip-fab-menu{right:14px;bottom:66px;} .batch-row.show{right:14px;bottom:66px;} }'
            ));
            document.head.appendChild(st);
        }

        // Build FAB + menu
        var fab = document.createElement('button');
        fab.id = 'goip-fab';
        fab.type = 'button';
        fab.title = 'Batch Operations';
        fab.innerHTML = '<span class="plus" aria-hidden="true"></span>';

        var menu = document.createElement('div');
        menu.id = 'goip-fab-menu';

        // Populate menu from the original <select id="cmd">'s options
        var opts = sel.options;
        for (var i = 0; i < opts.length; i++) {
            var o = opts[i];
            if (!o.value || o.value === 'none') continue;
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'gm-item';
            if (o.value === 'del') btn.className += ' gm-danger';
            btn.textContent = o.text || o.value;
            btn.dataset.val = o.value;
            btn.addEventListener('click', (function(val){
                return function(){
                    closeAll();
                    sel.value = val;
                    // If the original UI requires an inline editor (USSD/SMS/etc.), reveal it
                    if (typeof check_action === 'function') check_action(sel);
                    // If a sub-div is now visible, surface the batch row as a floating panel
                    var anySub = document.querySelectorAll('#input_ussd, #input_sms, #prov_div, #group_div, #sms_fwd_mail, #mail_addr, #sms_fwd_http, #http_addr');
                    var needsInline = false;
                    for (var k = 0; k < anySub.length; k++) {
                        if (anySub[k].style.display !== 'none') { needsInline = true; break; }
                    }
                    if (needsInline && row) row.classList.add('show');
                };
            })(o.value));
            menu.appendChild(btn);
        }

        function closeAll() {
            fab.classList.remove('open');
            menu.classList.remove('open');
            if (row) row.classList.remove('show');
        }

        fab.addEventListener('click', function(){
            var isOpen = menu.classList.toggle('open');
            fab.classList.toggle('open', isOpen);
            if (!isOpen && row) row.classList.remove('show');
        });

        document.addEventListener('click', function(e){
            if (e.target === fab || fab.contains(e.target)) return;
            if (menu.contains(e.target)) return;
            if (row && (row === e.target || row.contains(e.target))) return;
            closeAll();
        });
        document.addEventListener('keydown', function(e){
            if (e.key === 'Escape') closeAll();
        });

        document.body.appendChild(menu);
        document.body.appendChild(fab);
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
        promoteNavLinks();
        hideSearchRow();
        addEmptyState();
        stylePagination();
        styleChecks();
        setupBatchFab();
    });
})();
