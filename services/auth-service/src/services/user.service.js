const dbService = require('./db.service');

class UserService {
  constructor() {
    this.prisma = dbService.getPrismaClient();
  }

  async findAll() {
    try {
      return await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          createdAt: true
        }
      });
    } catch (error) {
      console.error('Error finding users:', error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
        include: {
          studentProfile: true,
          teacherProfile: true,
          adminProfile: true
        }
      });
    } catch (error) {
      console.error(`Error finding user by email ${email}:`, error);
      throw error;
    }
  }

  async findById(id) {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
        include: {
          studentProfile: true,
          teacherProfile: true,
          adminProfile: true
        }
      });
    } catch (error) {
      console.error(`Error finding user by id ${id}:`, error);
      throw error;
    }
  }

  async findByRole(role) {
    try {
      // Get users with specific role, including their respective profiles
      const users = await this.prisma.user.findMany({
        where: { role },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          // Include the profile that matches the role
          studentProfile: role === 'STUDENT',
          teacherProfile: role === 'TEACHER',
          adminProfile: role === 'ADMIN'
        }
      });
      
      // Transform the result to include profile data in a uniform way
      return users.map(user => {
        const { studentProfile, teacherProfile, adminProfile, ...userData } = user;
        
        // Determine which profile to use
        let profile = null;
        if (role === 'STUDENT') profile = studentProfile;
        else if (role === 'TEACHER') profile = teacherProfile;
        else if (role === 'ADMIN') profile = adminProfile;
        
        return {
          ...userData,
          profile
        };
      });
    } catch (error) {
      console.error(`Error finding users by role ${role}:`, error);
      throw error;
    }
  }

  async create(userData) {
    try {
      // Extract profile data based on role
      const { studentProfile, teacherProfile, adminProfile, ...userDataOnly } = userData;
      
      // Create user with appropriate profile using a transaction
      return await this.prisma.$transaction(async (prisma) => {
        // Create the base user
        const user = await prisma.user.create({
          data: userDataOnly
        });
        
        // Based on role, create the appropriate profile
        if (user.role === 'STUDENT' && studentProfile) {
          await prisma.studentProfile.create({
            data: {
              ...studentProfile,
              userId: user.id
            }
          });
        } else if (user.role === 'TEACHER' && teacherProfile) {
          await prisma.teacherProfile.create({
            data: {
              ...teacherProfile,
              userId: user.id
            }
          });
        } else if (user.role === 'ADMIN' && adminProfile) {
          await prisma.adminProfile.create({
            data: {
              ...adminProfile,
              userId: user.id
            }
          });
        }
        
        // Return the created user with their profile
        return await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            studentProfile: user.role === 'STUDENT',
            teacherProfile: user.role === 'TEACHER',
            adminProfile: user.role === 'ADMIN'
          }
        });
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async update(id, userData) {
    try {
      // Extract profile data based on role
      const { studentProfile, teacherProfile, adminProfile, ...userDataOnly } = userData;
      
      // Update user and profile in a transaction
      return await this.prisma.$transaction(async (prisma) => {
        // Get current user to determine role
        const currentUser = await prisma.user.findUnique({
          where: { id },
          select: { role: true }
        });
        
        if (!currentUser) {
          throw new Error('User not found');
        }
        
        // Update the base user data
        const user = await prisma.user.update({
          where: { id },
          data: userDataOnly
        });
        
        // Update the appropriate profile based on role
        if (user.role === 'STUDENT' && studentProfile) {
          // Check if profile exists
          const existingProfile = await prisma.studentProfile.findUnique({
            where: { userId: id }
          });
          
          if (existingProfile) {
            await prisma.studentProfile.update({
              where: { userId: id },
              data: studentProfile
            });
          } else {
            await prisma.studentProfile.create({
              data: {
                ...studentProfile,
                userId: id
              }
            });
          }
        } else if (user.role === 'TEACHER' && teacherProfile) {
          const existingProfile = await prisma.teacherProfile.findUnique({
            where: { userId: id }
          });
          
          if (existingProfile) {
            await prisma.teacherProfile.update({
              where: { userId: id },
              data: teacherProfile
            });
          } else {
            await prisma.teacherProfile.create({
              data: {
                ...teacherProfile,
                userId: id
              }
            });
          }
        } else if (user.role === 'ADMIN' && adminProfile) {
          const existingProfile = await prisma.adminProfile.findUnique({
            where: { userId: id }
          });
          
          if (existingProfile) {
            await prisma.adminProfile.update({
              where: { userId: id },
              data: adminProfile
            });
          } else {
            await prisma.adminProfile.create({
              data: {
                ...adminProfile,
                userId: id
              }
            });
          }
        }
        
        // Return the updated user with profile
        return await prisma.user.findUnique({
          where: { id },
          include: {
            studentProfile: user.role === 'STUDENT',
            teacherProfile: user.role === 'TEACHER',
            adminProfile: user.role === 'ADMIN'
          }
        });
      });
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  async delete(id) {
    try {
      // Deleting the user will cascade delete the profile due to the relation definition
      return await this.prisma.user.delete({
        where: { id }
      });
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }
}

// Singleton instance
const userService = new UserService();

module.exports = userService; 