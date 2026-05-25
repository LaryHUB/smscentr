<?php
// /goip/en/index.php — the single entry point. Show login if no session.
if (!isset($_SESSION['goip_username'])) {
    define("OK", true);
    require_once("global.php");
    require_once("login.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="Author" content="Gaby_chen">
<title>GOIP SMS Server</title>
<style>
    html, body { margin:0; padding:0; height:100%; overflow:hidden; font:13px Arial, Helvetica, sans-serif; background:#eef3fb; }
    .app { display:flex; flex-direction:row; height:100vh; width:100%; }
    .app .side { width:190px; flex:0 0 190px; border-right:1px solid #b7c8e8; background:#799AE1; overflow:auto; }
    .app .col  { flex:1 1 auto; display:flex; flex-direction:column; min-width:0; }
    .app .col .top  { height:35px; flex:0 0 35px; border-bottom:1px solid #b7c8e8; }
    .app .col .main { flex:1 1 auto; min-height:0; }
    .app iframe { width:100%; height:100%; border:0; display:block; }
    /* Mobile: sidebar collapses behind a toggle */
    .menubtn { display:none; position:fixed; top:6px; left:6px; z-index:20; background:#2f5fa8; color:#fff; border:0; padding:6px 10px; border-radius:4px; font:bold 14px sans-serif; cursor:pointer; box-shadow:0 1px 4px rgba(0,0,0,.2); }
    @media (max-width: 720px) {
        .menubtn { display:block; }
        .app .side { position:fixed; left:-200px; top:0; bottom:0; z-index:15; transition:left .22s ease; box-shadow:2px 0 12px rgba(0,0,0,.25); }
        .app.side-open .side { left:0; }
        .app .col .top { padding-left:46px; }
    }
</style>
<script>
function toggleSide(){ document.getElementById('app').classList.toggle('side-open'); }

// Persist current main-iframe path in the URL hash so refresh keeps you where you were.
function initRouter(){
    var main = document.querySelector('iframe[name="main"]');
    if (!main) return;
    var SAFE = /^[\w./?&=%#:+,-]+$/;

    // Restore from hash on load
    var hash = location.hash.replace(/^#/, '');
    if (hash && SAFE.test(hash) && hash.indexOf('//') === -1) {
        main.src = hash;
    }

    // On every iframe navigation, write its URL into the parent hash
    main.addEventListener('load', function(){
        try {
            var loc = main.contentWindow.location;
            var path = loc.pathname + loc.search;
            if (history.replaceState) history.replaceState(null, '', '#' + path);
            else location.hash = path;
        } catch(e) { /* cross-origin — ignore */ }
    });
}
window.addEventListener('DOMContentLoaded', initRouter);
</script>
</head>
<body>
<button class="menubtn" type="button" onclick="toggleSide()" aria-label="Menu">&#9776;</button>
<div id="app" class="app">
    <div class="side"><iframe name="left" src="left.php"></iframe></div>
    <div class="col">
        <div class="top"><iframe name="top" src="top.php" scrolling="no"></iframe></div>
        <div class="main"><iframe name="main" src="main.php"></iframe></div>
    </div>
</div>
</body>
</html>
