$.fn.textNodes = function() {
	var ret = [];
	$.each(this[0].childNodes, function() {
		if (this.nodeType == 3 || $.nodeName(this, "br")) {
			ret.push(this);
		} else {
			$.each(this.childNodes, arguments.callee);
		}
	});
	return $(ret);
}

function jej_unescape(s) {
	return unescape(s.replace(/\+/g, ' '));
}

function queryString() {
	var queryString = {};
	var parameters = window.location.search.substring(1);
	if (parameters != '') {
		parameters = parameters.split(';');
		var i = 0;
		while (i < parameters.length) {
			var pos = parameters[i].indexOf('=');
			if (pos > 0) {
				var paramname = parameters[i].substring(0,pos);
				var paramval = jej_unescape(parameters[i].substring(pos + 1));
				queryString[paramname] = paramval;
			} else {
				queryString[paramname] = null;
			}
			i++;
		}
	}
	return queryString;
}

function addToParams(param, value) {
	var url = window.location.href;
	if (url.indexOf('?') > -1) {
		url = url.substring(0, url.indexOf('?'));
	}
	
	var params = queryString();
	delete params['browse-all'];
	params[param] = value;

	var query = [];
	for (var key in params) {
		query.push(key + '=' + params[key]);
	}
	
	return url + '?' + query.join(';');
}

$(document).ready(function() {
	$('#navbrowse').mouseover(function() {
		$('#subnavbrowse').show();
	});
	$('#navbrowse').mouseout(function() {
		$('#subnavbrowse').hide();
	});

	/* Add a link that lets you sort facets in ascending and 
	 * descending order.
 	 */

	$('.sortableFacet').each(function() {
		$(this).append(" <a href='#'>[sort]</a>"); 
	});

	/* Actually do the sorting- really, it's just reversing
 	 * the elements. There is a div.facetGroup after this element,
	 * and there is a table inside that. I want to
	 * sort the tr elements by the value in td.col2.
	 * First, count the number of rows. Then,
 	 * move the last one before the first one that
 	 * number of times. 
	 */

	$('.sortableFacet a').click(function() {
		var tbody = $(this).parent('.sortableFacet').next('.facetGroup').find('tbody');

		/* Only do this on the year view. If a year is "open"
	 	 * and months are visible, bail out. 
		 */
		$(tbody).find('.col2').each(function() {
			if (!/^[0-9]*$/.test($(this).text())) {
				return false;
			}
			
		});

		var count = $(tbody).find('tr').length;

		var c = 1;
		while (c <= count) {
			$(tbody).find('tr').first().before(
				$(tbody).find('tr').eq(c)
			);
			c++;
		}
		return false;
	});

	/* Add sort link to browse.
	 */

	$('.sortableBrowse').each(function() {
		$(this).append(" <a href='#'>[sort]</a>");
	});

	/* Actually sort the browse.
	 */

	$('.sortableBrowse a').click(function() {
		var ul = $(this).parent('.sortableBrowse').next('ul');

		var count = $(ul).find('li').length;

		var c = 1;
		while (c <= count) {
			$(ul).find('li').first().before(
				$(ul).find('li').eq(c)
			);
			c++;
		}
		return false;
	});

	/* Temporary hack. if we go to the browse page that
	 * is built into XTF, erase the results from the page. This
	 * lets us see what a 'true' browse would look like without
	 * modifying XTF too much. 
 	 */
	if (window.location.href.indexOf('browse-all=yes') !== -1 && window.location.href.indexOf('f1-date') == -1) {
		$('td.docHit').empty();
	}

	/* In td.facet, add the facet sidebar. 
	 * <h2>Date [sort]</h2>
	 * <ul><li... with class expandable, etc.
 	 */

	var url = '';
	if (window.location.href.indexOf("keyword") > -1) {
		url = window.location.href + "&debugStep=4b";
	} else {
		url = "/xtf/search?browse-all=yes&debugStep=4b";
	}

	$.ajax({
		type: "GET",
		url: url,
		success: function(xml) {
			/* on page load, hide the facets that aren't in the url. */
			var params = queryString();
			$('ul.expandable li').each(function() {
				/* only process li's that contain ul's. */
				if ($(this).children('ul').length = 0) {
					return;
				}
				/* if there is an active date facet... */
				if ('f1-date' in params) {
					/* ... and if the link we're looking at contains the year, do nothing. */
					var year = params['f1-date'].split('::')[0];
					if ($(this).find('a').length && $(this).find('a').attr('href').indexOf(year) > -1) {
						return;
					}
				}
				/* fall through. Hide everything else. */
				$(this).children('ul').hide();
			});

			/* Add 'expandable' or 'collapsible' links before every li that contains a ul. */
			$('ul.expandable li').each(function() {
				if ($(this).children('ul').length > 0) {
					if ($(this).children('ul').is(':visible')) {
						$(this).prepend('<a class="iconexpandable iconexpandablecollapsed" href="#"><img alt="expand" src="/xtf/icons/default/i_colpse.gif"/></a>');
					} else {
						$(this).prepend('<a class="iconexpandable iconexpandableexpanded" href="#"><img alt="collapse" src="/xtf/icons/default/i_expand.gif"/></a>');
					}
				}
			});

			/* Highlight the active year and month. */
			if ('f1-date' in params) {
				var f1date = params['f1-date'];
				if (f1date.indexOf('::') == -1) {
					$('ul.expandable li a[href*="' + f1date + '"]').first().contents().unwrap().wrap('<strong/>');
				} else {
					$('ul.expandable li a[href*="' + f1date + '"]').last().contents().unwrap().wrap('<strong/>');
				}
			}

			/* Add click events for the expandable boxes. */
			$('a.iconexpandable').click(function(event) {
				event.preventDefault();
				if ($(this).hasClass('iconexpandableexpanded')) {
					$(this).parent('li').children('ul').show();
					$(this).removeClass('iconexpandableexpanded');
					$(this).addClass('iconexpandablecollapsed');
					$(this).find('img').attr('src', '/xtf/icons/default/i_colpse.gif');
					$(this).find('img').attr('alt', 'collapse');
				} else {
					$(this).parent('li').children('ul').hide();
					$(this).removeClass('iconexpandablecollapsed');
					$(this).addClass('iconexpandableexpanded');
					$(this).find('img').attr('src', '/xtf/icons/default/i_expand.gif');
					$(this).find('img').attr('alt', 'expand');
				}
			});
		}
	});
});

