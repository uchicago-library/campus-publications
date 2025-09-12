window.onload = function() {
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

  // Custom engagement events
  if (window.location.href.indexOf('/view/') !== -1) {
    // Wait for download links to be present in the DOM
    function waitForDownloadLinks(callback, timeout = 5000, interval = 100) {
      const start = Date.now();
      function check() {
        const links = document.querySelectorAll('a[data-ga-action="file_download"]');
        if (links.length > 0) {
          callback(links);
        } else if (Date.now() - start < timeout) {
          console.log('Waiting for download links...');
          setTimeout(check, interval);
        }
      }
      check();
    }

    // Once links are found, set up event listeners
    waitForDownloadLinks(function(links) {

      // Helper for engagement events
      function triggerEngagement(label) {
        // logging engagement events as clicks
        gtag('event', 'click', { 'event_label':label });
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

      // Helper to send gtag file download events and delay navigation
      function handleDownloadEvent(e, eventType, link) {
        var label = link.getAttribute('data-ga-label');
        gtag('event', 'file_download', { 'event_label': label });
        // Delay navigation for left/middle click
        if (link.href && (eventType === 'click' || eventType === 'auxclick')) {
          e.preventDefault();
          setTimeout(function() {
            if (eventType === 'click') {
              window.location.href = link.href;
            } else if (eventType === 'auxclick' && e.button === 1) {
              window.open(link.href, '_blank');
            }
          }, 200); // 200ms delay for gtag
        }
      }

      // Detect clicks on 'a[data-ga-action="file_download"]'
      links.forEach(function(link) {
        // Left click
        link.addEventListener('click', function(e) {
          handleDownloadEvent(e, 'click', link);
        });
        // Middle mouse (wheel) click
        link.addEventListener('auxclick', function(e) {
          if (e.button === 1) {
            handleDownloadEvent(e, 'auxclick', link);
          }
        });
      });
    });
  }
};
