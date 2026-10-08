// ============================================
// CONFIG
// ============================================
const API_URL = 'http://localhost:5000/api/opportunities';

// Global modal instances
let formModal, viewModal;

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  formModal = new bootstrap.Modal(document.getElementById('formModal'));
  viewModal = new bootstrap.Modal(document.getElementById('viewModal'));
  loadOpportunities();
});

// ============================================
// ALERTS
// ============================================
function showAlert(message, type = 'success') {
  const alertBox = document.getElementById('alertBox');
  alertBox.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  // Auto-dismiss after 4 seconds
  setTimeout(() => {
    const alert = alertBox.querySelector('.alert');
    if (alert) alert.remove();
  }, 4000);
}

// ============================================
// LOAD ALL OPPORTUNITIES
// ============================================
async function loadOpportunities() {
  const loading = document.getElementById('loading');
  const list = document.getElementById('opportunitiesList');
  const emptyState = document.getElementById('emptyState');

  loading.classList.remove('d-none');
  list.innerHTML = '';
  emptyState.classList.add('d-none');

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Failed to load (${res.status})`);

    const opportunities = await res.json();

    if (opportunities.length === 0) {
      emptyState.classList.remove('d-none');
    } else {
      opportunities.forEach(opp => list.appendChild(renderCard(opp)));
    }
  } catch (err) {
    showAlert('Error loading opportunities: ' + err.message, 'danger');
  } finally {
    loading.classList.add('d-none');
  }
}

// ============================================
// RENDER A SINGLE CARD
// ============================================
function renderCard(opp) {
  const col = document.createElement('div');
  col.className = 'col-md-6 col-lg-4';

  const statusBadge = opp.status === 'Open'
    ? '<span class="badge bg-success">Open</span>'
    : '<span class="badge bg-secondary">Closed</span>';

  const deadlineText = opp.deadline
    ? new Date(opp.deadline).toLocaleDateString()
    : 'No deadline';

  col.innerHTML = `
    <div class="card h-100 shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <h5 class="card-title mb-0">${escapeHtml(opp.title)}</h5>
          ${statusBadge}
        </div>
        <h6 class="card-subtitle mb-2 text-muted">
          <i class="bi bi-tag"></i> ${escapeHtml(opp.area)}
        </h6>
        <p class="card-text small">${escapeHtml(opp.description).substring(0, 100)}...</p>
        <p class="card-text small mb-1">
          <i class="bi bi-people"></i> ${opp.positions} position(s)
        </p>
        <p class="card-text small text-muted mb-0">
          <i class="bi bi-calendar"></i> ${deadlineText}
        </p>
      </div>
      <div class="card-footer bg-white d-flex flex-wrap gap-1">
        <button class="btn btn-sm btn-outline-info" onclick="viewOpportunity(${opp.id})">
          <i class="bi bi-eye"></i> View
        </button>
        <button class="btn btn-sm btn-outline-primary" onclick="editOpportunity(${opp.id})">
          <i class="bi bi-pencil"></i> Edit
        </button>
        <button class="btn btn-sm btn-outline-warning" onclick="toggleStatus(${opp.id}, '${opp.status}')">
          <i class="bi bi-${opp.status === 'Open' ? 'lock' : 'unlock'}"></i>
          ${opp.status === 'Open' ? 'Close' : 'Reopen'}
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteOpportunity(${opp.id})">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  `;
  return col;
}

// ============================================
// VIEW DETAILS
// ============================================
async function viewOpportunity(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Opportunity not found');
    const opp = await res.json();

    document.getElementById('viewBody').innerHTML = `
      <h4>${escapeHtml(opp.title)}</h4>
      <p class="text-muted">
        <span class="badge bg-${opp.status === 'Open' ? 'success' : 'secondary'}">${opp.status}</span>
        &nbsp; <i class="bi bi-tag"></i> ${escapeHtml(opp.area)}
      </p>
      <hr>
      <h6>Description</h6>
      <p>${escapeHtml(opp.description)}</p>
      <h6>Required Skills</h6>
      <p>${opp.skills ? escapeHtml(opp.skills) : '<em>Not specified</em>'}</p>
      <div class="row mt-3">
        <div class="col-md-4"><strong>Positions:</strong> ${opp.positions}</div>
        <div class="col-md-4"><strong>Deadline:</strong> ${opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'N/A'}</div>
        <div class="col-md-4"><strong>Posted:</strong> ${new Date(opp.created_at).toLocaleDateString()}</div>
      </div>
    `;
    viewModal.show();
  } catch (err) {
    showAlert('Error: ' + err.message, 'danger');
  }
}

// ============================================
// OPEN CREATE FORM
// ============================================
function openCreateForm() {
  document.getElementById('modalTitle').textContent = 'New Opportunity';
  document.getElementById('opportunityForm').reset();
  document.getElementById('oppId').value = '';
  document.getElementById('status').value = 'Open';
  document.getElementById('positions').value = 1;
  formModal.show();
}

// ============================================
// OPEN EDIT FORM
// ============================================
async function editOpportunity(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Opportunity not found');
    const opp = await res.json();

    document.getElementById('modalTitle').textContent = 'Edit Opportunity';
    document.getElementById('oppId').value = opp.id;
    document.getElementById('title').value = opp.title || '';
    document.getElementById('description').value = opp.description || '';
    document.getElementById('area').value = opp.area || '';
    document.getElementById('skills').value = opp.skills || '';
    document.getElementById('positions').value = opp.positions || 1;
    document.getElementById('deadline').value = opp.deadline ? opp.deadline.split('T')[0] : '';
    document.getElementById('status').value = opp.status || 'Open';

    formModal.show();
  } catch (err) {
    showAlert('Error: ' + err.message, 'danger');
  }
}

// ============================================
// SAVE (CREATE OR UPDATE)
// ============================================
async function saveOpportunity() {
  const form = document.getElementById('opportunityForm');

  // Bootstrap validation
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const id = document.getElementById('oppId').value;
  const payload = {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    area: document.getElementById('area').value.trim(),
    skills: document.getElementById('skills').value.trim() || null,
    positions: parseInt(document.getElementById('positions').value) || 1,
    deadline: document.getElementById('deadline').value || null,
    status: document.getElementById('status').value
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/${id}` : API_URL;

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);

    formModal.hide();
    form.classList.remove('was-validated');
    showAlert(id ? 'Opportunity updated successfully!' : 'Opportunity created successfully!', 'success');
    loadOpportunities();
  } catch (err) {
    showAlert('Error: ' + err.message, 'danger');
  }
}

// ============================================
// TOGGLE STATUS (Open <-> Closed)
// ============================================
async function toggleStatus(id, currentStatus) {
  const newStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) throw new Error('Failed to update status');
    showAlert(`Opportunity marked as ${newStatus}.`, 'info');
    loadOpportunities();
  } catch (err) {
    showAlert('Error: ' + err.message, 'danger');
  }
}

// ============================================
// DELETE
// ============================================
async function deleteOpportunity(id) {
  if (!confirm('Are you sure you want to delete this opportunity?')) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Delete failed');
    }
    showAlert('Opportunity deleted successfully.', 'success');
    loadOpportunities();
  } catch (err) {
    showAlert('Error: ' + err.message, 'danger');
  }
}

// ============================================
// ESCAPE HTML (basic XSS protection)
// ============================================
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
