import { api } from '../api';

let lastGeocodingRequest = 0;
const NOMINATIM_DELAY = 1000;

export async function searchCity(cityName) {
    const now = Date.now();
    const timeSinceLastRequest = now - lastGeocodingRequest;

    if (timeSinceLastRequest < NOMINATIM_DELAY) {
        await new Promise(r => setTimeout(r, NOMINATIM_DELAY - timeSinceLastRequest));
    }

    lastGeocodingRequest = Date.now();
    return api.getGeocode(cityName);
}

export function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => resolve({
                lat: position.coords.latitude,
                lon: position.coords.longitude
            }),
            (error) => reject(error)
        );
    });
}
