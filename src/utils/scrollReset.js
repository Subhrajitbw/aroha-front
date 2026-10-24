// Disable auto scroll restore
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

// Always reset to top on hard reload
window.scrollTo(0, 0);

// Handle bfcache (back/forward navigation restores scroll)
// Skip reset if the shop has a saved scroll position to restore
window.addEventListener("pageshow", (event) => {
  if (event.persisted && !sessionStorage.getItem('shop_scroll_pos')) {
    window.scrollTo(0, 0);
  }
});

// Handle initial load after all resources are ready
window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});
