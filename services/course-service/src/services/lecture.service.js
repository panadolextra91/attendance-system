const dbService = require('./db.service');
const locationClient = require('./location.client');

/**
 * Get all lectures
 */
const getAllLectures = async () => {
  const prisma = dbService.getClient();
  
  return prisma.lecture.findMany({
    include: {
      course: true
    }
  });
};

/**
 * Get lectures by course ID
 * @param {string} courseId - Course ID
 */
const getLecturesByCourse = async (courseId) => {
  const prisma = dbService.getClient();
  
  return prisma.lecture.findMany({
    where: { courseId },
    orderBy: {
      startTime: 'asc'
    }
  });
};

/**
 * Get lecture by ID
 * @param {string} id - Lecture ID
 */
const getLectureById = async (id) => {
  const prisma = dbService.getClient();
  
  return prisma.lecture.findUnique({
    where: { id },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          code: true,
          teacherId: true
        }
      }
    }
  });
};

/**
 * Create new lecture
 * @param {Object} lectureData - Lecture data
 */
const createLecture = async (lectureData) => {
  const prisma = dbService.getClient();
  
  // Validate location if provided
  if (lectureData.locationId) {
    await locationClient.validateLocation(lectureData.locationId, lectureData.type || 'OFFLINE');
  } else if (lectureData.type !== 'ONLINE') {
    throw new Error('Location ID is required for offline lectures');
  }
  
  // Ensure locationId is null for ONLINE lectures
  const data = {
    ...lectureData,
    locationId: lectureData.type === 'ONLINE' ? null : lectureData.locationId
  };
  
  return prisma.lecture.create({
    data,
    include: {
      course: true
    }
  });
};

/**
 * Update lecture
 * @param {string} id - Lecture ID
 * @param {Object} lectureData - Updated lecture data
 */
const updateLecture = async (id, lectureData) => {
  // If updating location or type, validate the location
  if (lectureData.locationId || lectureData.type) {
    const existing = await getLectureById(id);
    const type = lectureData.type || existing.type;
    const locationId = lectureData.locationId || existing.locationId;
    
    await locationClient.validateLocation(locationId, type);
  }
  const prisma = dbService.getClient();
  
  // If type is being set to ONLINE, ensure locationId is null
  const data = { ...lectureData };
  if (data.type === 'ONLINE') {
    data.locationId = null;
  }
  
  return prisma.lecture.update({
    where: { id },
    data,
    include: {
      course: true
    }
  });
};

/**
 * Delete lecture
 * @param {string} id - Lecture ID
 */
const deleteLecture = async (id) => {
  const prisma = dbService.getClient();
  
  return prisma.lecture.delete({
    where: { id }
  });
};

/**
 * Get upcoming lectures for a course
 * @param {string} courseId - Course ID
 */
const getUpcomingLectures = async (courseId) => {
  const prisma = dbService.getClient();
  const now = new Date();
  
  return prisma.lecture.findMany({
    where: {
      courseId,
      startTime: {
        gte: now
      }
    },
    orderBy: {
      startTime: 'asc'
    }
  });
};

module.exports = {
  getAllLectures,
  getLecturesByCourse,
  getLectureById,
  createLecture,
  updateLecture,
  deleteLecture,
  getUpcomingLectures
}; 