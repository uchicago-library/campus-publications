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

function trim1(str) {
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function jej_unescape(s) {
	return unescape(s.replace(/\+/g, ' '));
}

function queryString() {
	var queryString = new Array();
	var parameters = window.location.search.substring(1);
	if (parameters != '') {
		parameters = parameters.split('&');
		var i = 0;
		while (i < parameters.length) {
			var pos = parameters[i].indexOf('=');
			if (pos > 0) {
				var paramname = parameters[i].substring(0,pos);
				var paramval = jej_unescape(parameters[i].substring(pos + 1));
				queryString.push([paramname, paramval]);
			} else {
				queryString.push([parameters[i], null]);
			}
			i++;
		}
	}
	return queryString;
}

$(document).ready(function() {
	$('#navbrowse').mouseover(function() {
		$('#subnavbrowse').show();
	});
	$('#navbrowse').mouseout(function() {
		$('#subnavbrowse').hide();
	});

	/* 
	 * When you have selected something in the sidebar, these links show up.
	 */
	$('.backurl').each(function() {
		// find the previous h2
		var title = $(this).parent('li').parent('ul').prev('h2').text();
		if (title == 'Dates') {
			var key = 'f1-date';
		}
		if (title == 'Titles') {
			var key = 'f1-title';
		}
		if (title == 'Volumes') {
			var key = 'f1-volume';
		}

		// get an array of the params.
		var params = $(this).attr('href').split('?')[1].split('&');

		var tmp = new Array();

		var p = 0;
		while (p < params.length) {
			if (params[p].indexOf(key) == -1) {
				tmp.push(params[p]);
			}
			p++;
		}
	
		var urlbeginning = $(this).attr('href').split('?')[0];	
		$(this).attr('href', urlbeginning + '?' + tmp.join('&'));
	});

	/*
	 * Expandable links in browse lists.
	 */

	var categories = {};

	$('ul.expandable li').each(function() {
		/* 
		 * The category is everything leading up to the first comma in
		 * the title.
		 */
		var c = $(this).text().split(',')[0].replace(/^\s\s*/, '').replace(/\s\s$/, '');

		/*
		 * If we don't already know about this category, add it to the
		 * data structure. Then, add the text and href for each link.
		 */
		if (!(c in categories)) {
			categories[c] = new Array();
		}
	
		categories[c].push({
			"text": $(this).text(),
			"href": $(this).find('a').attr('href')
		});
	});

	$('ul.expandable').empty();

	/* var sortable = []; for (var c in categories) { sortable.push(c); } sortable.sort(); */
	for (var c in categories) {
		// Some categories only have one entry.
		if (categories[c].length == 1) {
			$('ul.expandable').append(
				$('<li><a href="' + categories[c][0]['href'] + '">' + categories[c][0]['text'] + '</a></li>')
			);
		// Others have multiple entries.
		} else {
			var li = $('<li><a href="#">' + c + '</a></li>');
			$('ul.expandable').eq(0).append(li);

			var newlist = $('<ul></ul>');
			for (var i = 0; i < categories[c].length; i++) {
				var t = categories[c][i]['text'].replace(/^[^,]*, /, '');
				newlist.append(
					$('<li><a href="' + categories[c][i]['href'] + '">' + t + '</a></li>')
				);
			}
			li.append(newlist);
		}
	}

	/* 
	 * Add an 'expandable' link before every li that contains a ul. 
	 */
	$('ul.expandable li').each(function() {
		if ($(this).children('ul').length > 0) {
			$(this).children('a').before('<span class="expand"><img src="/images/collapsed.gif"/></span>');
		}
	});

	/* Hide expandable stuff. */
	$('ul.expandable ul').each(function() {
		$(this).hide();
	});

	/* Let visitors click the text itself instead of just the plus or
	 * minus signs.
	 */
	$('ul.expandable a').click(function(e) {
		if ($(this).attr('href') == '#') {		
			$(this).parents('li').eq(0).children('span.expand').eq(0).trigger('click');
			e.preventDefault();
		}
	});

	/* 
	 * Set up 'toggling' - when you click the plus sign, the contents show or hide.
	 */
	$('.expand').click(function(e) {
		var ul = $(e.target).parents('li').eq(0).children('ul').eq(0);
		ul.toggle();
		console.log($(this));
		if (ul.is(':visible')) {
			$(this).find('img').attr('src', '/images/expanded.gif');
		} else {
			$(this).find('img').attr('src', '/images/collapsed.gif');
		}
	});

	/*
	 * In advanced search, indent checkboxes.
	 */
	$('div.advancedsearchcheckboxes').each(function() {
		var div = $(this);

		var groups = {};
		// for each checkbox.
		$(this).find('input[type="checkbox"]').each(function() {
			// the group is what's before the first comma.
			var group = trim1($(this).attr('value').split(',')[0]);
			// make a spot for this group in my data structure if I need it.
			if (groups[group] == undefined) {
				groups[group] = new Array();
			}
			
			// add this value to the appropriate group.
			groups[group].push($(this).attr('value'));
		});

		// clear out all checkboxes. 
		$(this).empty();

		if (div.hasClass('advancedsearchbox')) {
			var g = 11;
		} else {
			var g = 1;
		}
		for (group in groups) {
			if (groups[group].length == 1) {
				var e = $('<input></input>');
				e.attr('type', 'checkbox');
				e.attr('name', 'f' + g + '-title');
				e.attr('value', groups[group][0]);
				$(this).append(e);

				$(this).append(' ' + groups[group][0]);
				$(this).append('<br/>');
			}
			if (groups[group].length > 1) {
				var classname = group + 'checkboxes';
				var e = $('<input></input>');
				e.addClass('checkboxcontroller');
				e.attr('type', 'checkbox');
				e.attr('value', groups[group][0]);
				$(this).append(e);

				$(this).append(' ' + group);
				$(this).append('<br/>');

				$.each(groups[group], function(i, v) {
					var e = $('<input></input>');
					e.addClass('indent');
					e.addClass(classname);
					e.attr('type', 'checkbox');
					e.attr('name', 'f' + g + '-title');
					e.attr('value', v);
					div.append(e);

					var text = v.replace(/^[^,]*, /, ' ...');
					div.append(text);

					div.append('<br/>');
				});
			}
			g++;
		}
	});

	/*
	 * Advanced search, select or deselect all checkboxes.
	 */
	$('.selectall').click(function(e) {
		$(this).parent('p').prev('div.advancedsearchcheckboxes').find('input').prop('checked', true);
		e.preventDefault();
	});
	$('.deselectall').click(function(e) {
		$(this).parent('p').prev('div.advancedsearchcheckboxes').find('input').prop('checked', false);
		e.preventDefault();
	});

	/*
	 * Advanced search, toggle the next checkboxes.
	 */
	$('.checkboxcontroller').click(function() {
		if ($(this).attr('checked')) {
			$(this).nextUntil('.checkboxcontroller', 'input').prop('checked', true);
		} else {
			$(this).nextUntil('.checkboxcontroller', 'input').prop('checked', false);
		}
	});

	/*
	 * Intercept form submit. 
	 * get the form values.
	 * remove the f1-title.
	 * step through 
	$('#advancedsearchform').submit(function(e) {
	});
	 */

});

	/*
	$('#sidebarfacets input').change(function() {
		$(this).closest('form').submit();
	});
	*/

	/*
	$('.selectall').click(function(e) {
		e.preventDefault();
		$('input[type="checkbox"]').prop('checked', true);
	});
	$('.deselectall').click(function(e) {
		e.preventDefault();
		$('input[type="checkbox"]').prop('checked', false);
	});
	*/

