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
    console.log('gtag is ready?', typeof gtag === 'function');
    console.log('subnetclass: ' + data); // > subnetclass: Campus, Non-Library Staff
  }); 

  // Engagement events.
  if (window.location.href.indexOf('/view/') !== -1) {
    console.log('gtag is ready?', typeof gtag === 'function');
    console.log('page is view');

    // Helper for engagement events
    function triggerEngagement(label) {
      console.log('gtag is ready?', typeof gtag === 'function');
      console.log('engagement event triggered: ' + label);
      gtag('event', 'click', { 'event_label':label });
    }

    // Engagement events, page turn, change view, info, share, etc
    const buttons = document.querySelectorAll('button.BRicon');
    console.log('Found buttons for engagement tracking:', buttons.length);
    buttons.forEach(btn => {
      console.log('Setting up engagement tracking for button:', btn);
      btn.addEventListener('click', function() {
        const label = btn.getAttribute('title');
        if (label) triggerEngagement(label);
      }, false);
    });

    // Engagement event for page slider interactions
    const brpager = document.getElementById('BRpager');
    if (brpager) {
      console.log('Setting up page slider tracking');
      brpager.addEventListener('click', function() {
        triggerEngagement('Page Slider');
      }, false);
    }

    // Detect submissions to 'form#jumptopageform'
    const jumpForm = document.querySelector('form#jumptopageform');
    if (jumpForm) {
      console.log('Setting up jump to page form tracking');
      jumpForm.addEventListener('submit', function() {
        triggerEngagement('Jump To Page Form');
      }, false);
    }

    // Detect submissions to 'form#booksearch'
    const searchForm = document.querySelector('form#booksearch');
    if (searchForm) {
      console.log('Setting up book search form tracking');
      searchForm.addEventListener('submit', function() {
        triggerEngagement('Book Search Form');
      }, false);
    }

    // Detect clicks on links with data-ga-label for file downloads (no jQuery)
    // Attach click event listeners directly to elements with data-ga-action="file_download"
    console.log('Setting up file download link tracking');
    var links = document.querySelectorAll('a[data-ga-action="file_download"]');

    // Helper to send gtag event and delay navigation
    function handleDownloadEvent(e, eventType, link) {
      var label = link.getAttribute('data-ga-label');
      console.log('gtag is ready?', typeof gtag === 'function');
      console.log('file_download event sent:', label, 'type:', eventType);
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

    links.forEach(function(link) {
      var label = link.getAttribute('data-ga-label');
      console.log('Setting up download tracking for link:', label);
      // Left click
      link.addEventListener('click', function(e) {
        console.log('Link clicked:', link.href);
        handleDownloadEvent(e, 'click', link);
      });
      // Middle mouse (wheel) click
      link.addEventListener('auxclick', function(e) {
        if (e.button === 1) {
          console.log('Link auxclick clicked:', link.href);
          handleDownloadEvent(e, 'auxclick', link);
        }
      });
    });

    // var links = document.querySelectorAll('a[data-ga-action="file_download"]');
    // links.forEach(function(link) {
    //   var label = link.getAttribute('data-ga-label');
    //   // Left click
    //   link.addEventListener('click', function(e) {
    //     e.preventDefault();
    //     console.log('Link clicked:', link.href, label);
    //   });
    //   // Middle mouse (wheel) click
    //   link.addEventListener('auxclick', function(e) {
    //     e.preventDefault();
    //     console.log('Link auxclick clicked:', link.href, label);
    //     if (e.button === 1) {
    //       console.log('Link button === 1 clicked:', link.href, label);
    //     }
    //   });
    // });
  }
});
