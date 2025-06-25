const lectureService = require('../services/lecture.service');
const courseService = require('../services/course.service');

/**
 * Get all lectures
 */
const getAllLectures = async (req, res) => {
  try {
    const lectures = await lectureService.getAllLectures();
    res.status(200).json(lectures);
  } catch (error) {
    console.error('Error getting all lectures:', error);
    res.status(500).json({ error: 'Failed to get lectures' });
  }
};

/**
 * Get lectures by course ID
 */
const getLecturesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lectures = await lectureService.getLecturesByCourse(courseId);
    res.status(200).json(lectures);
  } catch (error) {
    console.error(`Error getting lectures for course ${req.params.courseId}:`, error);
    res.status(500).json({ error: 'Failed to get lectures' });
  }
};

/**
 * Get lecture by ID
 */
const getLectureById = async (req, res) => {
  try {
    const { id } = req.params;
    const lecture = await lectureService.getLectureById(id);
    
    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }
    
    res.status(200).json(lecture);
  } catch (error) {
    console.error(`Error getting lecture ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to get lecture' });
  }
};

/**
 * Create new lecture
 */
const createLecture = async (req, res) => {
  try {
    const { title, startTime, endTime, locationId, courseId, type = 'OFFLINE' } = req.body;
    
    // Validate required fields
    if (!startTime || !endTime || !courseId || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate type
    if (!['ONLINE', 'OFFLINE'].includes(type)) {
      return res.status(400).json({ error: 'Invalid lecture type. Must be ONLINE or OFFLINE' });
    }

    // Validate location for OFFLINE lectures
    if (type === 'OFFLINE' && !locationId) {
      return res.status(400).json({ error: 'Location ID is required for OFFLINE lectures' });
    }
    
    // Check if course exists and user has permission
    const course = await courseService.getCourseById(courseId);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Check if user is the teacher of this course or an admin
    const isAdmin = req.user.role === 'ADMIN';
    const userId = req.user.sub || req.user.id;
    const isTeacherOwner = req.user.role === 'TEACHER' && course.teacherId === userId;
    
    if (!isAdmin && !isTeacherOwner) {
      return res.status(403).json({ error: 'You do not have permission to add lectures to this course' });
    }
    
    // Create lecture
    const lecture = await lectureService.createLecture({
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      type,
      locationId: type === 'ONLINE' ? null : locationId, // Only set locationId for OFFLINE lectures
      courseId
    });
    
    res.status(201).json(lecture);
  } catch (error) {
    console.error('Error creating lecture:', error);
    res.status(500).json({ error: 'Failed to create lecture' });
  }
};

/**
 * Update lecture
 */
const updateLecture = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, startTime, endTime, locationId, type } = req.body;
    
    // If type is being updated, validate it
    if (type && !['ONLINE', 'OFFLINE'].includes(type)) {
      return res.status(400).json({ error: 'Invalid lecture type. Must be ONLINE or OFFLINE' });
    }
    
    // If updating to OFFLINE, ensure locationId is provided
    if (type === 'OFFLINE' && !locationId) {
      return res.status(400).json({ error: 'Location ID is required for OFFLINE lectures' });
    }
    
    // Get current lecture to check course ownership
    const existingLecture = await lectureService.getLectureById(id);
    
    if (!existingLecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }
    
    // Get course to check ownership
    const course = await courseService.getCourseById(existingLecture.courseId);
    
    // Check if user is the teacher of this course or an admin
    const isAdmin = req.user.role === 'ADMIN';
    const userId = req.user.sub || req.user.id;
    const isTeacherOwner = req.user.role === 'TEACHER' && course.teacherId === userId;
    
    if (!isAdmin && !isTeacherOwner) {
      return res.status(403).json({ error: 'You do not have permission to update this lecture' });
    }
    
    // Update lecture
    const updateData = {
      title,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      type,
      locationId: type === 'ONLINE' ? null : locationId // Clear location if switching to ONLINE
    };
    
    // Only include fields that are being updated
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    
    const updatedLecture = await lectureService.updateLecture(id, updateData);
    
    res.status(200).json(updatedLecture);
  } catch (error) {
    console.error(`Error updating lecture ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update lecture' });
  }
};

/**
 * Delete lecture
 */
const deleteLecture = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current lecture to check course ownership
    const existingLecture = await lectureService.getLectureById(id);
    
    if (!existingLecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }
    
    // Get course to check ownership
    const course = await courseService.getCourseById(existingLecture.courseId);
    
    // Check if user is the teacher of this course or an admin
    const isAdmin = req.user.role === 'ADMIN';
    const userId = req.user.sub || req.user.id;
    const isTeacherOwner = req.user.role === 'TEACHER' && course.teacherId === userId;
    
    if (!isAdmin && !isTeacherOwner) {
      return res.status(403).json({ error: 'You do not have permission to delete this lecture' });
    }
    
    // Delete lecture
    await lectureService.deleteLecture(id);
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting lecture ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete lecture' });
  }
};

module.exports = {
  getAllLectures,
  getLecturesByCourse,
  getLectureById,
  createLecture,
  updateLecture,
  deleteLecture
}; 