<?php
if(!defined('OK')) exit;

class GoIPCron {
	private $socket;
	private $recvid;
	private $cronport;
	public $lastError;

	public function __construct() {
		global $goipcronport;
		$this->cronport = $goipcronport ? $goipcronport : 44444;
		$this->recvid = time();
		$s = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
		if ($s <= 0) {
			$this->lastError = "socket_create failed: " . socket_strerror($s);
			$this->socket = null;
		} else {
			$this->socket = $s;
		}
	}

	public function isOpen() {
		return $this->socket !== null;
	}

	public function getSocket() {
		return $this->socket;
	}

	public function getRecvid() {
		return $this->recvid;
	}

	public function rawSend($buf) {
		if (!$this->socket) return false;
		return @socket_sendto($this->socket, $buf, strlen($buf), 0, "127.0.0.1", $this->cronport);
	}

	public function handshake($host, $devport, $retries = 3, $timeout = 5) {
		if (!$this->socket) return false;
		for ($i = 0; $i < $retries; $i++) {
			$buf = "START {$this->recvid} $host $devport\n";
			if ($this->rawSend($buf) === false) {
				$this->lastError = "sendto error";
				continue;
			}
			$read = array($this->socket);
			$w = NULL;
			$e = NULL;
			$err = socket_select($read, $w, $e, $timeout);
			if ($err > 0) {
				$resp = '';
				if (@socket_recvfrom($this->socket, $resp, 1024, 0, $ip, $p) !== false) {
					$comm = explode(" ", $resp);
					if ($comm[0] == "OK") return true;
				}
			}
		}
		$this->lastError = "goipcron no response";
		return false;
	}

	public function recv(&$response, $timeout = 5) {
		if (!$this->socket) return -1;
		$read = array($this->socket);
		$w = NULL;
		$e = NULL;
		$err = socket_select($read, $w, $e, $timeout);
		if ($err === false) return -1;
		if ($err === 0)     return 0;
		$response = '';
		if (@socket_recvfrom($this->socket, $response, 1024, 0, $ip, $p) === false) return -1;
		return 1;
	}

	public function done() {
		if ($this->socket) $this->rawSend("DONE {$this->recvid}");
	}

	public function close() {
		if ($this->socket) {
			@socket_close($this->socket);
			$this->socket = null;
		}
	}

	public function __destruct() {
		$this->close();
	}
}
