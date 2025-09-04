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
    if (preg_match('/^mvol-\d{4}-\d{4}-[0-9A-Z]{4}(-\d{2})?$/', $GET['docId']) === 1) {
	    $clean['docId'] = $GET['docId'];
    } else {
        die();
    }
}

if (preg_match('/^mvol-[0-9]{4}$/', $clean['docId']) === 1) {
    $urls = array(
        'mvol-0001' => 'Cap and Gown',
        'mvol-0002' => 'University of Chicago Magazine',
        'mvol-0004' => 'Daily Maroon',
        'mvol-0005' => 'Quarterly Calendar',
        'mvol-0007' => 'University Record',
        'mvol-0445' => 'University Record (New Series)',
        'mvol-0446' => 'University of Chicago Record',
        'mvol-0447' => 'University of Chicago Convocation Programs',
        'mvol-0448' => 'University of Chicago Weekly',
        'mvol-0503' => 'Medicine on the Midway'
    );
    header(sprintf("Location: /search?f1-title=%s", urlencode($urls[$clean['docId']])));
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
	<script async src="https://www.googletagmanager.com/gtag/js?id=G-EWT5B3NZ15"></script>
    <script>
		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}
		gtag('js', new Date());
		gtag('config', 'G-EWT5B3NZ15');
		gtag('set', 'content_group', 'digital_collections');
    </script>
	<script src="/script/ga.js" type="text/javascript"></script>
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
