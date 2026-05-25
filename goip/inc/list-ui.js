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

    function dedupStatusBars() {
        // Both vendor status bars ("Now choosed/selected N Channels") are unwanted.
        // Keep td01/td02 elements alive (vendor JS writes to them) but force their
        // rows to stay invisible no matter what text is set.
        ['td01', 'td02'].forEach(function(id){
            var td = document.getElementById(id);
            if (!td) return;
            var tr = rowOf(td);
            if (tr) tr.style.setProperty('display', 'none', 'important');
        });
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
                '#goip-fab-menu { position:fixed; right:5%; bottom:calc(5% + 60px); z-index:8400; min-width:175px; max-width:80vw; max-height:60vh; overflow:auto; background:#fff; border:1px solid #b7c8e8; border-radius:7px; padding:5px; box-shadow:0 8px 24px rgba(0,0,0,.18); display:none; }' +
                '#goip-fab-menu.open { display:block; }' +
                '#goip-fab-menu .gm-item { display:block; padding:6px 10px; color:#1f2f46; text-decoration:none; border-radius:4px; font:11px/1.2 -apple-system,Segoe UI,sans-serif; cursor:pointer; border:0; background:transparent; width:100%; text-align:left; }' +
                '#goip-fab-menu .gm-item:hover { background:#eef5ff; color:#1a4ba0; }' +
                '#goip-fab-menu .gm-sep { height:1px; background:#eef3fb; margin:3px 0; }' +
                '#goip-fab-menu .gm-danger:hover { background:#fef2f2; color:#c53030; }' +
                '#goip-fab-menu .gm-primary { background:#0a7d2a; color:#fff; font-weight:600; margin-bottom:2px; }' +
                '#goip-fab-menu .gm-primary:hover { background:#075f1f; color:#fff; }' +
                '#goip-modal { position:fixed; inset:0; background:rgba(15,30,55,0.55); z-index:9500; display:none; align-items:center; justify-content:center; padding:16px; font:13px -apple-system,Segoe UI,sans-serif; color:#1f2f46; }' +
                '#goip-modal.open { display:flex; }' +
                '#goip-modal .modal-box { background:#fff; border-radius:10px; box-shadow:0 24px 60px rgba(0,0,0,.35); width:min(560px, 92vw); max-height:88vh; display:flex; flex-direction:column; overflow:hidden; }' +
                '#goip-modal .modal-head { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:linear-gradient(180deg,#2d6ad1,#215DC6); color:#fff; font:600 14px -apple-system,Segoe UI,sans-serif; }' +
                '#goip-modal .modal-close { background:transparent; border:0; color:#fff; font-size:22px; line-height:1; cursor:pointer; padding:0 4px; border-radius:4px; }' +
                '#goip-modal .modal-close:hover { background:rgba(255,255,255,.18); }' +
                '#goip-modal .modal-body { flex:1 1 auto; overflow:auto; padding:16px 18px; }' +
                '#goip-modal .modal-body .adf-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px 14px; }' +
                '#goip-modal .modal-body .adf-field { display:flex; flex-direction:column; gap:3px; font-size:12px; }' +
                '#goip-modal .modal-body .adf-field.adf-checkbox { flex-direction:row; align-items:center; gap:6px; padding-top:18px; }' +
                '#goip-modal .modal-body .adf-label { font-weight:500; color:#475569; }' +
                '#goip-modal .modal-body .adf-label em { color:#c53030; font-style:normal; }' +
                '#goip-modal .modal-body .adf-hint { font-size:11px; color:#8898ad; }' +
                '#goip-modal .modal-body input, #goip-modal .modal-body select { width:100%; padding:7px 9px; border:1px solid #d0dcef; border-radius:5px; font:13px -apple-system,Segoe UI,sans-serif; background:#fff; color:#1f2f46; box-sizing:border-box; transition:border-color .12s, box-shadow .12s; }' +
                '#goip-modal .modal-body input:focus, #goip-modal .modal-body select:focus { outline:none; border-color:#428EFF; box-shadow:0 0 0 3px rgba(66,142,255,.2); }' +
                '#goip-modal .modal-body input[type=checkbox] { width:auto; }' +
                '#goip-modal .modal-body details { margin-top:14px; border-top:1px solid #eef3fb; padding-top:10px; }' +
                '#goip-modal .modal-body summary { cursor:pointer; font-weight:500; color:#475569; padding:4px 0; user-select:none; }' +
                '#goip-modal .modal-body summary:hover { color:#215DC6; }' +
                '#goip-modal .modal-body details[open] summary { margin-bottom:8px; }' +
                '#goip-modal .modal-body .adf-error { background:#fef2f2; border:1px solid #fecaca; color:#c53030; padding:8px 12px; border-radius:5px; margin-top:12px; font-size:12px; }' +
                '#goip-modal .modal-foot { padding:12px 18px; border-top:1px solid #eef3fb; display:flex; justify-content:flex-end; gap:8px; background:#fafcff; }' +
                '#goip-modal .adf-btn { padding:7px 18px; border-radius:5px; font:500 13px -apple-system,Segoe UI,sans-serif; cursor:pointer; border:1px solid transparent; transition:background .12s, transform .05s; }' +
                '#goip-modal .adf-btn-primary { background:#0a7d2a; color:#fff; border-color:#075f1f; }' +
                '#goip-modal .adf-btn-primary:hover { background:#075f1f; }' +
                '#goip-modal .adf-btn-primary:disabled { background:#9ca3af; border-color:#6b7280; cursor:wait; }' +
                '#goip-modal .adf-btn-secondary { background:#fff; color:#475569; border-color:#d0dcef; }' +
                '#goip-modal .adf-btn-secondary:hover { background:#f1f5fb; }' +
                '#goip-modal .adf-loading { padding:30px; text-align:center; color:#8898ad; font-size:12px; }' +
                '@media (max-width:720px){ #goip-fab{right:14px;bottom:14px;} #goip-fab-menu{right:14px;bottom:66px;} .batch-row.show{right:14px;bottom:66px;} #goip-modal .modal-box{width:96vw;max-height:94vh;} }'
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

        // Pinned action at the top — opens Add GoIP form in an overlay (no nav away)
        var addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'gm-item gm-primary';
        addBtn.textContent = '+ Add device';
        addBtn.addEventListener('click', function(){
            closeAll();
            openAddDeviceModal();
        });
        menu.appendChild(addBtn);
        var sep = document.createElement('div');
        sep.className = 'gm-sep';
        menu.appendChild(sep);

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

    // Modal hosting a modernized custom Add Device form (no iframe, no page nav).
    function openAddDeviceModal() {
        var modal = document.getElementById('goip-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'goip-modal';
            modal.innerHTML =
                '<div class="modal-box">' +
                  '<div class="modal-head"><span>Add GoIP device</span>' +
                    '<button type="button" class="modal-close" aria-label="Close">&times;</button>' +
                  '</div>' +
                  '<div class="modal-body"><div class="adf-loading">Loading…</div></div>' +
                '</div>';
            document.body.appendChild(modal);
            modal.querySelector('.modal-close').addEventListener('click', closeAddDeviceModal);
            modal.addEventListener('click', function(e){ if (e.target === modal) closeAddDeviceModal(); });
            document.addEventListener('keydown', function(e){
                if (e.key === 'Escape' && modal.classList.contains('open')) closeAddDeviceModal();
            });
        }
        var body = modal.querySelector('.modal-body');
        body.innerHTML = '<div class="adf-loading">Loading…</div>';
        modal.classList.add('open');

        // Determine fragment path based on current location (root vs /en/)
        var prefix = location.pathname.replace(/[^/]*$/, '');
        var fragmentUrl = prefix.indexOf('/en/') !== -1 ? '../inc/add_device_form.php' : 'inc/add_device_form.php';

        fetch(fragmentUrl, { credentials: 'same-origin', cache: 'no-store' })
            .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
            .then(function(html){
                body.innerHTML = html;
                // Move action buttons into a sticky footer for nicer UX
                var form = body.querySelector('#add-device-form');
                if (!form) return;
                var actions = form.querySelector('.adf-actions');
                if (actions) {
                    var foot = document.createElement('div');
                    foot.className = 'modal-foot';
                    while (actions.firstChild) foot.appendChild(actions.firstChild);
                    actions.parentNode.removeChild(actions);
                    modal.querySelector('.modal-box').appendChild(foot);
                    foot.querySelector('[data-action="cancel"]').addEventListener('click', closeAddDeviceModal);
                    foot.querySelector('.adf-btn-primary').addEventListener('click', function(){ form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', {cancelable:true, bubbles:true})); });
                }
                bindAddDeviceForm(form, modal);
            })
            .catch(function(err){
                body.innerHTML = '<div class="adf-error" style="margin:14px">Failed to load form: ' + err.message + '</div>';
            });
    }
    function closeAddDeviceModal() {
        var modal = document.getElementById('goip-modal');
        if (modal) {
            modal.classList.remove('open');
            // Drop the dynamic foot bar so the next open rebuilds clean
            var foot = modal.querySelector('.modal-foot');
            if (foot) foot.parentNode.removeChild(foot);
        }
    }

    function bindAddDeviceForm(form, modal) {
        var err = form.querySelector('.adf-error');
        function showError(msg) {
            if (!err) return;
            err.innerHTML = msg;
            err.hidden = false;
        }
        function clearError() {
            if (!err) return;
            err.innerHTML = '';
            err.hidden = true;
        }
        form.addEventListener('submit', function(e){
            e.preventDefault();
            clearError();
            var pw = form.querySelector('[name="Password"]').value;
            var pw2 = form.querySelector('[name="PwdConfirm"]').value;
            if (pw !== pw2) { showError('Passwords do not match.'); return; }
            if (!form.querySelector('[name="name"]').value.trim()) { showError('Device ID is required.'); return; }
            if (!pw) { showError('Password is required.'); return; }

            var submitBtn = modal.querySelector('.adf-btn-primary');
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Adding…'; }

            var data = new FormData(form);
            // Vendor expects checkboxes as 'on'/'off' literal strings; ensure unset checkboxes still posted
            ['fwd_mail_enable', 'fwd_http_enable'].forEach(function(k){
                if (!data.has(k) || !data.get(k)) data.set(k, 'off');
                else data.set(k, 'on');
            });

            fetch(form.action, { method: 'POST', body: data, credentials: 'same-origin' })
                .then(function(r){ return r.text(); })
                .then(function(html){
                    // Vendor returns HTML pages: success contains "Add successfully", errors contain "<li>...</li>"
                    if (/Add successfully|Modify.*success/i.test(html)) {
                        closeAddDeviceModal();
                        location.reload();
                        return;
                    }
                    // Extract <li> error items if present
                    var matches = html.match(/<li>([^<]+)<\/li>/g);
                    if (matches && matches.length) {
                        showError(matches.map(function(m){ return m.replace(/<\/?li>/g, ''); }).join('<br>'));
                    } else {
                        showError('Server returned an unexpected response.');
                    }
                })
                .catch(function(e2){ showError('Network error: ' + e2.message); })
                .then(function(){
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Add device'; }
                });
        });
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

    // Decode UCS-2 (UTF-16BE) hex strings used by carriers in USSD/SMS responses.
    // Matches runs of >=8 hex chars whose length is a multiple of 4; replaces with text.
    function decodeUcs2(str) {
        if (!str || str.indexOf('0') === -1) return str;
        return str.replace(/[0-9A-Fa-f]{8,}/g, function(m){
            var rem = m.length % 4;
            var hex = rem ? m.substring(0, m.length - rem) : m;
            var tail = rem ? m.substring(m.length - rem) : '';
            var out = '';
            var ok = true;
            for (var i = 0; i < hex.length; i += 4) {
                var cp = parseInt(hex.substr(i, 4), 16);
                // Reject as UCS-2 if we hit a control char (other than \n) early —
                // likely just a long hex token (id, hash, etc.)
                if ((cp < 32 && cp !== 10 && cp !== 13 && cp !== 9) || cp > 0xFFFF) { ok = false; break; }
                out += String.fromCharCode(cp);
            }
            return ok ? out + tail : m;
        });
    }

    function decodeUcs2InTables() {
        var cells = document.querySelectorAll('td');
        for (var i = 0; i < cells.length; i++) {
            var td = cells[i];
            if (td.children.length > 0) continue;       // skip cells with markup
            if (td.dataset.ucs2Decoded === '1') continue;
            var t = td.textContent || '';
            if (t.length < 8) continue;
            // Only act if the cell looks like it contains a long hex run
            if (!/[0-9A-Fa-f]{8,}/.test(t)) continue;
            var decoded = decodeUcs2(t);
            if (decoded !== t) {
                td.textContent = decoded;
                td.dataset.ucs2Decoded = '1';
            }
        }
    }

    // Dim rows whose device has not registered with our server (Login = LOGOUT).
    function dimOfflineRows() {
        var rows = document.querySelectorAll('tr.tdbg, tr.even, tr.marked');
        for (var i = 0; i < rows.length; i++) {
            var cells = rows[i].cells;
            if (!cells || cells.length < 3) continue;
            // Skip if row contains form inputs (control row) or has no .gsm-status (not a device row)
            if (!rows[i].querySelector('.gsm-status') && !rows[i].querySelector('input[name^="Id"]')) continue;
            // The Login/alive column is the 3rd cell (index 2): checkbox | ID | Login | GSM | ...
            var loginCell = cells[2];
            if (!loginCell) continue;
            var v = (loginCell.textContent || '').trim().toUpperCase();
            if (v === 'LOGOUT' || v === '0' || v === '') {
                rows[i].classList.add('row-offline');
            } else {
                rows[i].classList.remove('row-offline');
            }
        }
    }

    // GSM column: show only the signal number, colour-graded red→green by
    // signal strength. LOGOUT / not-registered → "99" in red.
    // 99 is the GSM CSQ convention for "no service / unknown".
    var SIGNAL_MAX = 31;
    function colorizeSignals() {
        var rows = document.querySelectorAll('tr');
        for (var i = 0; i < rows.length; i++) {
            var st = rows[i].querySelector('.gsm-status');
            var sig = rows[i].querySelector('.gsm-signal');
            if (!st || !sig) continue;
            var status = (st.textContent || '').trim().toUpperCase();
            // Hide the LOGIN/LOGOUT text — only the coloured number remains in the cell
            st.style.display = 'none';

            // Strip any leftover number/pill class look — render as a plain coloured digit
            sig.style.background = 'transparent';
            sig.style.padding = '0';
            sig.style.fontSize = '14px';
            sig.style.fontWeight = '600';
            sig.style.fontVariantNumeric = 'tabular-nums';

            if (status !== 'LOGIN') {
                sig.textContent = '99';
                sig.style.color = '#c53030';
                continue;
            }
            var v = parseInt((sig.textContent || '').replace(/[^0-9]/g, ''), 10);
            if (isNaN(v)) v = 0;
            if (v > SIGNAL_MAX) v = SIGNAL_MAX;
            if (v < 0) v = 0;
            var hue = Math.round((v / SIGNAL_MAX) * 120);   // 0=red → 120=green
            sig.textContent = String(v);
            sig.style.color = 'hsl(' + hue + ', 75%, 32%)';
        }
    }

    // Click anywhere in a data row to toggle its checkbox.
    function bindRowClickToCheckbox() {
        document.addEventListener('click', function(e){
            // Don't hijack clicks on real form controls / links
            var t = e.target;
            var tag = (t.tagName || '').toUpperCase();
            if (tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'LABEL') return;
            if (t.closest && (t.closest('a') || t.closest('button') || t.closest('label'))) return;
            var tr = t.closest ? t.closest('tr') : null;
            if (!tr) return;
            var cb = tr.querySelector('input[type=checkbox][name^="Id"]');
            if (!cb) return;
            cb.checked = !cb.checked;
            tr.classList.toggle('marked', cb.checked);
            try { cb.dispatchEvent(new Event('change', { bubbles: true })); } catch (err) {}
        }, false);
    }

    ready(function(){
        dedupStatusBars();
        promoteNavLinks();
        hideSearchRow();
        addEmptyState();
        stylePagination();
        styleChecks();
        setupBatchFab();
        bindRowClickToCheckbox();
        colorizeSignals();
        decodeUcs2InTables();
        dimOfflineRows();
        // Re-run after every auto-refresh swap (cheap, runs on small tables only)
        setInterval(function(){ colorizeSignals(); decodeUcs2InTables(); dimOfflineRows(); }, 1000);
    });
})();
