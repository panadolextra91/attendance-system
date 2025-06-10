const dbService = require('./db.service');

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
      course: true
    }
  });
};

/**
 * Create new lecture
 * @param {Object} lectureData - Lecture data
 */
const createLecture = async (lectureData) => {
  const prisma = dbService.getClient();
  
  return prisma.lecture.create({
    data: lectureData
  });
};

/**
 * Update lecture
 * @param {string} id - Lecture ID
 * @param {Object} lectureData - Updated lecture data
 */
const updateLecture = async (id, lectureData) => {
  const prisma = dbService.getClient();
  
  return prisma.lecture.update({
    where: { id },
    data: lectureData
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