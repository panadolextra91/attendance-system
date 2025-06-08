const userService = require('../services/user.service');

class UserController {
  async getAllUsers(req, res) {
    try {
      const users = await userService.findAll();
      return res.json(users);
    } catch (error) {
      console.error('Error in getAllUsers controller:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      
      const user = await userService.findById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Remove sensitive data
      const { password, ...userWithoutPassword } = user;
      
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error in getUserById controller:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      // Remove password from update if present
      if (userData.password) {
        delete userData.password;
      }
      
      const user = await userService.update(id, userData);
      
      // Remove sensitive data
      const { password, ...userWithoutPassword } = user;
      
      return res.json({
        message: 'User updated successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Error in updateUser controller:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      await userService.delete(id);
      
      return res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error in deleteUser controller:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Role-based user filtering methods
  async getStudents(req, res) {
    try {
      const students = await userService.findByRole('STUDENT');
      return res.json({
        message: 'Student area',
        students
      });
    } catch (error) {
      console.error('Error in getStudents controller:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTeachers(req, res) {
    try {
      const teachers = await userService.findByRole('TEACHER');
      return res.json({
        message: 'Teacher area',
        teachers
      });
    } catch (error) {
      console.error('Error in getTeachers controller:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAdmins(req, res) {
    try {
      const admins = await userService.findByRole('ADMIN');
      return res.json({
        message: 'Admin area',
        admins
      });
    } catch (error) {
      console.error('Error in getAdmins controller:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Singleton instance
const userController = new UserController();

module.exports = userController; 