const API_URL = 'http://localhost:8000';

// Gestion des alertes
function showAlert(message, type = 'danger') {
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) {
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
}

// Authentification
async function login(email, password) {
    try {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });
        
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.access_token);
            return true;
        } else {
            showAlert(data.detail || 'Erreur de connexion');
            return false;
        }
    } catch (error) {
        showAlert('Impossible de contacter le serveur');
        return false;
    }
}

async function register(email, password) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (response.ok) {
            return true;
        } else {
            showAlert(data.detail || "Erreur lors de l'inscription");
            return false;
        }
    } catch (error) {
        showAlert('Impossible de contacter le serveur');
        return false;
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

async function getMe() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        const response = await fetch(`${API_URL}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) return await response.json();
        return null;
    } catch (error) {
        return null;
    }
}

// Réservations
async function getReservations() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/reservations/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) return await response.json();
        return [];
    } catch (error) {
        showAlert('Erreur lors du chargement des réservations');
        return [];
    }
}

async function createReservation(reservationData) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/reservations/`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reservationData)
        });
        
        if (response.ok) {
            showAlert('Réservation créée avec succès !', 'success');
            return true;
        } else {
            const data = await response.json();
            showAlert(data.detail || 'Erreur lors de la création');
            return false;
        }
    } catch (error) {
        showAlert('Erreur de connexion');
        return false;
    }
}

async function updateReservation(id, reservationData) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/reservations/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reservationData)
        });
        
        if (response.ok) {
            showAlert('Réservation mise à jour !', 'success');
            return true;
        } else {
            const data = await response.json();
            showAlert(data.detail || 'Erreur lors de la mise à jour');
            return false;
        }
    } catch (error) {
        showAlert('Erreur de connexion');
        return false;
    }
}

async function deleteReservation(id) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/reservations/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            showAlert('Réservation supprimée !', 'success');
            return true;
        } else {
            const data = await response.json();
            showAlert(data.detail || 'Erreur lors de la suppression');
            return false;
        }
    } catch (error) {
        showAlert('Erreur de connexion');
        return false;
    }
}
