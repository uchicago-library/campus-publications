<?php

require_once('../config.php');

function get_checkboxes() {
    global $config;
	$xml = new DOMDocument();
	//$xml->load(sprintf("%ssearch?browse-category=university&debugStep=4b", $config['xtf']));
	$xml->load(sprintf("%ssearch?browse-category=all&debugStep=4b", $config['xtf']));

	$x = new DOMDocument();
	$x->load("advanced.xsl");
	$xsl = new XSLTProcessor();
	$xsl->importStylesheet($x);
	return $xsl->transformToXML($xml);
}

?>
<!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>The University of Chicago Campus Publications</title>
	<?php include "../includes/head.php"; ?>
</head>
<body>
	<?php include "../includes/header.php"; ?>

<div class="container" id="content">

<form action="/search/" id="advancedsearchform" method="get">

<div class="row">
<div class="span5">

	<fieldset>
		<h3>Search</h3>
		<p>
			<label for="text" style="display: none;">Text</label>
			<input type="text" id="text" name="text" size="34" value="" />

		<br/>

			<select name="text-field">
				<option value="text">search full text</option>
				<option value="title">search titles</option>
			</select>
		</p>
		<p style="margin-left: 10px;">
			<label>
				<input type="radio" name="text-join" value="" checked="checked" /> all of 
			</label>
			<label>
				<input type="radio" name="text-join" value="or" /> any of these words
			</label>
		</p>
		<p style="margin-left: 15px;">
			<label>
				within
				<select class="span1" size="1" name="text-prox">
					<option value="" selected="selected"></option>
					<option value="1">1</option>
					<option value="2">2</option>
					<option value="3">3</option>
					<option value="4">4</option>
					<option value="5">5</option>
					<option value="10">10</option>
					<option value="20">20</option>
				</select> word(s)
			</label>
		</p>
	</fieldset>
	<h3>
		<label for="text-exclude">Exclude</label>
	</h3>
	<p>
		<input type="text" id="text-exclude" name="text-exclude" size="20" value="" />
	</p>
	<fieldset>
		<h3>Year range</h3>
		<p>
			<label for="year" style="display: none;">From</label>
			<input class="span1" id="year" name="year" size="4" type="text" />
			<label style="display: inline;"> 
				to 
				<input class="span1" name="year-max" size="4" type="text" />
			</label>
		</p>
	</fieldset>

</div><!--/span5-->
<div class="span7">

<div class="sidebarbox">

<h2>Hints for Advanced Searching</h2>

<dl class="searchhints">
	<dt>Exact phrase</dt>
	<dd>" " matches text exactly, e.g. <em>"Chicago commerce"</em> won't match <em> commerce in Chicago</em></dd>

	<dt>Wildcards</dt>
	<dd><em>?</em> matches one character, <em>*</em> matches zero or more characters, e.g., <em>wom?n work*</em></dd>

	<dt>Within</dt>
	<dd>Limits results to when the search terms occur within <em>x</em> number of words of each other.</dd>

	<dt>Exclude</dt>
	<dd>Eliminates results where the excluded word occurs on the same page as the search terms.</dd>

	<dt>Year range</dt>
	<dd>Only matches the search terms when they occur within issues published in the specified years.</dd>
</dl>

<p><a href="/search?browse-category=university">Browse all University titles</a></p>

</div><!--/sidebarbox-->

</div><!--/span7-->
</div><!--/row-->

<div class="row">
<div class="span12">
	<?php print get_checkboxes(); ?>

	<p>
		<input type="hidden" name="smode" value="advanced" />
		<input type="submit" value="Search" />
	</p>
</div><!--/span12-->
</div><!--/row-->

</form>

</div><!--/container-->

	<?php include "../includes/footer.php"; ?>

</body>
</html>
