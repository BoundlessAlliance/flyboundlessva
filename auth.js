// Boundless Alliance Access Gate
// This is a simple front-end launch gate, not true security.

if (sessionStorage.getItem('boundlessAccess') !== 'granted') {
  window.location.href = 'index.html';
}
