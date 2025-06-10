const courseService = require('../services/course.service');

/**
 * Get all courses
 */
const getAllCourses = async (req, res) => {
  try {
    const courses = await courseService.getAllCourses();
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error getting all courses:', error);
    res.status(500).json({ error: 'Failed to get courses' });
  }
};

/**
 * Get course by ID
 */
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await courseService.getCourseById(id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.status(200).json(course);
  } catch (error) {
    console.error(`Error getting course ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to get course' });
  }
};

/**
 * Create new course
 */
const createCourse = async (req, res) => {
  try {
    const { code, name, description, department, credits } = req.body;
    
    // Validate required fields
    if (!code || !name || !department || !credits) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get teacher ID from authenticated user
    const teacherId = req.user.id;
    
    // Create course
    const course = await courseService.createCourse({
      code,
      name,
      description,
      department,
      credits: parseInt(credits),
      teacherId
    });
    
    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    
    if (error.message === 'Course code already exists') {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to create course' });
  }
};

/**
 * Update course
 */
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, department, credits } = req.body;
    
    // Get current course to check ownership
    const existingCourse = await courseService.getCourseById(id);
    
    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Check if user is the teacher of this course or an admin
    const isAdmin = req.user.role === 'ADMIN';
    const isTeacherOwner = req.user.role === 'TEACHER' && existingCourse.teacherId === req.user.id;
    
    if (!isAdmin && !isTeacherOwner) {
      return res.status(403).json({ error: 'You do not have permission to update this course' });
    }
    
    // Update course
    const updatedCourse = await courseService.updateCourse(id, {
      code,
      name,
      description,
      department,
      credits: credits ? parseInt(credits) : undefined
    });
    
    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error(`Error updating course ${req.params.id}:`, error);
    
    if (error.message === 'Course code already exists') {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to update course' });
  }
};

/**
 * Delete course
 */
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current course to check ownership
    const existingCourse = await courseService.getCourseById(id);
    
    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Check if user is the teacher of this course or an admin
    const isAdmin = req.user.role === 'ADMIN';
    const isTeacherOwner = req.user.role === 'TEACHER' && existingCourse.teacherId === req.user.id;
    
    if (!isAdmin && !isTeacherOwner) {
      return res.status(403).json({ error: 'You do not have permission to delete this course' });
    }
    
    // Delete course
    await courseService.deleteCourse(id);
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting course ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
}; 