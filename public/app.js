let authHeader = localStorage.getItem('authHeader');
let currentUser = null;

// DOM Elements
const userList = document.getElementById('userList');
const loginModal = document.getElementById('loginModal');
const userModal = document.getElementById('userModal');
const userForm = document.getElementById('userForm');
const loginForm = document.getElementById('loginForm');
const addUserBtn = document.getElementById('addUserBtn');
const refreshBtn = document.getElementById('refreshBtn');
const logoutBtn = document.getElementById('logoutBtn');
const cancelBtn = document.getElementById('cancelBtn');
const toggleAuth = document.getElementById('toggleAuth');
const authTitle = document.getElementById('authTitle');
const authSubmit = document.getElementById('authSubmit');
const emailGroup = document.getElementById('emailGroup');
const authHint = document.getElementById('authHint');

let isRegistering = false;

// Initialize
function init() {
    if (!authHeader) {
        showLogin();
    } else {
        fetchUsers();
        document.getElementById('currentUser').textContent = 'Connected';
    }
}

function showLogin() {
    loginModal.style.display = 'flex';
}

function hideLogin() {
    loginModal.style.display = 'none';
}

toggleAuth.addEventListener('click', (e) => {
    e.preventDefault();
    isRegistering = !isRegistering;
    authTitle.textContent = isRegistering ? 'Register New User' : 'Authentication Required';
    authSubmit.textContent = isRegistering ? 'Register' : 'Login';
    emailGroup.style.display = isRegistering ? 'block' : 'none';
    authHint.innerHTML = isRegistering ?
        'Already have an account? <a href="#" id="toggleAuth">Login</a>' :
        'Don\'t have an account? <a href="#" id="toggleAuth">Register</a>';

    // Re-attach listener because we replaced innerHTML
    document.getElementById('toggleAuth').addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuth.click();
    });
});

// Auth Handlers
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('authUsername').value;
    const pass = document.getElementById('authPassword').value;

    if (isRegistering) {
        const email = document.getElementById('authEmail').value;
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, email, password: pass })
            });
            if (res.ok) {
                alert('Registration successful! Please login.');
                toggleAuth.click();
            } else {
                const data = await res.json();
                alert('Registration failed: ' + data.message);
            }
        } catch (err) {
            alert('Error connecting to server');
        }
        return;
    }

    const header = 'Basic ' + btoa(user + ':' + pass);

    // Test credentials by trying to fetch status or users
    try {
        const res = await fetch('/api/users', {
            headers: { 'Authorization': header }
        });

        if (res.ok) {
            authHeader = header;
            localStorage.setItem('authHeader', header);
            hideLogin();
            fetchUsers();
            document.getElementById('currentUser').textContent = 'Connected: ' + user;
        } else if (res.status === 401) {
            // Check if we can just create the user if 401 and it's the first time?
            // Actually, let's just show an error.
            alert('Invalid credentials. If this is the first run, you might need to register a user via the console or a direct POST request.');
        } else {
            alert('Server error');
        }
    } catch (err) {
        console.error(err);
        alert('Could not connect to server');
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('authHeader');
    authHeader = null;
    location.reload();
});

// CRUD Operations
async function fetchUsers() {
    try {
        const res = await fetch('/api/users', {
            headers: { 'Authorization': authHeader }
        });
        if (res.status === 401) return showLogin();

        const users = await res.json();
        renderUsers(users);
    } catch (err) {
        console.error(err);
    }
}

function renderUsers(users) {
    userList.innerHTML = '';
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="badge ${user.role}">${user.role}</span></td>
            <td>
                <button class="btn-edit" onclick="editUser('${user._id}')">Edit</button>
                <button class="btn-danger" onclick="deleteUser('${user._id}')">Delete</button>
            </td>
        `;
        userList.appendChild(row);
    });
}

addUserBtn.addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = 'Add New User';
    document.getElementById('passwordGroup').style.display = 'block';
    userForm.reset();
    document.getElementById('userId').value = '';
    userModal.style.display = 'flex';
});

cancelBtn.addEventListener('click', () => {
    userModal.style.display = 'none';
});

async function editUser(id) {
    try {
        const res = await fetch(`/api/users/${id}`, {
            headers: { 'Authorization': authHeader }
        });
        const user = await res.json();

        document.getElementById('modalTitle').textContent = 'Edit User';
        document.getElementById('passwordGroup').style.display = 'none';
        document.getElementById('userId').value = user._id;
        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;
        document.getElementById('role').value = user.role;

        userModal.style.display = 'flex';
    } catch (err) {
        alert('Error fetching user details');
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        const res = await fetch(`/api/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': authHeader }
        });
        if (res.ok) {
            fetchUsers();
        } else {
            alert('Failed to delete user');
        }
    } catch (err) {
        alert('Error deleting user');
    }
}

userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('userId').value;
    const userData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value
    };

    if (!id) {
        userData.password = document.getElementById('password').value;
    }

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/users/${id}` : '/api/users';

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify(userData)
        });

        if (res.ok) {
            userModal.style.display = 'none';
            fetchUsers();
        } else {
            const data = await res.json();
            alert('Error: ' + data.message);
        }
    } catch (err) {
        alert('Error saving user');
    }
});

refreshBtn.addEventListener('click', fetchUsers);

// Start
init();
