/**
 * js/learn/index.js — Interactive search and filters for the Concept Library
 */

document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn[data-filter-type]');
  const domainSections = document.querySelectorAll('.domain-section');
  const searchInput = document.getElementById('concept-search-input');
  const clearBtn = document.getElementById('concept-search-clear');
  const resultsCountEl = document.getElementById('concept-results-count');
  const emptyStateEl = document.getElementById('concept-empty-state');
  const resetBtn = document.getElementById('concept-reset-btn');

  const totalCards = document.querySelectorAll('.concept-card').length;

  let activeTier = 'all';
  let activeDomain = 'all';
  let searchQuery = '';

  function applyFilters() {
    const tokens = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    let totalVisible = 0;

    domainSections.forEach(sec => {
      const secDomain = sec.getAttribute('data-domain');
      let visibleInSec = 0;

      sec.querySelectorAll('.concept-card').forEach(card => {
        const cardTier = card.getAttribute('data-tier');
        const searchBlob = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();

        const matchTier = activeTier === 'all' || cardTier === activeTier;
        const matchDomain = activeDomain === 'all' || secDomain === activeDomain;
        const matchSearch = tokens.length === 0 || tokens.every(tok => searchBlob.includes(tok));

        if (matchTier && matchDomain && matchSearch) {
          card.style.display = 'flex';
          visibleInSec++;
          totalVisible++;
        } else {
          card.style.display = 'none';
        }
      });

      const countBadge = sec.querySelector('.domain-section__count');
      if (countBadge) {
        countBadge.textContent = `${visibleInSec} concept${visibleInSec === 1 ? '' : 's'}`;
      }

      sec.style.display = visibleInSec > 0 ? 'block' : 'none';
    });

    if (clearBtn) {
      clearBtn.style.display = searchQuery.length > 0 ? 'inline-flex' : 'none';
    }

    if (resultsCountEl) {
      if (totalVisible === totalCards && activeTier === 'all' && activeDomain === 'all' && !searchQuery) {
        resultsCountEl.textContent = `Showing all ${totalCards} concepts`;
      } else {
        resultsCountEl.textContent = `Showing ${totalVisible} of ${totalCards} concepts`;
      }
    }

    if (emptyStateEl) {
      emptyStateEl.style.display = totalVisible === 0 ? 'block' : 'none';
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-filter-type');
      const val = btn.getAttribute('data-filter-value');

      btn.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');

      if (type === 'tier') activeTier = val;
      if (type === 'domain') activeDomain = val;

      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim();
      applyFilters();
    });

    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Escape' && searchInput.value) {
        e.preventDefault();
        searchInput.value = '';
        searchQuery = '';
        applyFilters();
      }
    });
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchInput.focus();
      applyFilters();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeTier = 'all';
      activeDomain = 'all';
      searchQuery = '';
      if (searchInput) searchInput.value = '';

      filterBtns.forEach(b => {
        const isAll = b.getAttribute('data-filter-value') === 'all';
        b.classList.toggle('filter-btn--active', isAll);
      });

      applyFilters();
    });
  }

  // Global '/' shortcut to focus the search input
  document.addEventListener('keydown', e => {
    if (
      e.key === '/' &&
      searchInput &&
      document.activeElement !== searchInput &&
      !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)
    ) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });
});
