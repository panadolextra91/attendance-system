const axios = require('axios');
const config = require('../config');

class LocationClient {
  constructor() {
    this.client = axios.create({
      baseURL: config.services.locationServiceUrl,
      timeout: 5000,
    });
  }

  async getLocation(locationId) {
    try {
      const response = await this.client.get(`/api/locations/${locationId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch location: ${error.message}`);
    }
  }

  async validateLocation(locationId, type) {
    if (!locationId && type === 'ONLINE') {
      return true; // Online lectures don't need a location
    }

    if (!locationId) {
      throw new Error('Location ID is required for offline lectures');
    }

    const location = await this.getLocation(locationId);
    if (!location) {
      throw new Error('Location not found');
    }

    if (type === 'OFFLINE' && location.type !== 'AUDITORIUM') {
      throw new Error('Invalid location type for offline lecture');
    }

    if (type === 'ONLINE' && location.type !== 'ONLINE') {
      throw new Error('Invalid location type for online lecture');
    }

    if (!location.isActive) {
      throw new Error('Location is not active');
    }

    return true;
  }
}

module.exports = new LocationClient();
