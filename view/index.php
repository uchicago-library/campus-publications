<?php

$clean = array();

$GET = array();
$params = explode(";", $_SERVER['QUERY_STRING']);
foreach ($params as $param) {
	$k = urldecode(array_shift(explode("=", $param)));
	$v = urldecode(array_pop(explode("=", $param)));
	$GET[$k] = $v;
}

if (array_key_exists('docId', $GET)) {
	$clean['docId'] = $GET['docId'];
}

?>
<!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title></title>
	<link rel="stylesheet" type="text/css" href="/css/bookreader2/BookReader.css" />
	<link rel="stylesheet" type="text/css" href="/css/bookreader2/BookReaderDemo.css" />
	<script type="text/javascript" src="/script/bookreader2/jquery-1.4.2.min.js"></script>
	<script type="text/javascript" src="/script/bookreader2/jquery-ui-1.8.5.custom.min.js"></script>
	<script type="text/javascript" src="/script/bookreader2/jquery.hotkeys.js"></script>
	<script type="text/javascript" src="/script/bookreader2/dragscrollable.js"></script>
	<script type="text/javascript" src="/script/bookreader2/jquery.colorbox-min.js"></script>
	<script type="text/javascript" src="/script/bookreader2/jquery.ui.ipad.js"></script>
	<script type="text/javascript" src="/script/bookreader2/jquery.bt.min.js"></script>
	<script type="text/javascript" src="/script/bookreader2/BookReader.js"></script>
	<link rel="shortcut icon" href="icons/default/favicon.ico" />
</head>
<body>
	<ul id="skip">
		<li><a tabindex="1" href="/text/?docId=<?php echo $clean['docId']; ?>">View the full text of this item</a></li>
	</ul>
	<div id="BookReader">
		<noscript>
			<p>This page requires JavaScript to be enabled. Please check that your
			   browser supports JavaScript and that it is enabled in the browser settings.
			</p>
		</noscript>
	</div>
	<script type="text/javascript" src="/script/bookreader2/BookReaderJSSimple.js"></script>
</body>
</html>
