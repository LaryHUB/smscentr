// UX layer for the USSD send form:
//   * intercepts submit, posts via fetch (no page reload)
//   * shows a centered spinner overlay with elapsed-time counter
//   * paints the response into the existing result cell (green for OK, red for ERROR)
// Progressive enhancement: if JS is disabled the form still works the old way.

(function(){
    var FORM_NAME = 'form1';
    var POST_PATH = 'ussd.php';     // override below for /en/

    var css = [
        '.ussd-overlay { position:fixed; inset:0; background:rgba(255,255,255,0.82); display:none; z-index:9999; align-items:center; justify-content:center; font:13px/1.4 -apple-system,Segoe UI,sans-serif; color:#333; }',
        '.ussd-overlay.show { display:flex; }',
        '.ussd-box { background:#fff; padding:18px 22px; border:1px solid #d0d0d0; border-radius:6px; box-shadow:0 4px 18px rgba(0,0,0,0.18); text-align:center; min-width:220px; }',
        '.ussd-spinner { display:inline-block; width:14px; height:14px; margin-right:8px; border:2px solid #e0e0e0; border-top-color:#3a7afe; border-radius:50%; vertical-align:-2px; animation:ussd-spin .8s linear infinite; }',
        '@keyframes ussd-spin { to { transform:rotate(360deg); } }',
        '.ussd-status { font-weight:500; }',
        '.ussd-timer { color:#888; font-size:11px; margin-top:6px; }',
        '.ussd-ok  { color:#0a7d2a !important; white-space:pre-wrap; }',
        '.ussd-err { color:#c53030 !important; white-space:pre-wrap; }'
    ].join('\n');

    function inject() {
        var st = document.createElement('style');
        st.type = 'text/css';
        st.appendChild(document.createTextNode(css));
        document.head.appendChild(st);

        var ov = document.createElement('div');
        ov.id = 'ussd-overlay';
        ov.className = 'ussd-overlay';
        ov.innerHTML = '<div class="ussd-box"><span class="ussd-spinner"></span><span id="ussd-status" class="ussd-status">Sending USSD...</span><div id="ussd-timer" class="ussd-timer">0s</div></div>';
        document.body.appendChild(ov);
    }

    function findResultCell(form) {
        var tds = form.querySelectorAll('table td');
        for (var i = 0; i < tds.length - 1; i++) {
            var t = (tds[i].innerText || tds[i].textContent || '');
            if (t.indexOf('USSD返回信息') !== -1 || t.toLowerCase().indexOf('ussd return') !== -1) {
                return tds[i + 1];
            }
        }
        return null;
    }

    function init() {
        var form = document.forms[FORM_NAME];
        if (!form) return;
        inject();

        var overlay = document.getElementById('ussd-overlay');
        var statusEl = document.getElementById('ussd-status');
        var timerEl  = document.getElementById('ussd-timer');
        var resultCell = findResultCell(form);
        var timerId = 0;

        form.addEventListener('submit', function(e){
            var msgInput = form.querySelector('[name=USSDMSG]');
            var msg = msgInput && msgInput.value ? msgInput.value.trim() : '';
            if (!msg) return;
            e.preventDefault();

            statusEl.textContent = 'Sending USSD: ' + msg;
            timerEl.textContent = '0s';
            overlay.className = 'ussd-overlay show';
            var t0 = Date.now();
            timerId = setInterval(function(){
                timerEl.textContent = Math.floor((Date.now() - t0) / 1000) + 's';
            }, 250);

            // POST without debug=1 -> server returns plain text "OK <msg>" or "ERROR <msg>"
            var action = form.getAttribute('action') || POST_PATH;
            var parts = action.split('?');
            var path = parts[0] || POST_PATH;
            var query = parts.length > 1 ? parts.slice(1).join('?') : '';
            var kept = [];
            if (query) {
                var params = query.split('&');
                for (var i = 0; i < params.length; i++) {
                    if (params[i] && params[i].split('=')[0] != 'debug') kept.push(params[i]);
                }
            }
            var url = path + (kept.length ? '?' + kept.join('&') : '');

            var data = new FormData(form);
            data.delete('debug');

            fetch(url, { method:'POST', body:data, credentials:'same-origin' })
                .then(function(r){
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.text();
                })
                .then(function(text){
                    clearInterval(timerId);
                    overlay.className = 'ussd-overlay';
                    if (!resultCell) return;
                    var trimmed = text.replace(/^\s+|\s+$/g, '');
                    if (trimmed.indexOf('OK') === 0) {
                        resultCell.className = 'tdbg ussd-ok';
                        resultCell.textContent = trimmed.replace(/^OK\s*/, '') || '(empty)';
                    } else if (trimmed.indexOf('ERROR') === 0) {
                        resultCell.className = 'tdbg ussd-err';
                        resultCell.textContent = trimmed;
                    } else {
                        resultCell.className = 'tdbg';
                        resultCell.textContent = trimmed;
                    }
                })
                .catch(function(err){
                    clearInterval(timerId);
                    overlay.className = 'ussd-overlay';
                    if (resultCell) {
                        resultCell.className = 'tdbg ussd-err';
                        resultCell.textContent = 'HTTP ERROR: ' + err.message;
                    }
                });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
