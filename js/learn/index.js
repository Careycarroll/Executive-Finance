/**
 * js/learn/index.js — Interactive filters for the Concept Library
 */

document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const domainSections = document.querySelectorAll('.domain-section');

  let activeTier = 'all';
  let activeDomain = 'all';

  function applyFilters() {
    domainSections.forEach(sec => {
      const secDomain = sec.getAttribute('data-domain');
      let visibleInSec = 0;

      sec.querySelectorAll('.concept-card').forEach(card => {
        const cardTier = card.getAttribute('data-tier');
        const matchTier = activeTier === 'all' || cardTier === activeTier;
        const matchDomain = activeDomain === 'all' || secDomain === activeDomain;

        if (matchTier && matchDomain) {
          card.style.display = 'flex';
          visibleInSec++;
        } else {
          card.style.display = 'none';
        }
      });

      sec.style.display = visibleInSec > 0 ? 'block' : 'none';
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-filter-type');
      const val = btn.getAttribute('data-filter-value');

      // Update active state in current group
      btn.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');

      if (type === 'tier') activeTier = val;
      if (type === 'domain') activeDomain = val;

      applyFilters();
    });
  });
});
