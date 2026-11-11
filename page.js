/* ==========================================================================
   Page transition: when you go from one page to another (or jump to a
   section), the whole screen slides from left to right and the new content
   slides in behind it. Used by index.html and certificate.html.
   ========================================================================== */
(function(){
  const root = document.documentElement;
  const wipe = document.getElementById('wipe');
  const page = document.getElementById('page');
  if (!wipe || !page) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T_IN = 560, T_OUT = 720;
  let busy = false;

  function reset(){
    wipe.classList.remove('is-in', 'is-out');
    wipe.style.transition = 'none'; void wipe.offsetWidth; wipe.style.transition = '';
    page.classList.remove('leaving', 'arriving', 'arrived');
    busy = false;
  }

  // The new page opens with the curtain already covering the screen; slide it away to the right.
  if (root.classList.contains('wipe-enter')) {
    page.classList.add('arriving');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      wipe.classList.add('is-out'); root.classList.remove('wipe-enter');
      page.classList.remove('arriving'); page.classList.add('arrived');
      setTimeout(reset, T_OUT + 150);
    }));
  }

  function leave(then){
    busy = true;
    page.classList.add('leaving');
    wipe.classList.add('is-in');
    setTimeout(then, T_IN + 30);
  }

  function arriveHere(){
    page.classList.remove('leaving'); page.classList.add('arriving'); void page.offsetWidth;
    wipe.classList.remove('is-in'); wipe.classList.add('is-out');
    page.classList.remove('arriving'); page.classList.add('arrived');
    setTimeout(reset, T_OUT + 150);
  }

  function jumpTo(hash){
    const id = decodeURIComponent(hash.slice(1));
    const el = id ? document.getElementById(id) : null;
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' }); else window.scrollTo(0, 0);
    history.pushState(null, '', hash);
  }

  document.addEventListener('click', e => {
    if (reduce || busy) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    let url; try { url = new URL(a.getAttribute('href'), location.href); } catch (err) { return; }
    if (url.protocol !== location.protocol || url.host !== location.host) return;      // mailto:, tel:, other sites

    if (url.pathname === location.pathname && url.search === location.search) {
      if (!url.hash) return;
      e.preventDefault();
      leave(() => { jumpTo(url.hash); arriveHere(); });                                // another section of this page
    } else {
      e.preventDefault();
      try { sessionStorage.setItem('hg-wipe', '1'); } catch (err) {}
      leave(() => { location.href = url.href; });                                      // another page
    }
  });

  // coming back with the browser's Back button
  window.addEventListener('pageshow', ev => { if (ev.persisted) { root.classList.remove('wipe-enter'); reset(); } });
})();
