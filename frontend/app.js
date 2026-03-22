// Application State
let appState = {
    currentPage: 'auth',
    authMode: 'signin',
    currentOrgId: null,
    currentBoardId: null,
    organizations: [],
    boards: [],
    issues: [],
    members: []
};

// Utilities
function showAlert(message, type = 'success') {
    const alertEl = document.getElementById('alert') || createAlert();
    alertEl.textContent = message;
    alertEl.className = `alert show alert-${type}`;
    setTimeout(() => alertEl.classList.remove('show'), 5000);
}

function createAlert() {
    const alert = document.createElement('div');
    alert.id = 'alert';
    alert.className = 'alert';
    document.body.insertBefore(alert, document.body.firstChild);
    return alert;
}

function showModal(content, title, onSubmit) {
    const modal = document.getElementById('modal') || createModal();
    const overlay = modal.querySelector('.modal-overlay');

    modal.querySelector('.modal-header h2').textContent = title;
    modal.querySelector('.modal-body').innerHTML = content;

    const submitBtn = modal.querySelector('.modal-btn-submit');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.modal-btn-cancel');

    submitBtn.onclick = onSubmit;
    closeBtn.onclick = () => modal.classList.remove('active');
    cancelBtn.onclick = () => modal.classList.remove('active');
    overlay.onclick = () => modal.classList.remove('active');

    modal.classList.add('active');
}

function createModal() {
    const modal = document.createElement('div');
    modal.id = 'modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2></h2>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body"></div>
            <div class="modal-footer">
                <button class="modal-btn-cancel">Cancel</button>
                <button class="modal-btn-submit">Submit</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Pages
function renderAuthPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="auth-page">
            <div class="auth-card">
                <h2>${appState.authMode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>
                <p>${appState.authMode === 'signin' ? 'Welcome back' : 'Create your account'}</p>
                <form id="authForm">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="username" placeholder="Enter your username" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="password" placeholder="Enter your password" required>
                    </div>
                    <button type="submit" class="btn btn-primary">${appState.authMode === 'signin' ? 'Sign In' : 'Sign Up'}</button>
                </form>
                <div class="auth-link">
                    ${appState.authMode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                    <a onclick="toggleAuthMode()">${appState.authMode === 'signin' ? 'Sign Up' : 'Sign In'}</a>
                </div>
            </div>
        </div>
    `;

    document.getElementById('authForm').onsubmit = async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const result = appState.authMode === 'signin'
                ? await api.signin(username, password)
                : await api.signup(username, password);

            if (appState.authMode === 'signin') {
                api.setToken(result.token);
                appState.currentPage = 'organizations';
                renderOrganizationsPage();
                showAlert('Signed in successfully!');
            } else {
                appState.authMode = 'signin';
                renderAuthPage();
                showAlert('Account created! Please sign in.');
            }
        } catch (error) {
            showAlert(error.message, 'error');
        }
    };
}

function renderOrganizationsPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="navbar">
            <div class="container navbar-content">
                <span class="navbar-brand"> Trello Board</span>
                <div class="navbar-menu">
                    <button class="btn-logout" onclick="logout()">Logout</button>
                </div>
            </div>
        </div>
        <div class="container dashboard">
            <div class="dashboard-header">
                <h1>My Organizations</h1>
                <button class="btn-secondary" onclick="openCreateOrgModal()">+ New Organization</button>
            </div>
            <div id="orgsContainer"></div>
        </div>
    `;

    loadOrganizations();
}

async function loadOrganizations() {
    try {
        // Note: Backend doesn't have a GET /organizations endpoint for all orgs
        // This would need to be added to the backend or we load from localStorage
        // For now, we'll load organizations when switching pages
        const container = document.getElementById('orgsContainer');
        container.innerHTML = `
            <div class="cards-grid">
                <div class="card" style="display: flex; align-items: center; justify-content: center; min-height: 200px;">
                    <button class="btn btn-primary" onclick="openCreateOrgModal()" style="width: 100%;">Create Your First Organization</button>
                </div>
            </div>
        `;
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

function openCreateOrgModal() {
    const content = `
        <div class="form-group">
            <label>Organization Name</label>
            <input type="text" id="orgTitle" placeholder="e.g., Tech Team" required>
        </div>
        <div class="form-group">
            <label>Description</label>
            <input type="text" id="orgDesc" placeholder="Describe your organization" required>
        </div>
    `;

    showModal(content, 'Create Organization', async () => {
        const title = document.getElementById('orgTitle').value;
        const description = document.getElementById('orgDesc').value;

        try {
            const result = await api.createOrganization(title, description);
            showAlert('Organization created!');
            appState.currentOrgId = result.id;
            loadOrganizationDetail(result.id);
        } catch (error) {
            showAlert(error.message, 'error');
        }
    });
}

async function loadOrganizationDetail(orgId) {
    try {
        const org = await api.getOrganization(orgId);
        appState.currentOrgId = orgId;
        renderOrganizationDetailPage(org.organization);
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

function renderOrganizationDetailPage(organization) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="navbar">
            <div class="container navbar-content">
                <span class="navbar-brand"> ${organization.title}</span>
                <div class="navbar-menu">
                    <a onclick="switchToOrganizations()">Organizations</a>
                    <button class="btn-logout" onclick="logout()">Logout</button>
                </div>
            </div>
        </div>
        <div class="container dashboard">
            <div class="dashboard-header">
                <div>
                    <h1>${organization.title}</h1>
                    <p style="color: #999; margin-top: 8px;">${organization.description}</p>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button class="btn-secondary" onclick="openAddMemberModal()">+ Add Member</button>
                    <button class="btn-secondary" onclick="openCreateBoardModal()">+ New Board</button>
                </div>
            </div>

            <div style="margin-bottom: 40px;">
                <h3 style="font-size: 20px; margin-bottom: 20px; color: #fff;">Team Members</h3>
                <div id="membersContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;"></div>
            </div>

            <div>
                <h3 style="font-size: 20px; margin-bottom: 20px; color: #fff;">Boards</h3>
                <div id="boardsContainer" class="cards-grid"></div>
            </div>
        </div>
    `;

    loadOrganizationMembers(organization.id);
    loadOrganizationBoards(organization.id);
}

async function loadOrganizationMembers(orgId) {
    try {
        const data = await api.getMembers(orgId);
        const container = document.getElementById('membersContainer');

        if (data.members.length === 0) {
            container.innerHTML = '<p style="color: #999;">No members yet</p>';
            return;
        }

        container.innerHTML = data.members.map(member => `
            <div class="card">
                <h3 style="font-size: 16px;">👤 ${member.username}</h3>
                <button class="card-btn" onclick="removeMember(${appState.currentOrgId}, '${member.username}')">Remove</button>
            </div>
        `).join('');
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function loadOrganizationBoards(orgId) {
    try {
        const data = await api.getBoards(orgId);
        const container = document.getElementById('boardsContainer');

        if (data.boards.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No boards yet</h3><p>Create your first board to get started</p></div>';
            return;
        }

        container.innerHTML = data.boards.map(board => `
            <div class="card" onclick="loadBoardDetail(${board.id})">
                <h3>📋 ${board.title}</h3>
                <p class="card-desc">${board.description}</p>
                <div class="card-meta">
                    <span>Issues</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

function openAddMemberModal() {
    const content = `
        <div class="form-group">
            <label>Username</label>
            <input type="text" id="memberUsername" placeholder="Enter username to add" required>
        </div>
    `;

    showModal(content, 'Add Member', async () => {
        const username = document.getElementById('memberUsername').value;

        try {
            await api.addMemberToOrganization(appState.currentOrgId, username);
            showAlert('Member added!');
            loadOrganizationDetail(appState.currentOrgId);
        } catch (error) {
            showAlert(error.message, 'error');
        }
    });
}

async function removeMember(orgId, username) {
    if (!confirm(`Remove ${username} from organization?`)) return;

    try {
        await api.removeMemberFromOrganization(orgId, username);
        showAlert('Member removed!');
        loadOrganizationDetail(orgId);
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

function openCreateBoardModal() {
    const content = `
        <div class="form-group">
            <label>Board Name</label>
            <input type="text" id="boardTitle" placeholder="e.g., Q1 Features" required>
        </div>
        <div class="form-group">
            <label>Description</label>
            <input type="text" id="boardDesc" placeholder="Describe your board" required>
        </div>
    `;

    showModal(content, 'Create Board', async () => {
        const title = document.getElementById('boardTitle').value;
        const description = document.getElementById('boardDesc').value;

        try {
            const result = await api.createBoard(appState.currentOrgId, title, description);
            showAlert('Board created!');
            loadOrganizationDetail(appState.currentOrgId);
        } catch (error) {
            showAlert(error.message, 'error');
        }
    });
}

async function loadBoardDetail(boardId) {
    try {
        appState.currentBoardId = boardId;
        const issuesData = await api.getIssues(boardId);
        renderBoardDetailPage(boardId, issuesData.issues);
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

function renderBoardDetailPage(boardId, issues) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="navbar">
            <div class="container navbar-content">
                <span class="navbar-brand"> Board</span>
                <div class="navbar-menu">
                    <a onclick="loadOrganizationDetail(${appState.currentOrgId})">Back to Organization</a>
                    <button class="btn-logout" onclick="logout()">Logout</button>
                </div>
            </div>
        </div>
        <div class="container dashboard">
            <div class="dashboard-header">
                <h1>Board Issues</h1>
                <button class="btn-secondary" onclick="openCreateIssueModal()">+ New Issue</button>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Assignee</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="issuesTable">
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const tbody = document.getElementById('issuesTable');
    if (issues.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">No issues yet</td></tr>';
        return;
    }

    tbody.innerHTML = issues.map(issue => `
        <tr>
            <td>${issue.title}</td>
            <td>${issue.description}</td>
            <td>${issue.assignee || '-'}</td>
            <td><span class="badge badge-${issue.status}">${issue.status}</span></td>
            <td>
                <button class="card-btn" onclick="editIssue(${issue.id})">Edit</button>
            </td>
        </tr>
    `).join('');
}

function openCreateIssueModal() {
    const content = `
        <div class="form-group">
            <label>Title</label>
            <input type="text" id="issueTitle" placeholder="Issue title" required>
        </div>
        <div class="form-group">
            <label>Description</label>
            <input type="text" id="issueDesc" placeholder="Issue description" required>
        </div>
        <div class="form-group">
            <label>Assignee ID (optional)</label>
            <input type="number" id="issueAssignee" placeholder="User ID">
        </div>
    `;

    showModal(content, 'Create Issue', async () => {
        const title = document.getElementById('issueTitle').value;
        const description = document.getElementById('issueDesc').value;
        const assignee = document.getElementById('issueAssignee').value || null;

        try {
            await api.createIssue(appState.currentBoardId, title, description, assignee);
            showAlert('Issue created!');
            loadBoardDetail(appState.currentBoardId);
        } catch (error) {
            showAlert(error.message, 'error');
        }
    });
}

function editIssue(issueId) {
    const content = `
        <div class="form-group">
            <label>Status</label>
            <select id="issueStatus" style="width: 100%; padding: 10px; background: #0f1428; border: 1px solid #2a3050; color: #e0e0e0; border-radius: 6px;">
                <option value="open">Open</option>
                <option value="closed">Closed</option>
            </select>
        </div>
    `;

    showModal(content, 'Update Issue', async () => {
        const status = document.getElementById('issueStatus').value;

        try {
            await api.updateIssue(issueId, { status });
            showAlert('Issue updated!');
            loadBoardDetail(appState.currentBoardId);
        } catch (error) {
            showAlert(error.message, 'error');
        }
    });
}

function switchToOrganizations() {
    renderOrganizationsPage();
}

function toggleAuthMode() {
    appState.authMode = appState.authMode === 'signin' ? 'signup' : 'signin';
    renderAuthPage();
}

function logout() {
    api.removeToken();
    appState.currentPage = 'auth';
    appState.authMode = 'signin';
    renderAuthPage();
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    const token = api.getToken();
    if (token) {
        renderOrganizationsPage();
    } else {
        renderAuthPage();
    }
});
