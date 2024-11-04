import api from './api'; // Importer l'instance API

export const getHotels = async () => {
    try {
        const response = await api.get('/hotels');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des hôtels', error);
        throw error;
    }
};

export const createHotel = async (hotelData) => {
    try {
        const response = await api.post('/hotels', hotelData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création de l\'hôtel', error);
        throw error;
    }
};

export const updateHotel = async (hotelId, hotelData) => {
    try {
        const response = await api.put(`/hotels/${hotelId}`, hotelData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'hôtel', error);
        throw error;
    }
};

export const deleteHotel = async (hotelId) => {
    try {
        const response = await api.delete(`/hotels/${hotelId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'hôtel', error);
        throw error;
    }
};
