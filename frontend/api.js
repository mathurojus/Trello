const API_BASE_URL = 'http://localhost:3000';

const api = {
    getToken() {
        return localStorage.getItem('token');
    },

    setToken(token) {
        localStorage.setItem('token', token);
    },

    removeToken() {
        localStorage.removeItem('token');
    },

    async request(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const token = this.getToken();
        if (token) {
            options.headers.token = token;
        }

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API Error');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Auth
    signup(username, password) {
        return this.request('/signup', 'POST', { username, password });
    },

    signin(username, password) {
        return this.request('/signin', 'POST', { username, password });
    },

    // Organizations
    createOrganization(title, description) {
        return this.request('/organization', 'POST', { title, description });
    },

    getOrganization(organizationId) {
        return this.request(`/organization?organizationId=${organizationId}`, 'GET');
    },

    addMemberToOrganization(organizationId, memberUserUsername) {
        return this.request('/add-member-to-organization', 'POST', { organizationId, memberUserUsername });
    },

    removeMemberFromOrganization(organizationId, memberUserUsername) {
        return this.request('/members', 'DELETE', { organizationId, memberUserUsername });
    },

    getMembers(organizationId) {
        return this.request(`/members?organizationId=${organizationId}`, 'GET');
    },

    // Boards
    createBoard(organizationId, title, description) {
        return this.request('/board', 'POST', { organizationId, title, description });
    },

    getBoards(organizationId) {
        return this.request(`/boards?organizationId=${organizationId}`, 'GET');
    },

    // Issues
    createIssue(boardId, title, description, assignee) {
        return this.request('/issue', 'POST', { boardId, title, description, assignee });
    },

    getIssues(boardId, assignee) {
        let endpoint = '/issues?';
        if (boardId) endpoint += `boardId=${boardId}`;
        if (assignee) endpoint += `${boardId ? '&' : ''}assignee=${assignee}`;
        return this.request(endpoint, 'GET');
    },

    updateIssue(issueId, updates) {
        return this.request('/issues', 'PUT', { issueId, ...updates });
    }
};
