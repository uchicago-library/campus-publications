/* 
 * TODO:
 * 
 * keyboard controls:
 * acrobat command: enter is next screen. shift/enter is previous screen.
 * first page is home (fn + left). last page is end (fn + right).
 * zoom in is ctrl + equals.
 * zoom out is ctrl + hyphen.
 * from here, how can I get information about the current page turning object?
 * I want to get the current page, and the height of the current page. 
 */

/*
 * FUNCTIONS
 */

function getUrlVars() {
	var vars = [], hash;
	var hashes = '';
	hashes = window.location.href.slice(window.location.href.indexOf('?') + 1);
	if (hashes.indexOf('#') > -1) {
		hashes = hashes.slice(0, hashes.indexOf('#'));
	}
	hashes = hashes.split(';');
	
	for (var i = 0; i < hashes.length; i++) {
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = decodeURIComponent(hash[1]);
	}
	return vars;
}

function getObjectNumber() {
	var chunks = document.location.hash.substring(1).split('/');
	var i = 0;
	while (i < chunks.length) {
		if (chunks[i] == 'page') {
			return chunks[i+1];
		}
		i++;
	}
}

/* Set up some JavaScript to keep from mangling the urls. XSLT was url-encoding forward slashes. 
 * So this whole thing is pretty much a hack. 
 * Is this really necessary? How does the one from the internet archive work?
 */
$('#searchinside').submit(function(e) {
	e.preventDefault();

	var url = window.location.href;
	var url = url.substr(0, url.indexOf('#') + 1);

	var params = br.paramsFromFragment(window.location.hash);

	var fragment = br.fragmentFromParams(params).split('/');
	fragment.push('search');
	fragment.push($(e.target).find("input[name='query']").val());
	fragment = fragment.join('/');

	window.location = url + '/' + fragment;
});

/*
 * MAIN
 */

// Document ID, from URL parameters
var docId = getUrlVars()['docId'];

// split on '/' and get the second chunk. 
var id = docId.split('/')[1];

// Bookreader object
var br;

// METS data for the item we're looking at. (phasing this out.)
var bookreaderXML;

// JSON data for the item we're looking at. 
var bookreaderJSON;

// JEJ HACK
var q = 'inside.php?docId=' + docId;
if (getUrlVars()['query'] != '') {
	q = q + '&q=' + getUrlVars()['query'];
}
if ('query-exclude' in getUrlVars() && getUrlVars()['query-exclude'] != '') {
	q += '&query-exclude=';
	q += escape(getUrlVars()['query-exclude']);
}
if ('query-join' in getUrlVars() && getUrlVars()['query-join'] != '') {
	q += '&query-join=';
	q += escape(getUrlVars()['query-join']);
}
if ('query-prox' in getUrlVars() && getUrlVars()['query-prox']) {
	q += '&query-prox=';
	q += escape(getUrlVars()['query-prox']);
}

$.ajax({
	dataType: 'jsonp',
	url: q, 
	success: function(json) { 

	/* put this in a global variable. */
	bookreaderJSON = json;
	
	br = new BookReader();

	br.logoURL = 'http://moss.lib.uchicago.edu/';

BookReader.prototype.initToolbar = function(mode, ui) {
    if (ui == "embed") {
        return; // No toolbar at top in embed mode
    }

    // $$$mang should be contained within the BookReader div instead of body
    var readIcon = '';
    if (!navigator.userAgent.match(/mobile/i)) {
        readIcon = "<button class='BRicon read modal'></button>";
    }
    
    $("#BookReader").append(
          "<div id='BRtoolbar'>"
        +   "<span id='BRtoolbarbuttons'>"
        +     "<form action='javascript:br.search($(\"#textSrch\").val());' id='booksearch'>"
        +     "<label for='textSrch' style='position: absolute; left: -9999px;'>Search inside</label>"
        +     "<input type='search' id='textSrch' name='keyword' val='' tabindex='2' placeholder='Search inside'/>"
        +     "<input type='hidden' name='text' val=''/>"
        +     "<input type='hidden' name='text-exclude' val=''/>"
        +     "<input type='hidden' name='text-join' val=''/>"
        +     "<input type='hidden' name='text-prox' val=''/>"
        +     "<button type='submit' id='btnSrch' name='btnSrch' tabindex='2'>GO</button>"
        +     "</form>"
        //+     "<button class='BRicon play'></button>"
        //+     "<button class='BRicon pause'></button>"
        +     "<button class='BRicon info' tabindex='2'></button>"
        +     "<button class='BRicon share' tabindex='2'></button>"
        //+     readIcon
        //+     "<button class='BRicon full'></button>"
        +   "</span>"
        +   "<span id='breadcrumbs'></span>"
        //+   "<span id='BRreturn'><a></a></span>"
        +   "<div id='BRnavCntlTop' class='BRnabrbuvCntl'></div>"
        + "</div>"
        /*
        + "<div id='BRzoomer'>"
        +   "<div id='BRzoompos'>"
        +     "<button class='BRicon zoom_out'></button>"
        +     "<div id='BRzoomcontrol'>"
        +       "<div id='BRzoomstrip'></div>"
        +       "<div id='BRzoombtn'></div>"
        +     "</div>"
        +     "<button class='BRicon zoom_in'></button>"
        +   "</div>"
        + "</div>"
        */
        );

    // Browser hack - bug with colorbox on iOS 3 see https://bugs.launchpad.net/bookreader/+bug/686220
    if ( navigator.userAgent.match(/ipad/i) && $.browser.webkit && (parseInt($.browser.version, 10) <= 531) ) {
       $('#BRtoolbarbuttons .info').hide();
       $('#BRtoolbarbuttons .share').hide();
    }

    $('#BRreturn a').attr('href', this.bookUrl).text(this.bookTitle);

    $('#BRtoolbar .BRnavCntl').addClass('BRup');
    $('#BRtoolbar .pause').hide();    
    
    this.updateToolbarZoom(this.reduce); // Pretty format
        
    if (ui == "embed" || ui == "touch") {
        $("#BookReader a.logo").attr("target","_blank");
    }

    // $$$ turn this into a member variable
    var jToolbar = $('#BRtoolbar'); // j prefix indicates jQuery object
    
    // We build in mode 2
    jToolbar.append();
        
    // Hide mode buttons and autoplay if 2up is not available
    // $$$ if we end up with more than two modes we should show the applicable buttons
    if ( !this.canSwitchToMode(this.constMode2up) ) {
        jToolbar.find('.two_page_mode, .play, .pause').hide();
    }
    if ( !this.canSwitchToMode(this.constModeThumb) ) {
        jToolbar.find('.thumbnail_mode').hide();
    }
    
    // Hide one page button if it is the only mode available
    if ( ! (this.canSwitchToMode(this.constMode2up) || this.canSwitchToMode(this.constModeThumb)) ) {
        jToolbar.find('.one_page_mode').hide();
    }
    
    // $$$ Don't hardcode ids
    var self = this;
    jToolbar.find('.share').colorbox({inline: true, opacity: "0.5", href: "#BRshare", onLoad: function() { self.autoStop(); self.ttsStop(); } });
    jToolbar.find('.info').colorbox({inline: true, opacity: "0.5", href: "#BRinfo", onLoad: function() { self.autoStop(); self.ttsStop(); } });

    $('<div style="display: none;"></div>').append(this.blankShareDiv()).append(this.blankInfoDiv()).appendTo($('body'));

    //$('#BRinfo .BRfloatTitle a').attr( {'href': this.bookUrl} ).text(this.bookTitle).addClass('title');
    
    // These functions can be overridden
    this.buildInfoDiv($('#BRinfo'));
    this.buildShareDiv($('#BRshare'));
    
    // Switch to requested mode -- binds other click handlers
    //this.switchToolbarMode(mode);
    
}

	br.initNavbar = function() {
	    // Setup nav / chapter / search results bar
    
	    $('#BookReader').append(
	        '<div id="BRnav">'
	        +     '<div id="BRpage">'   // Page turn buttons
                +         '<form id="jumptopageform">'
                +             '<label for="jumptopage" style="position: absolute; left: -9999px;">Jump to page</label>'
                +             '<input id="jumptopage" placeholder="pg. 1" tabindex="4" type="search"/>'
                +             '<button type="submit" tabindex="4">GO</button>'
                +         '</form>'
	        +         '<button class="BRicon onepg" tabindex="4"></button>'
	        +         '<button class="BRicon twopg" tabindex="4"></button>'
	        +         '<button class="BRicon thumb" tabindex="4"></button>'
	        // $$$ not yet implemented
	        //+         '<button class="BRicon fit"></button>'
	        +         '<button class="BRicon zoom_in" tabindex="4"></button>'
	        +         '<button class="BRicon zoom_out" tabindex="4"></button>'
	        +         '<button class="BRicon book_left" tabindex="4"></button>'
	        +         '<button class="BRicon book_right" tabindex="4"></button>'
	        +     '</div>'
	        +     '<div id="BRnavpos">' // Page slider and nav line
	        //+         '<div id="BRfiller"></div>'
	        +         '<div id="BRpager"></div>'  // Page slider
	        +         '<div id="BRnavline">'      // Nav line with e.g. chapter markers
	        +             '<div class="BRnavend" id="BRnavleft"></div>'
	        +             '<div class="BRnavend" id="BRnavright"></div>'
	        +         '</div>'     
	        +     '</div>'
	        +     '<div id="BRnavCntlBtm" class="BRnavCntl BRdn"></div>'
	        + '</div>'
	    );
    
	    var self = this;
	    $('#BRpager').slider({    
	        animate: true,
	        min: 0,
	        max: this.numLeafs - 1,
	        value: this.currentIndex()
	    })
	    .bind('slide', function(event, ui) {
	        self.updateNavPageNum(ui.value);
	        $("#pagenum").show();
	        return true;
	    })
	    .bind('slidechange', function(event, ui) {
	        self.updateNavPageNum(ui.value); // hiding now but will show later
	        $("#pagenum").hide();
	        
	        // recursion prevention for jumpToIndex
	        if ( $(this).data('swallowchange') ) {
	            $(this).data('swallowchange', false);
	        } else {
	            self.jumpToIndex(ui.value);
	        }
	        return true;
	    })
	    .hover(function() {
	            $("#pagenum").show();
	        },function(){
	            // XXXmang not triggering on iPad - probably due to touch event translation layer
	            $("#pagenum").hide();
	        }
	    );
	    
	    //append icon to handle
	    var handleHelper = $('#BRpager .ui-slider-handle')
	    .append('<div id="pagenum"><span class="currentpage"></span></div>');
	    //.wrap('<div class="ui-handle-helper-parent"></div>').parent(); // XXXmang is this used for hiding the tooltip?
	    
	    this.updateNavPageNum(this.currentIndex());
	
	    $("#BRzoombtn").draggable({axis:'y',containment:'parent'});
	    
	    /* Initial hiding
	        $('#BRtoolbar').delay(3000).animate({top:-40});
	        $('#BRnav').delay(3000).animate({bottom:-53});
	        changeArrow();
	        $('.BRnavCntl').delay(3000).animate({height:'43px'}).delay(1000).animate({opacity:.25},1000);
	    */
	}

	br.jumpToPage = function(pageNum) {
	    // Only work with the digits- nothing like "pg."
	    pageNum = pageNum.replace(/[^\d]/g, '');

	    var pageIndex = br.paramsFromCurrent()['index'];

            var i = pageIndex + 1;
	    while (i < bookreaderJSON['pages'].length) {
	        // just get the numbers from this thing. 
	        var p = parseInt(String(bookreaderJSON['pages'][i]['humanReadableLeafNum']).replace(/[^\d]/g, ''));
		if (p == pageNum) {
	            br.jumpToIndex(bookreaderJSON['pages'][i]['leafNum'] - 1);
	        }
	        i++;
	    }

	    i = 0;
	    while (i < pageIndex) {
	        // just get the numbers from this thing. 
	        var p = parseInt(String(bookreaderJSON['pages'][i]['humanReadableLeafNum']).replace(/[^\d]/g, ''));
		if (p == pageNum) {
	            br.jumpToIndex(bookreaderJSON['pages'][i]['leafNum'] - 1);
	        }
	        i++;
	    }

	    // Page not found
	    return false;
	}

	br.search = function(term) {
   		 $('#textSrch').blur(); //cause mobile safari to hide the keyboard     
    
		var url  = '/view/inside.php?docId=';
		    url += getUrlVars()['docId'];
		    url += '&q=';
    		    url += escape(term);
                    if ('query-exclude' in getUrlVars()) {
                        url += '&query-exclude=';
                        url += escape(getUrlVars()['query-exclude']);
                    }
                    if ('query-join' in getUrlVars()) {
                        url += '&query-join=';
                        url += escape(getUrlVars()['query-join']);
                    }
                    if ('query-prox' in getUrlVars()) {
                        url += '&query-prox=';
                        url += escape(getUrlVars()['query-prox']);
                    }
    
    		term = term.replace(/\//g, ' '); // strip slashes, since this goes in the url
    		this.searchTerm = term;
    
    		this.removeSearchResults();
    		this.showProgressPopup('<img id="searchmarker" src="'+this.imagesBaseURL + 'marker_srch-on.png'+'"> Search results will appear below...');
    		$.ajax({url:url, dataType:'jsonp', success:br.BRSearchCallback});    
	}

	br.BRSearchCallback = function(results) {
		//console.log('got ' + results.matches.length + ' results');
		br.removeSearchResults();
		br.searchResults = results; 
		//console.log(br.searchResults);
    
		if (0 == results.matches.length) {
			var errStr  = 'No matches were found.';
			var timeout = 1000;
			if (false === results.indexed) {
				errStr  = "<p>This book hasn't been indexed for searching yet. We've just started indexing it, so search should be available soon. Please try again later. Thanks!</p>";
				timeout = 5000;
			}
			$(br.popup).html(errStr);
			setTimeout(function(){
				$(br.popup).fadeOut('slow', function() {
					br.removeProgressPopup();
				})        
			},timeout);
			return;
		}
   
		var pages = new Array();
		var i;    
		for (i=0; i<results.matches.length; i++) {        
			var page = results.matches[i].par[0].page;
			if (pages.indexOf(page) < 0) {
				br.addSearchResult(results.matches[i].text, br.leafNumToIndex(results.matches[i].par[0].page));
			}
			pages.push(page);
		}
		br.updateSearchHilites();
		br.removeProgressPopup();
	}

	/* In the original code they only had key handlers set up for 2up mode.
	 * Their comments said that the browser handled paging in other modes-
	 * but that didn't work in any browser I tried. So here I just 
	 * remove their comments.
	 */
	br.setupKeyListeners = function() {
	    var self = this;
	    
	    var KEY_PGUP = 33;
	    var KEY_PGDOWN = 34;
	    var KEY_END = 35;
	    var KEY_HOME = 36;

	    var KEY_LEFT = 37;
	    var KEY_UP = 38;
	    var KEY_RIGHT = 39;
	    var KEY_DOWN = 40;

	    // We use document here instead of window to avoid a bug in jQuery on IE7
	    $(document).keydown(function(e) {
    
	        // Keyboard navigation        
	        if (!self.keyboardNavigationIsDisabled(e)) {
	            switch(e.keyCode) {
	                case KEY_PGUP:
	                case KEY_UP:            
                		e.preventDefault();
                        	self.prev();
               			break;
   	             case KEY_DOWN:
        	        case KEY_PGDOWN:
				e.preventDefault();
				self.next();
				break;
   	             case KEY_END:
				e.preventDefault();
				self.last();
				break;
   	             case KEY_HOME:
				e.preventDefault();
				self.first();
				break;
        	        case KEY_LEFT:
				e.preventDefault();
				self.left();
				break;
   	             case KEY_RIGHT:
				e.preventDefault();
				self.right();
				break;
     	       }
     	   }
   	 });
	}

	br.leafNumToIndex = function(n) {
		return n - 1;
	}

	br.updateNavPageNum = function(index) {
	    var pageNum = this.getHumanReadablePageNum(index);
	    var pageStr;
	    if (pageNum[0] == 'n') { // funny index
		pageStr = index + 1 + ' / ' + this.numLeafs; // Accessible index starts at 0 (alas) so we add 1 to make human
	    } else {
		pageStr = 'Page ' + pageNum;
	    }
	    
	    $('#pagenum .currentpage').text(pageStr);

            // JEJ $('#pageview').val(window.location.href + '');
	}

	br.updateLocationHash = function() {
		var newHash = '#' + this.fragmentFromParams(this.paramsFromCurrent());
		window.location.replace(newHash);
    
		// This is the variable checked in the timer.  Only user-generated changes
		// to the URL will trigger the event.
		this.oldLocationHash = newHash;

		// update the 'share this page' text input. 

		var bookView = 'http://pi.lib.uchicago.edu/1001/dig/campub/' + getUrlVars()['docId'];
		var pageView = bookView + '/' + getObjectNumber();

		$('#pageview').val(pageView);
	}

	br.getPageWidth = function(index) {
		if (index < bookreaderJSON['pages'].length) {
			return parseInt(bookreaderJSON['pages'][index]['x']);
		} else {
			return parseInt(bookreaderJSON['pages'][0]['x']);
		}
	}

	br.getPageHeight = function(index) {
		if (index < 0) {
			index = 0;
		}
		if (index < bookreaderJSON['pages'].length) {
			return parseInt(bookreaderJSON['pages'][index]['y']);
		} else {
			return parseInt(bookreaderJSON['pages'][0]['y']);
		}
	}

	br.getPageURI = function(index, reduce, rotate) {
		var id = getUrlVars()['docId'];
		return 'http://xtf.lib.uchicago.edu:8180/campub/data/bookreader/' + id + '/' + bookreaderJSON['pages'][index]['imgFile'];
	}

	br.getPageSide = function(index) {
		if (index % 2 == 0) {
			return 'R';
		} else {
			return 'L';
		}
	}

	br.getSpreadIndices = function(pindex) {   
		var spreadIndices = [null, null]; 
		if ('rl' == this.pageProgression) {
			if (this.getPageSide(pindex) == 'R') {
				spreadIndices[1] = pindex;
				spreadIndices[0] = pindex + 1;
			} else {
				spreadIndices[0] = pindex;
				spreadIndices[1] = pindex - 1;
			}
		} else {
			if (this.getPageSide(pindex) == 'L') {
				spreadIndices[0] = pindex;
				spreadIndices[1] = pindex + 1;
			} else {
				spreadIndices[1] = pindex;
				spreadIndices[0] = pindex - 1;
			}
		}
		return spreadIndices;
	}

	/* JEJ: This is the function that deals with the page numbers. */
	br.getPageNum = function(i) {
	    	return i+1;
		//return bookreaderJSON['pages'][i]['humanReadableLeafNum'];
	}

	br.getHumanReadablePageNum = function(i) {
		return bookreaderJSON['pages'][i]['humanReadableLeafNum'];
	}

	br.blankInfoDiv = function() {
	    return $([
	        '<div class="BRfloat" id="BRinfo">',
     	      '<div class="BRfloatHead">About this item',
     	          '<a class="floatShut" href="javascript:;" onclick="$.fn.colorbox.close();"><span class="shift">Close</span></a>',
     	       '</div>',
     	       '<div class="BRfloatBody">',
     	           '<div class="BRfloatMeta">',
     	           '</div>',
     	       '</div>',
     	   '</div>'].join('\n')
    		);
	}

	br.buildInfoDiv = function(jInfoDiv) {
		var months = {
			'01': 'January',
			'02': 'February',
			'03': 'March',
			'04': 'April',
			'05': 'May',
			'06': 'June',
			'07': 'July',
			'08': 'August',
			'09': 'September',
			'10': 'October',
			'11': 'November',
			'12': 'December'
		};

		var date = bookreaderJSON.meta.date;
		var relation = bookreaderJSON.meta.relation;

		var dl = $('<dl style="margin-bottom: 20px;"></dl>');
		jInfoDiv.find('.BRfloatMeta').append(dl);
		dl.append('<dt>Title:</dt>');
		dl.append('<dd>' + bookreaderJSON.meta.title + '</dd>');
		dl.append('<dt>Date:</dt>');
		dl.append(
			'<dd>' + 
			'Vol. ' +
			relation.split(':')[0].replace(/^0*/, '') +
			', ' + 
			date +
			'</dd>'
		);
		if ("description.note" in bookreaderJSON['meta']) {
			dl.append('<dt>Description:</dt>');
			dl.append('<dd>' + bookreaderJSON['meta']['description.note'] + '</dd>');
		}
		if ("source" in bookreaderJSON['meta']) {
			dl.append('<dt>Source:</dt>');
			dl.append('<dd>' + bookreaderJSON.meta.source + '</dd>');
		}
		if ("notes" in bookreaderJSON['meta']) {
			dl.append('<dt>Notes:</dt>');
			dl.append('<dd>' + bookreaderJSON.meta.notes + '</dd>');
		}

		jInfoDiv.find('.BRfloatMeta').append('<h4>Rights</h4>');
		jInfoDiv.find('.BRfloatMeta').append('<p>See the <a href="/rights/">Rights and Reproductions</a> page for information about using this digital volume.</p>');
		jInfoDiv.find('.BRfloatMeta').append('<h4>Other formats</h4>');
		jInfoDiv.find('.BRfloatMeta').append(
			'<p><a href="/text/?docId=' +
			bookreaderJSON.meta.identifier +
			'">Plain Text</a> | ' +
			'<a href="/pdf/?docId=' +
			bookreaderJSON.meta.identifier +
			'">PDF</a></p>');
	}

	br.addSearchResult = function(queryString, pageIndex) {
		var pageNumber = this.getPageNum(pageIndex);
		var uiStringSearch = "Search result"; // i18n
		var uiStringPage = "Page"; // i18n

		var percentThrough = BookReader.util.cssPercentage(pageIndex, this.numLeafs - 1);
		var pageDisplayString = '';
		if (pageNumber) {
			pageDisplayString = uiStringPage + ' ' + pageNumber;
		}

		var re = new RegExp('{{{(.+?)}}}', 'g');    
		queryString = queryString.replace(re, '<a href="#" onclick="br.jumpToIndex('+pageIndex+'); return false;">$1</a>')

		var marker = $('<div class="search" tabindex="3" style="top:'+(-$('#BRcontainer').height())+'px; left:' + percentThrough + ';" title="' + uiStringSearch + '"><div class="query">' + queryString + '<span>' + uiStringPage + ' ' + pageNumber + '</span></div>')
		.data({'self': this, 'pageIndex': pageIndex })
		.appendTo('#BRnavline').bt({
			contentSelector: '$(this).find(".query")',
			trigger: ['focus mouseover', 'blur mouseout'],
			closeWhenOthersOpen: true,
			cssStyles: {
				padding: '12px 14px',
				backgroundColor: '#fff',
				border: '4px solid #e2dcc5',
				fontFamily: '"Lucida Grande","Arial",sans-serif',
				fontSize: '13px',
				//lineHeight: '18px',
				color: '#615132'
			},
			shrinkToFit: false,
			width: '230px',
			padding: 0,
			spikeGirth: 0,
			spikeLength: 0,
			overlap: '22px',
			overlay: false,
			killTitle: false, 
			textzIndex: 9999,
			boxzIndex: 9998,
			wrapperzIndex: 9997,
			offsetParent: null,
			positions: ['top'],
			fill: 'white',
			windowMargin: 10,
			strokeWidth: 0,
			cornerRadius: 0,
			centerPointX: 0,
			centerPointY: 0,
			shadow: false
		})
		.hover( function() {
			// remove from other markers then turn on just for this
			// XXX should be done when nav slider moves
			$('.search,.chapter').removeClass('front');
			$(this).addClass('front');
			}, function() {
				$(this).removeClass('front');
			}
		)
		.bind('click', function() {
			$(this).data('self').jumpToIndex($(this).data('pageIndex'));
			$('.search,.chapter').removeClass('front');
			}
		)
		.keypress( function(e) {
				if (e.keyCode == 13 || e.keyCode == 16 || e.keyCode == 32) {
					$(e.target).find('a').click();
				}
			}
		)
		.focus( function() {
			$('div.search:focus').addClass('front');
			}
		)
		.focusout( function() {
				$('.search,.chapter').removeClass('front');
			}
		);
    
		$(marker).animate({top:'-25px'}, 'slow');
	}

	br.buildShareDiv = function(jShareDiv) {
		var pageView = 'http://pi.lib.uchicago.edu/1001/dig/campub/' + getUrlVars()['docId'] + '/' + getObjectNumber();
		var bookView = 'http://pi.lib.uchicago.edu/1001/dig/campub/' + getUrlVars()['docId'];
	    var self = this;
	    
	    var jForm = $([
	        '<p>Copy and paste one of these options to share this item elsewhere.</p>',
	        '<form method="post" action="">',
	            '<fieldset>',
	                '<label for="pageview">Link to this page:</label>',
	                '<input type="text" name="pageview" id="pageview" value="' + pageView + '"/>',
	            '</fieldset>',
	            '<fieldset>',
	                '<label for="booklink">Link to this volume:</label>',
	                '<input type="text" name="booklink" id="booklink" value="' + bookView + '"/>',
	            '</fieldset>',
	            '<fieldset class="center">',
	                '<button type="button" onclick="$.fn.colorbox.close();">Finished</button>',
	            '</fieldset>',
	        '</form>'].join('\n'));
        
	    jForm.appendTo(jShareDiv);
      
	    jForm.find('input').bind('change', function() {
	        var form = $(this).parents('form:first');
	        var params = {};
	        params.mode = $(form.find('input[name=pages]:checked')).val();
	        if (form.find('input[name=thispage]').attr('checked')) {
	            params.page = self.getPageNum(self.currentIndex());
	        }
        
	        // $$$ changeable width/height to be added to share UI
	        var frameWidth = "480px";
	        var frameHeight = "430px";
	        form.find('.BRframeEmbed').val(self.getEmbedCode(frameWidth, frameHeight, params));
	    })
	    jForm.find('input[name=thispage]').trigger('change');
	    jForm.find('input, textarea').bind('focus', function() {
	        this.select();
	    });
    
   	 jForm.appendTo(jShareDiv);
   	 jForm = ''; // closure
	}	

	br.numLeafs = bookreaderJSON['pages'].length;

	// Book title and the URL used for the book title link
	//br.bookTitle= bookreaderXML.getElementsByTagName("title")[0];
	// JEJ
	br.bookTitle = $('title').text().split(' :: ')[0];

	// JEJ
	br.bookUrl  = 'http://openlibrary.org';

	// Override the path used to find UI images
	br.imagesBaseURL = '/css/bookreader2/images/';

	// JEJ added this. testing br.search().
	br.bookPath = '';
	br.bookId = id;

	br.getEmbedCode = function(frameWidth, frameHeight, viewParams) {
	    return "Embed code not supported in bookreader demo.";
	}

	br.initUIStrings = function() {
	    // Navigation handlers will be bound after all UI is in place -- makes moving icons between
	    // the toolbar and nav bar easier
		
	    // Setup tooltips -- later we could load these from a file for i18n
	    var titles = { '.logo': 'The Chicagoan', // $$$ update after getting OL record
			   '.zoom_in': 'Zoom in',
			   '.zoom_out': 'Zoom out',
			   '.onepg': 'One-page view',
			   '.twopg': 'Two-page view',
			   '.thumb': 'Thumbnail view',
			   '.print': 'Print this page',
			   '.embed': 'Embed BookReader',
			   '.link': 'Link to this book (and page)',
			   '.bookmark': 'Bookmark this page',
			   '.read': 'Read this book aloud',
			   '.share': 'Share this book',
			   '.info': 'About this book',
			   '.full': 'Show fullscreen',
			   '.book_left': 'Flip left',
			   '.book_right': 'Flip right',
			   '.book_up': 'Page up',
			   '.book_down': 'Page down',
			   '.play': 'Play',
			   '.pause': 'Pause',
			   '.BRdn': 'Show/hide nav bar', // Would have to keep updating on state change to have just "Hide nav bar"
			   '.BRup': 'Show/hide nav bar',
			   '.book_top': 'First page',
			   '.book_bottom': 'Last page'
			  };
	    if ('rl' == this.pageProgression) {
		titles['.book_leftmost'] = 'Last page';
		titles['.book_rightmost'] = 'First page';
	    } else { // LTR
		titles['.book_leftmost'] = 'First page';
		titles['.book_rightmost'] = 'Last page';
	    }
			  
	    for (var icon in titles) {
		if (titles.hasOwnProperty(icon)) {
		    $('#BookReader').find(icon).attr('title', titles[icon]);
		}
	    }
	}

	// Let's go!
	br.init();

	/* For some weird reason you could tab to this. */
	$('#BRcontainer').attr('tabindex', '-1');

	/*
	 * Little hack to get the slider to show the page number when someone
	 * tabs onto it. 
	 */
	$('.ui-slider-handle').attr('tabindex', '3');
	$('.ui-slider-handle')
	.focus(function() {
		$('#pagenum').show();
	})
	.focusout(function() {
		$('#pagenum').hide();
	});

	/*
	 * I added a "Jump to page" form to the interface.
	 */
	$('#jumptopageform').submit(function(e) {
		e.preventDefault();
		br.jumpToPage($('#jumptopage').val());
	});

	/*
 	 * The link that lets you hide the control panels for the interface
	 * wasn't keyboard accessible. This also needed to be modified so that
	 * it could handle resizing for the content part of the page.
	 */
	$('#BRnavCntlBtm').append('<a href="#"></a>');

	/*
	 * Unbind the pesky functions that reduce the opacity of this button.
	 */
	$('#BRnavCntlBtm').unbind('mouseover');
	$('#BRnavCntlBtm').unbind('mouseleave');

	/*
 	 * Remove the click function from the div and add one back to the
	 * a href. modify it a bit too.
	 */
	$('.BRnavCntl').unbind('click');
	$('.BRnavCntl a').click(
		function(){
			if ($('#BRnavCntlBtm').hasClass('BRdn')) {
				$('#BRtoolbar').animate({top:-40});
				$('#BRcontainer').animate(
					{	
						top: 0,
						bottom: 0
					},	
					{
						step: function() {
							if (br.mode == 2) {
								$(window).trigger('resize');
							}
						}
					}
				);
				$('#BRnav').animate({bottom:-55});
				$('#BRnavCntlBtm').addClass('BRup').removeClass('BRdn');
				$('#BRnavCntlTop').addClass('BRdn').removeClass('BRup');
				$('#BRnavCntlBtm.BRnavCntl').animate({height:'45px'});
			} else {
				$('#BRtoolbar').animate({top:0});
				$('#BRcontainer').animate(		
					{	
						bottom: 40,
						top: 40
					},
					{
						step: function() {
							if (br.mode == 2) {
								$(window).trigger('resize');
							}
						}
					}
				);
				$('#BRnav').animate({bottom:0});
				$('#BRnavCntlBtm').addClass('BRdn').removeClass('BRup');
				$('#BRnavCntlTop').addClass('BRup').removeClass('BRdn');
				$('#BRnavCntlBtm.BRnavCntl').animate({height:'30px'});
			};
		}
	);

	/* Add breadcrumbs to the page. */
	$('#breadcrumbs').append(
		"<a class='homelink' href='http://www.lib.uchicago.edu/' tabindex='1'>The University of Chicago Library</a>" +
		" <span class='arrow'>&gt;</span> " +
		"<a href='/' tabindex='1'>Campus Publications</a>"
	);

	/* Add title to breadcrumbs. */
	$('#breadcrumbs').append(
		" <span class='arrow'>&gt;</span> " +
		bookreaderJSON['meta']['title']
	);

	/* Add volume to breadcrumbs. */
	$('#breadcrumbs').append(
		", Vol. " + bookreaderJSON['meta']['relation'].split(':')[0].replace(/^0*/, '')
	);

	/* Optionally, add issue to breadcrumbs. */
	//var iss = bookreaderJSON['meta']['relation'].split(':')[1];
    var iss = parseInt(getUrlVars()['docId'].split('-').pop(), 10);
	if (iss != '0') {
		$('#breadcrumbs').append(
			", No. " + iss
		);
	}

	/* Add date to breadcrumbs. */
	$('#breadcrumbs').append(
		", " + bookreaderJSON['meta']['date']
	);

	/* searchTerm is undefined here... */
	var searchTerm = getUrlVars()['query'];
	if (searchTerm) {
		br.search(getUrlVars()['query']);
		$('#textSrch').val(searchTerm);
	}
	
	/*
	 * The original code doesn't allow keyboard navigation for 1up or 
	 * thumbnail views.
	 */
	$(document).bind('keydown', 'pageup', function() { 
		var vars = window.location.href.split('#')[1].split('/');
		var v = 0;
		while (v < vars.length) {
			if (vars[v] == 'page') {
				br.jumpToIndex(parseInt(vars[v+1]) - 2);
				break;
			}
			v++;
		}
	});
	$(document).bind('keydown', 'pagedown', function() { 
		var vars = window.location.href.split('#')[1].split('/');
		var v = 0;
		while (v < vars.length) {
			if (vars[v] == 'page') {
				br.jumpToIndex(parseInt(vars[v+1]));
				break;
			}
			v++;
		}
	});
}
});

