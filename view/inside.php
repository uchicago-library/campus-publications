<?php

require_once('../config.php');

/* Produce JSONP output for the Chicagoan's pageturner. This gets XML
 * data from the XTF instance running at chicagoan.lib and turns 
 * it into the kind of JSONP the front end needs. 
 * 
 * April, 2013, jej
 */

/*
 * FUNCTIONS 
 */

function get_page_count($xml) {
	return $xml->getElementsByTagName("leaf")->length;
}

function get_text($line) {
	$xp = new DOMXPath($line->ownerDocument);
	$xp->registerNamespace('xtf', 'http://cdlib.org/xtf');

	$s = array();

	foreach ($xp->query('descendant::text()', $line) as $textNode) {
		$textValue = preg_replace('/\s\s*/', ' ', trim($textNode->nodeValue));

		/* Skip text nodes that are just whitespace. */
		if ($textValue == '') {
			continue;
		}
		/* If this is a search term, add it to the terms array. */
		if ($xp->query('ancestor::xtf:term', $textNode)->length > 0) {
			$s[] = sprintf("{{{%s}}}", $textValue);
		} else {
			$s[] = $textValue;
		}
	}
	return implode(" ", $s);
}

function get_par($line) {
	$line_l = (int)$line->getAttribute('l');
	$line_t = (int)$line->getAttribute('t');
	$line_r = (int)$line->getAttribute('r');
	$line_b = (int)$line->getAttribute('b');

	$xp = new DOMXPath($line->ownerDocument);

	$nl = $xp->query('parent::leaf/@leafNum', $line);
	$page = (int)$nl->item(0)->nodeValue;

	$nl = $xp->query('parent::leaf/cropBox', $line);
	$page_width = (int)$nl->item(0)->getAttribute('x');
	$page_height = (int)$nl->item(0)->getAttribute('y');

	return array(
		array(
		"page"        => $page,
		"page_width"  => $page_width,
		"page_height" => $page_height,
		"b"           => $line_b,
		"t"           => $line_t,
		"r"           => $line_r,
		"l"           => $line_l,
		"boxes"       => get_boxes($line)
		)
	);
}

function get_boxes($line) {
	$xp = new DOMXPath($line->ownerDocument);
	$xp->registerNamespace('xtf', 'http://cdlib.org/xtf');

	$words = array();
	$boxes = array();

	foreach ($xp->query('descendant::text()', $line) as $textNode) {
		$textValue = preg_replace('/\s\s*/', ' ', trim($textNode->nodeValue));

		/* Skip text nodes that are just whitespace. */
		if ($textValue == '') {
			continue;
		}
		/* If this is a search term, add it to the terms array. */
		if ($xp->query('ancestor::xtf:term', $textNode)->length > 0) {
			$boxes[] = get_box($line, count($words));
		}
		/* no matter what, extend the amount of words in the sentence. */
		$words = array_merge($words, explode(' ', $textValue));
	}
	return $boxes;
}

function get_box($line, $numberOfWordsBefore) {
	$xp = new DOMXPath($line->ownerDocument);

	$line_l = (int)$line->getAttribute('l');
	$line_t = (int)$line->getAttribute('t');
	$line_r = (int)$line->getAttribute('r');
	$line_b = (int)$line->getAttribute('b');

	$spacing = array();
	foreach (explode(' ', $line->getAttribute('spacing')) as $space) {
		$spacing[] = (int)$space;
	}

	/* Figure out where the word boundaries are. */
	$word_l = $line_l + (array_sum(array_slice($spacing, 0, $numberOfWordsBefore * 2 + 0)));
	$word_r = $line_l + (array_sum(array_slice($spacing, 0, $numberOfWordsBefore * 2 + 1)));

	$nl = $xp->query('parent::leaf/@leafNum', $line);
	$page = (int)$nl->item(0)->nodeValue;

	return array(
		'r'    => $word_r,
		'b'    => $line_b,
		't'    => $line_t,
		'l'    => $word_l,
		'wordsbefore' => $numberOfWordsBefore,
		'page' => $page
	);
}

function get_meta($xml) {
	$meta = array(
		'date' => $xml->getElementsByTagName('range-date')->item(0)->nodeValue,
		'relation' => array_pop(explode(" ", $xml->getElementsByTagName('facet-volume')->item(0)->nodeValue)) . ':0',
		'title' => array_shift(explode(":", $xml->getElementsByTagName('facet-title')->item(0)->nodeValue)),
		'identifier' => $xml->getElementsByTagName('sort-identifier')->item(0)->nodeValue
	);

	$description = $xml->getElementsByTagName('browse-description')->item(0)->nodeValue;
	if ($description != '') {
		$meta['description.note'] = $description;
	}
	
	return $meta;
}

/*
 * INPUT
 */

$clean = array();
$clean['callback'] = $_GET['callback'];
$clean['docId'] = $_GET['docId'];
$clean['q'] = $_GET['q'];
$clean['query-join'] = $_GET['query-join'];

/*
 * MAIN 
 */

/* Load XML data for the query. */
$xml = new DOMDocument();

/* Build a URL string. */
$url = sprintf("%sview?docId=bookreader/%s/%s.xml", 
       $config['xtf'],
       urlencode($clean['docId']), 
       urlencode($clean['docId']));

if (array_key_exists('q', $clean) && $clean['q'] != '') {
	$url .= sprintf(";query=%s", urlencode($clean['q']));
}
if (array_key_exists('query-join', $clean) && $clean['query-join'] != '') {
	$url .= sprintf(";query-join=%s", urlencode($clean['query-join']));
}
$url .= ";raw=1";

$xml->load($url);

$xp = new DOMXPath($xml);

$json = array(
           'ia' => $clean['docId'],
            'q' => $clean['q'],
      'indexed' => true,
   'page_count' => get_page_count($xml),
'leaf0_missing' => false,
      'matches' => array(),
         'meta' => get_meta($xml),
        'pages' => array()
);

foreach ($xp->query('/*/leaf/line[descendant::xtf:term]') as $line) {
	$match['text'] = get_text($line);
	$match['par'] = get_par($line);
	$json['matches'][] = $match;
}

foreach ($xp->query('/*/leaf') as $leaf) {
	$page = array();

	$page['humanReadableLeafNum'] = $leaf->getAttribute('humanReadableLeafNum');
	$page['imgFile'] = $leaf->getAttribute('imgFile');
	$page['leafNum'] = $leaf->getAttribute('leafNum');
	$page['x'] = $leaf->getAttribute('x');
	$page['y'] = $leaf->getAttribute('y');

	$json['pages'][] = $page;
}

if ($clean['callback'] === NULL) {
	printf("%s", json_encode($json));
} else {
	printf("%s(%s);", $clean['callback'], json_encode($json));
}

?>
