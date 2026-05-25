<?php
// IMSI -> carrier name lookup. The first 3 digits of an IMSI are the MCC
// (Mobile Country Code), the next 2-3 digits are the MNC (Mobile Network Code).
// Together they uniquely identify the SIM's home carrier.
//
// The list below covers the CIS region densely + a handful of common ones.
// Extend at will — add "MCCMNC" => "Carrier Name" rows.

if (!isset($GOIP_IMSI_CARRIER_MAP)) {
$GOIP_IMSI_CARRIER_MAP = array(
    // ----- Russia (MCC 250) -----
    '25001' => 'MTS',          '25002' => 'MegaFon',
    '25003' => 'NCC',          '25005' => 'ETK',
    '25007' => 'SMARTS',       '25010' => 'DTC',
    '25011' => 'Yota',         '25012' => 'Baykalwestcom',
    '25013' => 'Kuban GSM',    '25014' => 'MegaFon',
    '25015' => 'SMARTS',       '25016' => 'NTC',
    '25017' => 'Ermak RMS',    '25019' => 'MTS',
    '25020' => 'Tele2',        '25023' => 'Mobicom-Novosibirsk',
    '25028' => 'BeeLine',      '25032' => 'MegaFon',
    '25035' => 'MOTIV',        '25038' => 'Tele2',
    '25039' => 'Rostelecom',   '25044' => 'Stuzhanka',
    '25050' => 'MTT',          '25060' => 'VTB Mobile',
    '25062' => 'Tinkoff Mobile','25092' => 'Primtelefon',
    '25099' => 'BeeLine',
    // ----- Ukraine (MCC 255) -----
    '25501' => 'MTS UA',       '25502' => 'BeeLine UA',
    '25503' => 'Kyivstar',     '25504' => 'IT',
    '25505' => 'Golden Telecom','25506' => 'lifecell',
    '25507' => 'Utel',         '25521' => 'PEOPLEnet',
    '25523' => 'Vodafone UA',  '25525' => 'Vodafone UA',
    '25533' => 'Kyivstar',
    // ----- Belarus (MCC 257) -----
    '25701' => 'A1',           '25702' => 'MTS BY',
    '25703' => 'DIALLOG',      '25704' => 'life:)',
    '25705' => 'BeST',
    // ----- Kazakhstan (MCC 401) -----
    '40101' => 'Beeline KZ',   '40102' => 'Kcell',
    '40107' => 'Altel',        '40108' => 'Tele2 KZ',
    '40177' => 'Mobile Telecom',
    // ----- Uzbekistan (MCC 434) -----
    '43401' => 'Buztel',       '43402' => 'Uzmacom',
    '43404' => 'Daewoo Unitel','43405' => 'Ucell',
    '43406' => 'Perfectum Mobile','43407' => 'Beeline UZ',
    // ----- Azerbaijan (MCC 400) -----
    '40001' => 'Azercell',     '40002' => 'Bakcell',
    '40003' => 'FONEX',        '40004' => 'Nar Mobile',
    // ----- Georgia (MCC 282) -----
    '28201' => 'Geocell',      '28202' => 'Magticom',
    '28203' => 'Beeline GE',   '28204' => 'Silknet',
    // ----- Armenia (MCC 283) -----
    '28301' => 'Beeline AM',   '28304' => 'Karabakh Telecom',
    '28305' => 'VivaCell-MTS', '28310' => 'Ucom',
    // ----- Moldova (MCC 259) -----
    '25901' => 'Orange MD',    '25902' => 'Moldcell',
    '25903' => 'IDC',          '25904' => 'Eventis',
    '25905' => 'Unite',
    // ----- Latvia/Lithuania/Estonia (Baltics) -----
    '24701' => 'LMT',          '24702' => 'Tele2 LV',
    '24705' => 'BITE LV',
    '24601' => 'Telia LT',     '24602' => 'BITE LT',
    '24603' => 'Tele2 LT',
    '24801' => 'Telia EE',     '24802' => 'Elisa EE',
    '24803' => 'Tele2 EE',
    // ----- Poland (MCC 260) -----
    '26001' => 'Plus',         '26002' => 'T-Mobile PL',
    '26003' => 'Orange PL',    '26006' => 'Play',
    // ----- Turkey (MCC 286) -----
    '28601' => 'Turkcell',     '28602' => 'Vodafone TR',
    '28603' => 'Türk Telekom',
    // ----- Germany (MCC 262) -----
    '26201' => 'Telekom DE',   '26202' => 'Vodafone DE',
    '26203' => 'O2 DE',
    // ----- UK (MCC 234) -----
    '23410' => 'O2 UK',        '23415' => 'Vodafone UK',
    '23420' => '3 UK',         '23430' => 'T-Mobile UK',
    // ----- USA (MCC 310-316) -----
    '310410' => 'AT&T',        '310260' => 'T-Mobile US',
    '311480' => 'Verizon',
);
}

/**
 * Look up a carrier name by IMSI.
 * Tries 6-digit prefix (MCC+3-digit MNC) first, then 5-digit (MCC+2-digit MNC).
 */
function imsi_carrier_name($imsi) {
    global $GOIP_IMSI_CARRIER_MAP;
    if (!$imsi) return null;
    $imsi = preg_replace('/[^0-9]/', '', $imsi);
    if (strlen($imsi) < 5) return null;
    $p6 = substr($imsi, 0, 6);
    $p5 = substr($imsi, 0, 5);
    if (isset($GOIP_IMSI_CARRIER_MAP[$p6])) return $GOIP_IMSI_CARRIER_MAP[$p6];
    if (isset($GOIP_IMSI_CARRIER_MAP[$p5])) return $GOIP_IMSI_CARRIER_MAP[$p5];
    return null;
}

/**
 * Walk all GoIP rows that have an IMSI but no provider assigned, look up the
 * carrier by IMSI, and either match an existing prov row (case-insensitive,
 * substring) or create a new one. Cheap: only touches rows that need work.
 */
function auto_assign_providers_by_imsi($db) {
    if (!$db) return 0;
    $updated = 0;
    $rs = $db->query("SELECT id, imsi FROM goip WHERE imsi IS NOT NULL AND imsi != '' AND (provider IS NULL OR provider = 0)");
    if (!$rs) return 0;
    while ($row = $db->fetch_array($rs)) {
        $name = imsi_carrier_name($row['imsi']);
        if (!$name) continue;
        $safe = $db->real_escape_string($name);
        $found = $db->fetch_array($db->query("SELECT id FROM prov WHERE LOWER(prov) = LOWER('$safe') OR prov LIKE '%$safe%' LIMIT 1"));
        if (!$found || empty($found[0])) {
            $db->query("INSERT INTO prov (prov) VALUES ('$safe')");
            global $conn;
            $pid = $conn ? mysqli_insert_id($conn) : 0;
        } else {
            $pid = (int)$found[0];
        }
        if ($pid) {
            $db->query("UPDATE goip SET provider = $pid WHERE id = " . (int)$row['id']);
            $updated++;
        }
    }
    return $updated;
}
?>
