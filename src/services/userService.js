import api from './api'; // Importer l'instance API

// Récupérer les informations d'un utilisateur par son ID
export const getUser = async (userId) => {
    try {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur', error);
        throw error;
    }
};

// Inscription d'un nouvel utilisateur
export const registerUser = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData); // URL pour l'inscription
        return response.data;
    } catch (error) {
        console.error('Erreur lors de l\'inscription', error);
        throw error;
    }
};

// Connexion d'un utilisateur
export const loginUser = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials); // URL pour la connexion
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la connexion', error);
        throw error;
    }
};

// Mise à jour d'un utilisateur
export const updateUser = async (userId, userData) => {
    try {
        const response = await api.put(`/users/${userId}`, userData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur', error);
        throw error;
    }
};

// Suppression d'un utilisateur
export const deleteUser = async (userId) => {
    try {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur', error);
        throw error;
    }
};

// Déconnexion d'un utilisateur
export const logoutUser = async () => {
    try {
        const response = await api.post('/auth/logout'); // URL pour la déconnexion
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la déconnexion', error);
        throw error;
    }
};
