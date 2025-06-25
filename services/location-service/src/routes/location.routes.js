const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const { body, param } = require('express-validator');

// Create a new location
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('type').isIn(['AUDITORIUM', 'ONLINE']).withMessage('Invalid location type'),
  body('description').optional().isString(),
  body('capacity').optional().isInt({ min: 1 }),
  body('latitude').if(body('type').equals('AUDITORIUM')).isFloat({ min: -90, max: 90 }),
  body('longitude').if(body('type').equals('AUDITORIUM')).isFloat({ min: -180, max: 180 }),
  body('radius').optional().isInt({ min: 1 }),
  body('meetingLink').if(body('type').equals('ONLINE')).isURL()
], locationController.createLocation);

// Get all locations
router.get('/', locationController.listLocations);

// Get a single location
router.get('/:id', [
  param('id').isUUID()
], locationController.getLocation);

// Update a location
router.put('/:id', [
  param('id').isUUID(),
  body('name').optional().notEmpty(),
  body('type').optional().isIn(['AUDITORIUM', 'ONLINE']),
  body('description').optional().isString(),
  body('capacity').optional().isInt({ min: 1 }),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('radius').optional().isInt({ min: 1 }),
  body('meetingLink').optional().isURL(),
  body('isActive').optional().isBoolean()
], locationController.updateLocation);

// Delete a location
router.delete('/:id', [
  param('id').isUUID()
], locationController.deleteLocation);

module.exports = router;
