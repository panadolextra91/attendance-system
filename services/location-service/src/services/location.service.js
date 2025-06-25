const dbService = require('./db.service');

class LocationService {
  async createLocation(data) {
    const prisma = dbService.getClient();
    
    // Validate required fields based on location type
    if (data.type === 'AUDITORIUM') {
      if (!data.latitude || !data.longitude) {
        throw new Error('Latitude and longitude are required for physical locations');
      }
      data.radius = data.radius || 50; // Default 50m radius for physical locations
    } else if (data.type === 'ONLINE' && !data.meetingLink) {
      throw new Error('Meeting link is required for online locations');
    }

    return prisma.location.create({
      data: {
        ...data,
        // Clear location-specific fields if not applicable
        ...(data.type !== 'AUDITORIUM' && {
          latitude: null,
          longitude: null,
          radius: null,
        }),
        ...(data.type !== 'ONLINE' && {
          meetingLink: null,
        })
      }
    });
  }

  async getLocation(id) {
    const prisma = dbService.getClient();
    return prisma.location.findUnique({
      where: { id }
    });
  }

  async listLocations({ type, isActive } = {}) {
    const prisma = dbService.getClient();
    const where = {};
    
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    
    return prisma.location.findMany({
      where,
      orderBy: { name: 'asc' }
    });
  }

  async updateLocation(id, data) {
    const prisma = dbService.getClient();
    
    // Get existing location to check type
    const existing = await this.getLocation(id);
    if (!existing) {
      throw new Error('Location not found');
    }

    // Validate updates based on location type
    if (data.type === 'AUDITORIUM' || existing.type === 'AUDITORIUM') {
      if (data.latitude === null || data.longitude === null) {
        throw new Error('Latitude and longitude are required for physical locations');
      }
      data.radius = data.radius || 50;
    } else if (data.type === 'ONLINE' || existing.type === 'ONLINE') {
      if (data.meetingLink === '') {
        throw new Error('Meeting link is required for online locations');
      }
    }

    return prisma.location.update({
      where: { id },
      data: {
        ...data,
        // Clear location-specific fields if type is changing
        ...(data.type && data.type !== existing.type && {
          ...(data.type !== 'AUDITORIUM' && {
            latitude: null,
            longitude: null,
            radius: null,
          }),
          ...(data.type !== 'ONLINE' && {
            meetingLink: null,
          })
        })
      }
    });
  }

  async deleteLocation(id) {
    const prisma = dbService.getClient();
    
    // Check if location is used in any lectures
    const lectureCount = await prisma.lecture.count({
      where: { locationId: id }
    });
    
    if (lectureCount > 0) {
      throw new Error('Cannot delete location that is being used by one or more lectures');
    }
    
    return prisma.location.delete({
      where: { id }
    });
  }
}

module.exports = new LocationService();
