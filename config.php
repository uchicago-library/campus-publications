<?php

/*
 * Be sure to grep for hardcoded occurrences of these
 * urls. Some javascript files or XSL files may include
 * them.
 */

// original development backend:
//'xtf' => 'http://xtf.lib.uchicago.edu:8180/campub/'

// original production backend:
// 'xtf' => 'http://campub-xtf.lib.uchicago.edu/xtf/',

// route connections to the XTF backend through this server to avoid
// http/https issues.
$config = array(
    'xtf' => 'https://campub.lib.uchicago.edu/campub/'
);

?>
