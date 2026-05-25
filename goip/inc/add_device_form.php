<?php
// Modern, modal-friendly form fragment for "Add GoIP device".
// Returns the form HTML only (no chrome) — JS injects it into a modal,
// submits via fetch, parses success/error from the legacy WriteSuccessMsg/WriteErrMsg HTML.
define("OK", true);
require_once(__DIR__ . '/conn.inc.php');
require_once(__DIR__ . '/../session.php');

$providers = array();
$rs = $db->query("SELECT id, prov FROM prov WHERE prov!=''");
while ($r = $db->fetch_array($rs)) { $providers[] = $r; }

$groups = array();
$rs = $db->query("SELECT id, group_name FROM goip_group ORDER BY group_name");
while ($r = $db->fetch_array($rs)) { $groups[] = $r; }
?>
<form id="add-device-form" method="post" action="goip.php?action=saveadd" novalidate>
    <div class="adf-grid">
        <label class="adf-field">
            <span class="adf-label">Device ID <em>*</em></span>
            <input name="name" autocomplete="off" required maxlength="64" placeholder="e.g. goip-001">
        </label>
        <label class="adf-field">
            <span class="adf-label">Batch lines</span>
            <input name="line" type="number" min="1" max="99" value="1" inputmode="numeric">
            <span class="adf-hint">If &gt; 1, creates ID01, ID02, …</span>
        </label>

        <label class="adf-field">
            <span class="adf-label">Provider</span>
            <select name="provider">
                <option value="0">— None —</option>
<?php foreach ($providers as $p): ?>
                <option value="<?php echo (int)$p['id']; ?>"><?php echo htmlspecialchars($p['prov']); ?></option>
<?php endforeach; ?>
            </select>
        </label>
        <label class="adf-field">
            <span class="adf-label">Group</span>
            <select name="goip_group">
                <option value="0">— None —</option>
<?php foreach ($groups as $g): ?>
                <option value="<?php echo (int)$g['id']; ?>"><?php echo htmlspecialchars($g['group_name']); ?></option>
<?php endforeach; ?>
            </select>
        </label>

        <label class="adf-field">
            <span class="adf-label">Password <em>*</em></span>
            <input name="Password" type="password" autocomplete="new-password" required>
        </label>
        <label class="adf-field">
            <span class="adf-label">Confirm password <em>*</em></span>
            <input name="PwdConfirm" type="password" autocomplete="new-password" required>
        </label>

        <label class="adf-field">
            <span class="adf-label">SMS max limit</span>
            <input name="count_limit" type="number" min="-1" max="99999999" placeholder="unlimited">
        </label>
        <label class="adf-field">
            <span class="adf-label">SMS daily limit</span>
            <input name="count_limit_d" type="number" min="-1" max="99999999" placeholder="unlimited">
        </label>
    </div>

    <div class="adf-advanced">
        <details>
            <summary>Forward incoming SMS</summary>
            <div class="adf-grid">
                <label class="adf-field adf-checkbox">
                    <input type="checkbox" name="fwd_mail_enable">
                    <span>Forward to email</span>
                </label>
                <label class="adf-field">
                    <span class="adf-label">Email address</span>
                    <input name="report_mail" type="email" placeholder="alerts@example.com">
                </label>
                <label class="adf-field adf-checkbox">
                    <input type="checkbox" name="fwd_http_enable">
                    <span>Forward to HTTP</span>
                </label>
                <label class="adf-field">
                    <span class="adf-label">Callback URL</span>
                    <input name="report_http" type="url" placeholder="https://example.com/hook">
                </label>
            </div>
        </details>
    </div>

    <div class="adf-error" hidden></div>
    <div class="adf-actions">
        <button type="button" class="adf-btn adf-btn-secondary" data-action="cancel">Cancel</button>
        <button type="submit" class="adf-btn adf-btn-primary">Add device</button>
    </div>
</form>
