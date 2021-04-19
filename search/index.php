<?php

require_once('../config.php');

function get_keyword($xml) {
    $xp = new DOMXPath($xml);

    $nl = $xp->query('/crossQueryResult/parameters/param[@name="keyword"]'); 
    if ($nl->length > 0) {
        return $nl->item(0)->getAttribute('value');
    }
    return '';
}

function has_search_results($xml) {
	return ($xml->getElementsByTagName('docHit')->length != 0);
}

function get_browse($xml, $category) {
	$x = new DOMDocument();
	if ($x->load('browse.xsl') == false) {
		die('problem with browse.xsl');
	}
	$xsl = new XSLTProcessor();
	$xsl->setParameter('', 'category', $category);
	$xsl->importStylesheet($x);
	return $xsl->transformToXML($xml);
/*
	$xp = new DOMXPath($xml);

	$docHits = array();
	foreach ($xp->query('/crossQueryResult/docHit') as $d) {
		$title = array_pop(explode(':', $xp->query('meta/facet-category', $d)->item(0)->nodeValue));
		if (!array_key_exists($title, $docHits)) {
			$docHits[$title] = array();
		}
		
		$docHits[$title][] = $xp->query('meta/year', $d)->item(0)->nodeValue;
	}

	printf("<ul>");
	foreach ($xp->query('/crossQueryResult/facet[@field="facet-category"]/group[@value="university"]/group') as $g) {
		$value = $g->getAttribute('value');

		$years = $docHits[$value];
		sort($years);

		$startyear = $years[0];
		$endyear = $years[count($years) - 1];
		if ($startyear != $endyear) {
			$yearstring = sprintf("%d - %d", $startyear, $endyear);
		} else {
			$yearstring = sprintf("%d", $startyear);
		}
			
		printf("<li><a href='/search/?f1-category=university%3a%3a%s'>%s (%s)</a></li>", urlencode($value), $value, $yearstring);
	}
	printf("</ul>");
*/
}

function get_browse_date($xml) {
	$x = new DOMDocument();
	if ($x->load('browsedate.xsl') == false) {
		die('problem with browsedate.xsl');
	}
	$xsl = new XSLTProcessor();
	$xsl->importStylesheet($x);
	return $xsl->transformToXML($xml);
}

function get_browse2($xml) {
	$x = new DOMDocument();
	if ($x->load('browse2.xsl') == false) {
		die('problem with browse2.xsl');
	}
	$xsl = new XSLTProcessor();
	$xsl->importStylesheet($x);
	return $xsl->transformToXML($xml);
}

// if there is not a /crossQueryResult/parameters/param[@name="f1-date"],
// then we are dealing with a fresh query. 

// save /crossQueryResult/parameters/param[@name="f1-title"]/@value- 
// it will need to be added to the query.
// foreach //facet[@field="facet-date"]/group
// output the link with the @value. ;f1-date=1890s

// if there was an f1-date in the params,
// print the date and the number of results,
// and print a "go back" link that doesn't have the f1-date attached. 


function get_facets_old($xml) {
	$x = new DOMDocument();
	if ($x->load('facets.xsl') == false) {
		die('problem with facets.xsl');
	}
	$xsl = new XSLTProcessor();
	$xsl->importStylesheet($x);
	return $xsl->transformToXML($xml);
}

function get_facets($xml) {
    $xp = new DOMXPath($xml);

    $params = array();
    $html = '';
   
    // save f1-title parameter if it's there.  
    $nl = $xp->query('/crossQueryResult/parameters/param[@name="f1-title"]'); 
    if ($nl->length > 0) {
        $params['f1-title'] = $nl->item(0)->getAttribute('value');
    }

    // save keyword parameter if it's there. 
    $nl = $xp->query('/crossQueryResult/parameters/param[@name="keyword"]'); 
    if ($nl->length > 0) {
        $params['keyword'] = $nl->item(0)->getAttribute('value');
    }

    // check to see if there is an f1-date parameter. 
    $nl = $xp->query('/crossQueryResult/parameters/param[@name="f1-date"]'); 

    // there is an f1-date param. 
    if ($nl->length > 0) {
        if (count(array_keys($params)) == 0) {
            $params['f1-title'] = "University Record";
        }
        $html .= sprintf("<p><a href='/search?%s'>&lt; any date</a></p>", http_build_query($params));
        $html .= sprintf("<h2>%s</h2>", $nl->item(0)->getAttribute('value'));
    // there is no f1-date param. 
    } else {
        $html .= "<h2>Dates</h2>";
        $html .= "<ul>";
        $nl = $xp->query('/crossQueryResult/facet[@field="facet-date"]/group');
        foreach ($nl as $n) {
            $href = sprintf("/search?%s", http_build_query(array_merge($params, array('f1-date' => $n->getAttribute('value')))));
            $text = sprintf("%s (%d)", $n->getAttribute('value'), $n->getAttribute('totalDocs'));
            $html .= sprintf("<li><a href='%s'>%s</a></li>", $href, $text);
        }
        $html .= "</ul>";
    }
    return $html;    
}

function get_browse_facets($xml) {
	$x = new DOMDocument();
	if ($x->load('browsefacets.xsl') == false) {
		die('problem with browsefacets.xsl');
	}
	$xsl = new XSLTProcessor();
	$xsl->importStylesheet($x);
	return $xsl->transformToXML($xml);
}

function get_html($xml) {
	$x = new DOMDocument();
	if ($x->load('search.xsl') == false) {
		die('problem with search.xsl');
	}
	$xsl = new XSLTProcessor();
	$xsl->importStylesheet($x);
	return $xsl->transformToXML($xml);
}

function get_pager($xml) {
	$startDoc = (int)$xml->getElementsByTagName('crossQueryResult')->item(0)->getAttribute('startDoc');
	$endDoc = (int)$xml->getElementsByTagName('crossQueryResult')->item(0)->getAttribute('endDoc');
	$totalDocs = (int)$xml->getElementsByTagName('crossQueryResult')->item(0)->getAttribute('totalDocs');
	$resultsPerPage = (int)$xml->getElementsbyTagName('query')->item(0)->getAttribute('maxDocs');
	$numberOfPages = (int)ceil($totalDocs / $resultsPerPage);

	if ($totalDocs < $resultsPerPage) {
		return '';
	}

	$pages = array();

	$url = parse_url($_SERVER['REQUEST_URI']);

	$params = array();
	parse_str($url['query'], $params);

	$currentPage = 0;
	if (array_key_exists('startDoc', $params)) {
		$currentPage = ((int)$params['startDoc'] - 1) / $resultsPerPage;
	}

	$p = 0;
	while ($p < $numberOfPages) {
		$params['startDoc'] = (string)($p * $resultsPerPage + 1);
		if ($p == $currentPage) {
			$pages[] = sprintf("%d", $p + 1);
		} else {
			$pages[] = sprintf("<a href='%s?%s'>%d</a>", $url['path'], http_build_query($params), $p + 1);
		}
		$p++;
	}

	/* Set up previous link. */
	if ($currentPage > 0) {
		$params['startDoc'] = (string)(($currentPage - 1) * $resultsPerPage + 1);
		array_unshift($pages, sprintf("<a href='%s?%s'>Prev</a>", $url['page'], http_build_query($params)));
	} else {
		array_unshift($pages, sprintf("Prev"));
	}

	/* Set up next link. */
	if ($endDoc < $totalDocs) {
		$params['startDoc'] = (string)(($currentPage + 1) * $resultsPerPage + 1);
		array_push($pages, sprintf("<a href='%s?%s'>Next</a>", $url['page'], http_build_query($params)));
	} else {
		array_push($pages, sprintf("Next"));
	}

	return sprintf("<p>Page: %s</p>", implode(" ", $pages));
}

$clean = array();

if (array_key_exists('browse-category', $_GET)) {
	$clean['browse-category'] = stripslashes($_GET['browse-category']);
}
if (array_key_exists('browse-date', $_GET)) {
	$clean['browse-date'] = stripslashes($_GET['browse-date']);
}
if (array_key_exists('facet-date', $_GET)) {
	$clean['facet-date'] = stripslashes($_GET['facet-date']);
}
if (array_key_exists('keyword', $_GET)) {
	$clean['keyword'] = stripslashes($_GET['keyword']);
}
// remove surrounding quotes from keyword searches, since these searches
// are all exact phrase anyway.
$clean['keyword'] = trim($clean['keyword'], '"');
$clean['keyword'] = trim($clean['keyword'], "'");
if (array_key_exists('startDoc', $_GET)) {
	$clean['startDoc'] = stripslashes($_GET['startDoc']);
}
if (array_key_exists('text', $_GET)) {
	$clean['text'] = stripslashes($_GET['text']);
}
if (array_key_exists('text-join', $_GET)) {
	$clean['text-join'] = stripslashes($_GET['text-join']);
}
if (array_key_exists('text-prox', $_GET)) {
	$clean['text-prox'] = stripslashes($_GET['text-prox']);
}
if (array_key_exists('text-exclude', $_GET)) {
	$clean['text-exclude'] = stripslashes($_GET['text-exclude']);
}
if (array_key_exists('text-field', $_GET)) {
	$clean['text-field'] = stripslashes($_GET['text-field']);
}
if (array_key_exists('year', $_GET)) {
	$clean['year'] = stripslashes($_GET['year']);
}
if (array_key_exists('year-max', $_GET)) {
	$clean['year-max'] = stripslashes($_GET['year-max']);
}
/*
 * f1-title, f1-date, f1-category, f1-volume.
 */
foreach (array_keys($_GET) as $k) {
	if (preg_match('/^f[0-9]+-.*$/', $k) == 1) {
		$clean[$k] = stripslashes($_GET[$k]);
	}
}

/* Request stuff from the backend. */

$p = array();
foreach ($clean as $k => $v) {
	$p[] = sprintf("%s=%s", $k, urlencode($v));
}
if (array_key_exists('browse-category', $clean) || array_key_exists('browse-date', $clean)) {
	$p[] = "raw=1";
} else {
	$p[] = "debugStep=4b";
}
$params = implode(";", $p);

$url = sprintf("%ssearch?%s", $config['xtf'], $params);

$xml = new DOMDocument();
if ($xml->load($url) == false) {
	die('problem with database.');
}

?>
<!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<title>Search results : Campus Publications : The University of Chicago</title>
	<?php include "../includes/head.php"; ?>
</head>
<body>
	<?php include "../includes/header.php"; ?>

<div class="container" id="content">
<div class="row">

<?php if (array_key_exists('browse-category', $clean)): ?>

	<div class="span8 offset3">
		<h1>
			<?php
				switch ($clean['browse-category']) {
					case 'student':
						print 'Browse Student Titles';
						break;
					case 'university':
						print 'Browse University Titles';
						break;
				}
			?>
		</h1>
		<?php print get_browse($xml, $clean['browse-category']); ?>
	</div><!--/span8-->

<?php elseif (array_key_exists('browse-date', $clean)): ?>

	<div class="span8 offset3">
		<h1>Browse Dates</h1>
		<?php print get_browse_date($xml); ?>
	</div><!--/span8-->

<?php elseif (array_key_exists('f1-category', $clean)): ?>

	<div class="span3">
		<?php print get_browse_facets($xml); ?>
	</div><!--/span3-->
	<div class="span9">
		<h1><?php print array_pop(explode(':', $clean['f1-category'])); ?></h1>
		<?php print get_browse2($xml); ?>
	</div><!--/span9-->

<?php else: ?>

	<?php if (has_search_results($xml)): ?>
	<div class="span3">
		<?php print get_facets($xml); ?>
	</div>
	<div class="span9">
        <?php $title = get_keyword($xml); if ($title !== ''): $title = sprintf("Search results for \"%s\"", $title); else: $title = 'Search results'; endif; ?>
		<h1><?php print htmlspecialchars($title); ?></h1>
		<?php print get_pager($xml); ?>
		<?php print get_html($xml); ?>
		<?php print get_pager($xml); ?>
	</div><!--/span9-->
	<?php else: ?>
	<div class="span8 offset3">
		<h1>No search results</h1>
		<p>Please try again.</p>
	</div><!--/span9-->
	<?php endif; ?>

<?php endif; ?>

</div><!--/row-->
</div><!--/container-->

	<?php include "../includes/footer.php"; ?>
</body>
</html>


