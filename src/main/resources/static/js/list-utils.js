function simpleSearchFilter(tableId, searchInputId) {
    const input = document.getElementById(searchInputId);
    const table = document.getElementById(tableId);
    if (!input || !table) return;
    input.addEventListener('input', function() {
        const q = input.value.toLowerCase();
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(r => {
            const text = r.textContent.toLowerCase();
            r.style.display = text.indexOf(q) > -1 ? '' : 'none';
        });
    });
}

function simplePagination(tableId, pageSize, pagerId) {
    const table = document.getElementById(tableId);
    const pager = document.getElementById(pagerId);
    if (!table || !pager) return;
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    let current = 0;

    function render() {
        rows.forEach((r, idx) => {
            r.style.display = (idx >= current && idx < current + pageSize) ? '' : 'none';
        });
        pager.textContent = `Showing ${Math.min(rows.length, current+1)} - ${Math.min(rows.length, current+pageSize)} of ${rows.length}`;
    }

    const prev = document.createElement('button'); prev.textContent = 'Prev';
    const next = document.createElement('button'); next.textContent = 'Next';
    prev.addEventListener('click', function(){ current = Math.max(0, current - pageSize); render(); });
    next.addEventListener('click', function(){ if (current + pageSize < rows.length) current += pageSize; render(); });
    pager.appendChild(prev); pager.appendChild(next);
    render();
}
