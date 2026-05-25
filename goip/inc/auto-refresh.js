// Auto-refresh for list pages — polls the current URL, diff-swaps changed tables.
// Pauses while user is typing or hovering a row; togglable via floating indicator.
(function(){
    var INTERVAL_MS = 5000;
    var SCROLL_KEY = 'goip-scroll-' + location.pathname;

    // CSS for the live indicator
    var css =
        '#goip-live{position:fixed;top:6px;right:6px;z-index:9000;background:#fff;border:1px solid #b7c8e8;' +
        'border-radius:14px;padding:3px 10px 3px 8px;font:11px/1 -apple-system,Segoe UI,sans-serif;color:#1f2f46;' +
        'cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.08);user-select:none}' +
        '#goip-live .dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#0a7d2a;' +
        'margin-right:6px;vertical-align:1px;animation:goip-pulse 1.6s ease-in-out infinite}' +
        '#goip-live.paused .dot{background:#888;animation:none}' +
        '#goip-live.error .dot{background:#c53030;animation:none}' +
        '@keyframes goip-pulse{0%,100%{opacity:.55}50%{opacity:1}}' +
        'tr.goip-flash{animation:goip-flash 1.2s ease-out}' +
        '@keyframes goip-flash{0%{background:#fffbcc}100%{background:transparent}}';

    function injectStyle() {
        var st = document.createElement('style');
        st.appendChild(document.createTextNode(css));
        document.head.appendChild(st);
    }

    // Find the main data table — biggest `.border` table on the page.
    function findMainTable(root) {
        var tables = (root || document).querySelectorAll('table.border, table.goip-live');
        var best = null, bestRows = 0;
        for (var i = 0; i < tables.length; i++) {
            var rows = tables[i].rows ? tables[i].rows.length : 0;
            if (rows > bestRows) { bestRows = rows; best = tables[i]; }
        }
        return best;
    }

    function userBusy() {
        var a = document.activeElement;
        if (!a) return false;
        var tag = (a.tagName || '').toUpperCase();
        if (tag === 'INPUT') {
            var t = (a.type || 'text').toLowerCase();
            if (t === 'text' || t === 'search' || t === 'password' || t === 'email' || t === 'tel' || t === 'url' || t === 'number') return true;
            return false;
        }
        return tag === 'TEXTAREA' || tag === 'SELECT';
    }

    var indicator;
    function setIndicator(state, msg) {
        if (!indicator) return;
        indicator.className = state || '';
        var label = indicator.querySelector('.label');
        if (label && msg) label.textContent = msg;
    }

    function makeIndicator(onClick) {
        var el = document.createElement('div');
        el.id = 'goip-live';
        el.innerHTML = '<span class="dot"></span><span class="label">Live</span>';
        el.title = 'Click to pause/resume auto-refresh';
        el.addEventListener('click', onClick);
        document.body.appendChild(el);
        return el;
    }

    // Replace one table with another while flashing changed rows.
    function swapTable(oldT, newT) {
        // Compare row signatures to highlight changed/added rows
        var oldRows = oldT.rows, newRows = newT.rows;
        var oldSigs = [], newSigs = [];
        for (var i = 0; i < oldRows.length; i++) oldSigs.push(oldRows[i].innerHTML);
        for (var j = 0; j < newRows.length; j++) newSigs.push(newRows[j].innerHTML);

        // Replace contents
        oldT.innerHTML = newT.innerHTML;

        // Flash rows that are new or changed
        var freshRows = oldT.rows;
        for (var k = 0; k < freshRows.length; k++) {
            if (oldSigs[k] !== newSigs[k]) {
                freshRows[k].classList.add('goip-flash');
                (function(r){ setTimeout(function(){ r.classList && r.classList.remove('goip-flash'); }, 1300); })(freshRows[k]);
            }
        }
    }

    var paused = false, ticking = false, errors = 0;

    function tick() {
        if (paused || ticking || userBusy() || document.hidden) return;
        ticking = true;
        // Save scroll, fetch, restore.
        var scrollY = window.scrollY || window.pageYOffset;
        fetch(location.href, { credentials: 'same-origin', headers: { 'X-Auto-Refresh': '1' }, cache: 'no-store' })
            .then(function(r){
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.text();
            })
            .then(function(html){
                var doc = new DOMParser().parseFromString(html, 'text/html');
                var oldT = findMainTable();
                var newT = findMainTable(doc);
                if (oldT && newT && oldT.innerHTML !== newT.innerHTML) {
                    swapTable(oldT, newT);
                    window.scrollTo(0, scrollY);
                }
                errors = 0;
                setIndicator(paused ? 'paused' : '', paused ? 'Paused' : 'Live');
            })
            .catch(function(err){
                errors++;
                if (errors >= 3) setIndicator('error', 'Offline');
            })
            .then(function(){ ticking = false; });
    }

    function toggle() {
        paused = !paused;
        setIndicator(paused ? 'paused' : '', paused ? 'Paused' : 'Live');
    }

    function init() {
        if (!findMainTable()) return;     // no data table here, skip
        injectStyle();
        indicator = makeIndicator(toggle);

        // Pause while hovering a row (user is reading/about to click)
        document.addEventListener('mouseover', function(e){
            if (e.target && e.target.closest && e.target.closest('tr')) {
                indicator && indicator.classList.add('hover-pause');
            }
        }, true);

        setInterval(tick, INTERVAL_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
