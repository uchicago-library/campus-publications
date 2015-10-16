<?php

require_once('../config.php');

$clean = array();
if (array_key_exists('docId', $_GET)) {
	$clean['docId'] = $_GET['docId'];
}

header('Content-type: application/pdf');
readfile(sprintf("%sdata/bookreader/%s/%s.pdf", $config['xtf'], $clean['docId'], $clean['docId']));

?>
