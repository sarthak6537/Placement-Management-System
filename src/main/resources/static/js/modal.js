function showConfirmModal(message, onConfirm) {
    let modal = document.getElementById('confirmModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'confirmModal';
        modal.innerHTML = '<div class="modal-overlay"></div><div class="modal-panel"><p id="confirmMessage"></p><button id="confirmYes">Yes</button> <button id="confirmNo">No</button></div>';
        document.body.appendChild(modal);
        document.getElementById('confirmYes').addEventListener('click', function() {
            modal.style.display = 'none';
            onConfirm(true);
        });
        document.getElementById('confirmNo').addEventListener('click', function() {
            modal.style.display = 'none';
            onConfirm(false);
        });
    }
    document.getElementById('confirmMessage').textContent = message;
    modal.style.display = 'block';
}

function confirmDelete(url, message) {
    showConfirmModal(message || 'Are you sure?', function(confirmed) {
        if (confirmed) {
            window.location.href = url;
        }
    });
}
