$(document).ready(function() {
  // Copilot says yes, but I don't think we need this. vmg
  // window.dataLayer = window.dataLayer || [];
  // function gtag(){dataLayer.push(arguments);}
  // gtag('js', new Date());
 
  // get subnetclass (staff, etc.)
  var q = 'https://www.lib.uchicago.edu/cgi-bin/subnetclass?jsoncallback=?';
  $.getJSON(q, function(data) {
    gtag('set', { subnetclass: data });
    // debugging for now
    console.log('subnetclass: ' + data); // > subnetclass: Campus, Non-Library Staff
  }); 

  // Engagement events.
  if (window.location.href.indexOf('/view/') !== -1) {
    // Helper for engagement events
    function triggerEngagement(label) {
      gtag('event', 'engagement', { 'event_label':label });
      // console.log('engagement event triggered: ' + label);
    }

    // Engagement events, page turn, change view, info, share, etc
    const buttons = document.querySelectorAll('button.BRicon');
    buttons.forEach(btn => {
      btn.addEventListener('click', function() {
        const label = btn.getAttribute('title');
        if (label) triggerEngagement(label);
      }, false);
    });

    // Engagement event for page slider interactions
    const brpager = document.getElementById('BRpager');
    if (brpager) {
      brpager.addEventListener('click', function() {
        triggerEngagement('Page Slider');
      }, false);
    }

    // Detect submissions to 'form#jumptopageform'
    const jumpForm = document.querySelector('form#jumptopageform');
    if (jumpForm) {
      jumpForm.addEventListener('submit', function() {
        triggerEngagement('Jump To Page Form');
      }, false);
    }

    // Detect submissions to 'form#booksearch'
    const searchForm = document.querySelector('form#booksearch');
    if (searchForm) {
      searchForm.addEventListener('submit', function() {
        triggerEngagement('Book Search Form');
      }, false);
    }

    // Detect clicks on links with data-ga-label for file downloads (no jQuery)
    // Attach click event listeners directly to elements with data-ga-action="file_download"
    var links = document.querySelectorAll('a[data-ga-action="file_download"]');
    links.forEach(function(link) {
      link.addEventListener('click', function() {
        var label = link.getAttribute('data-ga-label');
        gtag('event', 'file_download', { 'event_label': label });
      });
    });
  }
});
