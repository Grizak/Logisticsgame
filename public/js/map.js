const map = L.map('map').setView([59.3293, 18.0686], 5); // Center on Stockholm

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Example city marker
L.marker([59.3293, 18.0686]).addTo(map).bindPopup('Stockholm');
