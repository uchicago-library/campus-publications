$(document).ready(function() {
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-98210151-1', {
    'custom_map': {
      'dimension1': 'Subnetclass'
    }
  });

  // get subnetclass (staff, etc.)
  var q = 'https://www.lib.uchicago.edu/cgi-bin/subnetclass?jsoncallback=?';
  $.getJSON(q, function(data) {
    gtag('event', 'Subnetclass', data);
  }); 

  // pageturner event.
  if (window.location.href.indexOf('/view/') !== -1) {
    var mvol = window.location.href.match(/docId=([^#]*)#/)[1];
    gtag('event', 'click', {
      'event_category': 'pageTurner',
      'event_label': mvol,
      'value': 1
    });
  }
});
