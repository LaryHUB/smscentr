<?php
// Auto-prepended to every PHP request via php.ini's auto_prepend_file.
// Single responsibility: make sure the PHP session is started so that
// individual rendered pages don't each need to call session_start().
//
// Auth checks (redirect to login if no session) stay in the existing
// session.php that pages already include — bootstrap only handles the
// session lifecycle so the cookie survives across deploys.

if (PHP_SAPI === 'cli') return;

if (function_exists('session_status')) {
    if (session_status() === PHP_SESSION_NONE) {
        @session_start();
    }
} elseif (!isset($_SESSION)) {
    @session_start();
}
?>
