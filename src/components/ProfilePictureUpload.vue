<template>
  <div class="profile-picture-upload">
    <div class="profile-picture-container">
      <q-avatar
        size="xl"
        :src="profilePicture || defaultAvatar"
        class="profile-avatar"
      />
      <q-btn
        icon="fas fa-camera"
        round
        size="sm"
        color="primary"
        @click="triggerFileInput"
        class="upload-btn"
      />
    </div>
    <input
      type="file"
      ref="fileInput"
      @change="onFileSelected"
      accept="image/*"
      style="display: none"
    />
  </div>
</template>

<script>
import userService from 'src/services/userService'

export default {
  name: 'ProfilePictureUpload',
  props: {
    profilePicture: {
      type: String,
      default: null
    },
    userId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      defaultAvatar: 'https://s.gravatar.com/avatar/ce7f3697e231df38b3ca6065848520da?s=80'
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    onFileSelected(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const imageData = e.target.result
          try {
            await userService.updateProfilePicture(this.userId, imageData)
            this.$emit('picture-updated', imageData)
            this.$q.notify({
              type: 'positive',
              message: 'Profile picture updated successfully!',
              position: 'top'
            })
          } catch (error) {
            this.$q.notify({
              type: 'negative',
              message: 'Failed to update profile picture',
              position: 'top'
            })
          }
        }
        reader.readAsDataURL(file)
      }
      // Reset input
      this.$refs.fileInput.value = ''
    }
  }
}
</script>

<style lang="sass" scoped>
.profile-picture-upload
  display: flex
  align-items: center
  justify-content: center

.profile-picture-container
  position: relative
  display: inline-block

.profile-avatar
  cursor: pointer

.upload-btn
  position: absolute
  bottom: 0
  right: 0
  background: white
  border: 2px solid white
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15)
</style>
