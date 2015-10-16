<?php

require_once('../config.php');

$clean = array();
if (array_key_exists('docId', $_GET)) {
	$clean['docId'] = $_GET['docId'];
}

print file_get_contents(sprintf("%sview?docId=bookreader/%s/%s.xml;text=true", $config['xtf'], $clean['docId'], $clean['docId']));

?>
