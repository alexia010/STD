// Actualizează iframe-urile pentru a folosi hostname-ul corect
document.addEventListener('DOMContentLoaded', function() {
    // Înlocuiește localhost cu hostname-ul real
    var iframes = document.querySelectorAll('iframe');
    var hostname = window.location.hostname;
    
    iframes.forEach(function(iframe) {
      if (iframe.src.includes('localhost')) {
        iframe.src = iframe.src.replace('localhost', hostname);
      }
    });
    
    // Adaugă efect de animație la containerele cookflow
    var containers = document.querySelectorAll('.cookflow-container');
    containers.forEach(function(container, index) {
      container.style.opacity = '0';
      container.style.transform = 'translateY(20px)';
      setTimeout(function() {
        container.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
      }, index * 150);
    });
  });