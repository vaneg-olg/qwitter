<template>
  <div class="file-upload-widget">
    <!-- File Input Hidden -->
    <input
      ref="fileInput"
      type="file"
      style="display: none"
      @change="onFileSelected"
      :accept="accept"
    />

    <!-- Upload Button -->
    <q-btn
      @click="$refs.fileInput.click()"
      :color="color"
      :icon="icon"
      :label="label"
      :size="size"
      :flat="flat"
      :round="round"
      :disable="disabled"
      class="file-upload-btn"
    />

    <!-- File Preview -->
    <div v-if="selectedFile" class="file-preview q-mt-md">
      <q-chip
        removable
        @remove="clearFile"
        :color="chipColor"
        text-color="white"
        icon="attach_file"
      >
        {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
      </q-chip>

      <!-- Image Preview -->
      <div v-if="isImageFile(selectedFile)" class="q-mt-sm">
        <img :src="previewURL" class="file-preview-image" />
      </div>
    </div>
  </div>
</template>

<script>
import { validateFile, formatFileSize } from 'src/services/fileUploadService'

export default {
  name: 'FileUploadWidget',
  props: {
    accept: {
      type: String,
      default: 'image/*,.pdf,.txt'
    },
    color: {
      type: String,
      default: 'grey'
    },
    icon: {
      type: String,
      default: 'attach_file'
    },
    label: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'md'
    },
    flat: {
      type: Boolean,
      default: true
    },
    round: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    chipColor: {
      type: String,
      default: 'primary'
    },
    maxSize: {
      type: Number,
      default: 10 * 1024 * 1024 // 10MB
    },
    allowedTypes: {
      type: Array,
      default: () => ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
    }
  },
  data() {
    return {
      selectedFile: null,
      previewURL: null
    }
  },
  methods: {
    formatFileSize(bytes) {
      return formatFileSize(bytes)
    },
    isImageFile(file) {
      return file && file.type.startsWith('image/')
    },
    onFileSelected(event) {
      const file = event.target.files[0]
      if (!file) return

      // Validate the file
      const validation = validateFile(file, {
        maxSize: this.maxSize,
        allowedTypes: this.allowedTypes
      })

      if (!validation.isValid) {
        this.$emit('error', validation.error)
        this.$refs.fileInput.value = ''
        return
      }

      // Store the file
      this.selectedFile = file

      // Create preview for images
      if (this.isImageFile(file)) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.previewURL = e.target.result
        }
        reader.readAsDataURL(file)
      }

      // Emit the selected file to parent
      this.$emit('file-selected', file)

      // Reset the input
      this.$refs.fileInput.value = ''
    },
    clearFile() {
      this.selectedFile = null
      this.previewURL = null
      this.$refs.fileInput.value = ''
      this.$emit('file-cleared')
    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    getFile() {
      return this.selectedFile
    },
    setFile(file) {
      if (file) {
        this.selectedFile = file
        if (this.isImageFile(file)) {
          const reader = new FileReader()
          reader.onload = (e) => {
            this.previewURL = e.target.result
          }
          reader.readAsDataURL(file)
        }
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.file-upload-widget
  display: flex
  flex-direction: column

.file-preview
  padding: 12px
  border: 1px solid #e0e0e0
  border-radius: 4px
  background-color: #fafafa

.file-preview-image
  max-width: 100%
  max-height: 300px
  border-radius: 4px
  margin-top: 8px
</style>
