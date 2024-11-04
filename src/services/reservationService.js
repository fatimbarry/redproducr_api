import api from './api'; // Importer l'instance API

export const getReservations = async () => {
    try {
        const response = await api.get('/reservations');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des réservations', error);
        throw error;
    }
};

export const createReservation = async (reservationData) => {
    try {
        const response = await api.post('/reservations', reservationData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création de la réservation', error);
        throw error;
    }
};

export const updateReservation = async (reservationId, reservationData) => {
    try {
        const response = await api.put(`/reservations/${reservationId}`, reservationData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la réservation', error);
        throw error;
    }
};

export const deleteReservation = async (reservationId) => {
    try {
        const response = await api.delete(`/reservations/${reservationId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression de la réservation', error);
        throw error;
    }
};
