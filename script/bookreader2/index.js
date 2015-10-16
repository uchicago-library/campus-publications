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
	$('#sidebarfacets input').change(function() {
		$(this).closest('form').submit();
	});
	*/

	/* Add an 'expandable' link before every li that contains a ul. */
	/*
	$('ul.expandable li').each(function() {
		if ($(this).children('ul').length > 0) {
			$(this).children('input').before('<span class="expand"><a href="#">+</a></span>');
		}
	});
	*/

	/* Hide all ul's that don't have any checked items. */
	/*
	$('ul.expandable ul').each(function() {
		if ($(this).find('input:checked').length == 0) {
			$(this).hide();
		}
	});
	*/

	/* Super fancy de-selectable radio buttons!!! */
	/*
	$('ul.expandable input:radio').click(function(e) {
		if ($(this).hasClass('on')) {
			$(this).removeAttr('checked');
		}
		
		var name = $(this).attr('name');
		$('input[name="' + name + '"]').each(function() {
			if ($(this).is(':checked')) {
				$(this).addClass('on');
			} else {
				$(this).removeClass('on');
			}
		});
	});
	*/

	/* Set up 'toggling' - when you click the plus sign, the contents show or hide. */
	/*
	$('.expand').click(function(e) {
		var ul = $(e.target).parents('li').eq(0).children('ul').eq(0);
		ul.toggle();
		if (ul.is(':visible')) {
			$(e.target).text('-');
		} else {
			$(e.target).text('+');
		}
	});
	*/
});
