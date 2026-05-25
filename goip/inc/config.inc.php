<?php
// Runtime defaults — entrypoint scripts regenerate this file from env vars
// (GOIP_DB_HOST, GOIP_DB_USER, GOIP_DB_PASS, GOIP_DB_NAME, GOIP_CRON_HOST,
//  GOIP_CRON_PORT) so the same image can run either standalone or split
// into core (mysql+goipcron) and web (apache+php) containers.
$dbhost='localhost';
$dbuser='goip';
$dbpw='goip';
$dbname='goip';
$goipcronport='44444';
$goipcronhost='127.0.0.1';
$charset='utf8';
$endless_send=0;
$re_ask_timer=3;
?>
