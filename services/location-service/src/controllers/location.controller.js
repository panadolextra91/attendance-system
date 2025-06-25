const locationService = require('../services/location.service');

const createLocation = async (req, res) => {
  try {
    const location = await locationService.createLocation(req.body);
    res.status(201).json(location);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getLocation = async (req, res) => {
  try {
    const location = await locationService.getLocation(req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listLocations = async (req, res) => {
  try {
    const locations = await locationService.listLocations({
      type: req.query.type,
      isActive: req.query.isActive
    });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    const location = await locationService.updateLocation(req.params.id, req.body);
    res.json(location);
  } catch (error) {
    if (error.message === 'Location not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};

const deleteLocation = async (req, res) => {
  try {
    await locationService.deleteLocation(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'Location not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createLocation,
  getLocation,
  listLocations,
  updateLocation,
  deleteLocation
};
