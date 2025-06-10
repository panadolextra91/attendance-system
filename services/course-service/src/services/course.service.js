const dbService = require('./db.service');

/**
 * Get all courses
 */
const getAllCourses = async () => {
  const prisma = dbService.getClient();
  
  return prisma.course.findMany({
    include: {
      lectures: true
    }
  });
};

/**
 * Get course by ID
 * @param {string} id - Course ID
 */
const getCourseById = async (id) => {
  const prisma = dbService.getClient();
  
  return prisma.course.findUnique({
    where: { id },
    include: {
      lectures: true
    }
  });
};

/**
 * Get course by code
 * @param {string} code - Course code
 */
const getCourseByCode = async (code) => {
  const prisma = dbService.getClient();
  
  return prisma.course.findUnique({
    where: { code }
  });
};

/**
 * Create new course
 * @param {Object} courseData - Course data
 */
const createCourse = async (courseData) => {
  const prisma = dbService.getClient();
  
  // Check if course code already exists
  const existingCourse = await getCourseByCode(courseData.code);
  if (existingCourse) {
    throw new Error('Course code already exists');
  }
  
  return prisma.course.create({
    data: courseData
  });
};

/**
 * Update course
 * @param {string} id - Course ID
 * @param {Object} courseData - Updated course data
 */
const updateCourse = async (id, courseData) => {
  const prisma = dbService.getClient();
  
  // Check if course exists
  const existingCourse = await getCourseById(id);
  if (!existingCourse) {
    throw new Error('Course not found');
  }
  
  // If code is changing, check if new code already exists
  if (courseData.code && courseData.code !== existingCourse.code) {
    const courseWithCode = await getCourseByCode(courseData.code);
    if (courseWithCode) {
      throw new Error('Course code already exists');
    }
  }
  
  return prisma.course.update({
    where: { id },
    data: courseData
  });
};

/**
 * Delete course
 * @param {string} id - Course ID
 */
const deleteCourse = async (id) => {
  const prisma = dbService.getClient();
  
  // This will also delete all related lectures due to the cascade delete
  return prisma.course.delete({
    where: { id }
  });
};

/**
 * Get courses by teacher ID
 * @param {string} teacherId - Teacher ID
 */
const getCoursesByTeacher = async (teacherId) => {
  const prisma = dbService.getClient();
  
  return prisma.course.findMany({
    where: { teacherId },
    include: {
      lectures: true
    }
  });
};

module.exports = {
  getAllCourses,
  getCourseById,
  getCourseByCode,
  createCourse,
  updateCourse,
  deleteCourse,
  getCoursesByTeacher
}; 