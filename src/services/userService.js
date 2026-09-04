import db from 'src/boot/firebase'

const userService = {
  /**
   * Get the current user's profile
   * In a real app, this would use Firebase Auth to get the current user
   * For now, we'll use a hardcoded user ID
   */
  getCurrentUserId() {
    // TODO: Replace with actual Firebase Auth when implemented
    return 'current-user-id'
  },

  /**
   * Get user profile data
   */
  async getUserProfile(userId) {
    try {
      const doc = await db.collection('users').doc(userId).get()
      if (doc.exists) {
        return { id: doc.id, ...doc.data() }
      }
      return null
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  },

  /**
   * Check if user has a profile picture
   */
  async hasProfilePicture(userId) {
    try {
      const profile = await this.getUserProfile(userId)
      return profile && profile.profilePicture ? true : false
    } catch (error) {
      console.error('Error checking profile picture:', error)
      return false
    }
  },

  /**
   * Update user profile picture
   */
  async updateProfilePicture(userId, imageData) {
    try {
      await db.collection('users').doc(userId).set(
        {
          profilePicture: imageData,
          updatedAt: new Date()
        },
        { merge: true }
      )
      return true
    } catch (error) {
      console.error('Error updating profile picture:', error)
      throw error
    }
  },

  /**
   * Initialize user profile if it doesn't exist
   */
  async initializeUserProfile(userId) {
    try {
      const profile = await this.getUserProfile(userId)
      if (!profile) {
        await db.collection('users').doc(userId).set({
          createdAt: new Date(),
          profilePicture: null
        })
      }
    } catch (error) {
      console.error('Error initializing user profile:', error)
      throw error
    }
  }
}

export default userService
