<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
      <div class="q-py-lg q-px-md row items-end q-col-gutter-md">
        <div class="col">
          <q-input
            v-model="newQweetContent"
            class="new-qweet"
            placeholder="What's happening?"
            maxlength="280"
            bottom-slots
            counter
            autogrow
          >
            <template v-slot:before>
              <q-avatar size="xl">
                <img src="https://s.gravatar.com/avatar/ce7f3697e231df38b3ca6065848520da?s=80">
              </q-avatar>
            </template>
            <template v-slot:after>
              <q-icon
                name="attach_file"
                @click="$refs.fileInput.click()"
                class="cursor-pointer"
              />
              <input
                ref="fileInput"
                type="file"
                style="display: none"
                @change="onFileSelected"
                accept="image/*,.pdf,.txt"
              />
            </template>
          </q-input>
          <div v-if="uploadedFile" class="q-mt-md file-preview">
            <q-chip
              removable
              @remove="uploadedFile = null"
              color="primary"
              text-color="white"
              icon="attach_file"
            >
              {{ uploadedFile.name }} ({{ formatFileSize(uploadedFile.size) }})
            </q-chip>
            <div v-if="isImageFile(uploadedFile)" class="q-mt-sm">
              <img :src="filePreviewURL" class="file-preview-image" />
            </div>
          </div>
        </div>
        <div class="col col-shrink">
          <q-btn
            @click="addNewQweet"
            :disable="!newQweetContent && !uploadedFile"
            :loading="isUploading"
            class="q-mb-lg"
            color="primary"
            label="Qweet"
            rounded
            unelevated
            no-caps
          />
        </div>
      </div>

      <q-separator
        class="divider"
        color="grey-2"
        size="10px"
      />

      <q-list separator>
        <transition-group
          appear
          enter-active-class="animated fadeIn slow"
          leave-active-class="animated fadeOut slow"
        >
          <q-item
            v-for="qweet in qweets"
            :key="qweet.id"
            class="qweet q-py-md"
          >
            <q-item-section avatar top>
              <q-avatar size="xl">
                <img src="https://s.gravatar.com/avatar/ce7f3697e231df38b3ca6065848520da?s=80">
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
                <strong>Danny Connell</strong>
                <span class="text-grey-7">
                  @danny__connell 
                  <br class="lt-md">&bull; {{ qweet.date | relativeDate }}
                </span>
              </q-item-label>
              <q-item-label class="qweet-content text-body1">{{ qweet.content }}</q-item-label>
              <div v-if="qweet.file" class="qweet-file q-mt-md">
                <div v-if="isImageURL(qweet.file.url)" class="file-display-image">
                  <img :src="qweet.file.url" />
                </div>
                <div v-else class="file-display-other">
                  <q-icon name="description" size="lg" />
                  <a :href="qweet.file.url" target="_blank" class="q-ml-sm">
                    {{ qweet.file.filename }}
                  </a>
                </div>
              </div>
              <div class="qweet-icons row justify-between q-mt-sm">
                <q-btn
                  color="grey"
                  icon="far fa-comment"
                  size="sm"
                  flat
                  round
                />
                <q-btn
                  color="grey"
                  icon="fas fa-retweet"
                  size="sm"
                  flat
                  round
                />
                <q-btn
                  @click="toggleLiked(qweet)"
                  :color="qweet.liked ? 'pink' : 'grey'"
                  :icon="qweet.liked ? 'fas fa-heart' : 'far fa-heart'"
                  size="sm"
                  flat
                  round
                />
                <q-btn
                  @click="deleteQweet(qweet)"
                  color="grey"
                  icon="fas fa-trash"
                  size="sm"
                  flat
                  round
                />
              </div>
            </q-item-section>
          </q-item>
        </transition-group>
      </q-list>
    </q-scroll-area>
  </q-page>
</template>

<script>
import db from 'src/boot/firebase'
import { formatDistance } from 'date-fns'
import { uploadFile, validateFile, formatFileSize } from 'src/services/fileUploadService'

export default {
  name: 'PageHome',
  data() {
    return {
      newQweetContent: '',
      uploadedFile: null,
      filePreviewURL: null,
      isUploading: false,
      qweets: [
        // {
        //   id: 'ID1',
        //   content: 'Be your own hero, its cheaper than a movie ticket.',
        //   date: 1611653238221,
        //   liked: false
        // },
        // {
        //   id: 'ID2',
        //   content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed feugiat justo id viverra consequat. Integer feugiat lorem faucibus est ornare scelerisque. Donec tempus, nunc vitae semper sagittis, odio magna semper ipsum, et laoreet sapien mauris vitae arcu.',
        //   date: 1611653252444,
        //   liked: true
        // },
      ]
    }
  },
  methods: {
    formatFileSize(bytes) {
      return formatFileSize(bytes)
    },
    isImageFile(file) {
      return file && file.type.startsWith('image/')
    },
    isImageURL(url) {
      return url && (url.includes('image') || /\.(jpg|jpeg|png|gif)$/i.test(url))
    },
    onFileSelected(event) {
      const file = event.target.files[0]
      if (!file) return

      // Validate the file
      const validation = validateFile(file)
      if (!validation.isValid) {
        this.$q.notify({
          type: 'negative',
          message: validation.error,
          position: 'top'
        })
        return
      }

      // Store the file
      this.uploadedFile = file

      // Create preview for images
      if (this.isImageFile(file)) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.filePreviewURL = e.target.result
        }
        reader.readAsDataURL(file)
      }

      // Reset the input
      this.$refs.fileInput.value = ''
    },
    async addNewQweet() {
      // Check if there's content or a file
      if (!this.newQweetContent && !this.uploadedFile) {
        this.$q.notify({
          type: 'warning',
          message: 'Please enter some text or select a file',
          position: 'top'
        })
        return
      }

      this.isUploading = true

      try {
        let newQweet = {
          content: this.newQweetContent,
          date: Date.now(),
          liked: false
        }

        // Upload file if selected
        if (this.uploadedFile) {
          const uploadedFileData = await uploadFile(this.uploadedFile)
          newQweet.file = {
            url: uploadedFileData.url,
            path: uploadedFileData.path,
            filename: uploadedFileData.filename,
            size: uploadedFileData.size,
            type: uploadedFileData.type
          }
        }

        // Save to Firestore
        await db.collection('qweets').add(newQweet)
        console.log('Qweet created successfully')

        // Reset form
        this.newQweetContent = ''
        this.uploadedFile = null
        this.filePreviewURL = null

        this.$q.notify({
          type: 'positive',
          message: 'Qweet posted successfully!',
          position: 'top'
        })
      } catch (error) {
        console.error('Error creating qweet:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Error posting qweet. Please try again.',
          position: 'top'
        })
      } finally {
        this.isUploading = false
      }
    },
    deleteQweet(qweet) {
      db.collection('qweets').doc(qweet.id).delete().then(function() {
        console.log('Document successfully deleted!');
      }).catch(function(error) {
        console.error('Error removing document: ', error);
      })
    },
    toggleLiked(qweet) {
      db.collection('qweets').doc(qweet.id).update({
        liked: !qweet.liked
      })
      .then(function() {
        console.log('Document successfully updated!')
      })
      .catch(function(error) {
        // The document probably doesn't exist.
        console.error('Error updating document: ', error)
      })
    }
  },
  filters: {
    relativeDate(value) {
      return formatDistance(value, new Date())
    }
  },
  mounted() {
    db.collection('qweets').orderBy('date').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        let qweetChange = change.doc.data()
        qweetChange.id = change.doc.id
        if (change.type === 'added') {
          console.log('New qweet: ', qweetChange)
          this.qweets.unshift(qweetChange)
        }
        if (change.type === 'modified') {
          console.log('Modified qweet: ', qweetChange)
          let index = this.qweets.findIndex(qweet => qweet.id === qweetChange.id)
          Object.assign(this.qweets[index], qweetChange)
        }
        if (change.type === 'removed') {
          console.log('Removed qweet: ', qweetChange)
          let index = this.qweets.findIndex(qweet => qweet.id === qweetChange.id)
          this.qweets.splice(index, 1)
        }
      })
    })
  }
}
</script>

<style lang="sass">
.new-qweet
  textarea
    font-size: 19px
    line-height: 1.4 !important
.divider
  border-top: 1px solid
  border-bottom: 1px solid
  border-color: $grey-4
.qweet:not(:first-child)
  border-top: 1px solid rgba(0, 0, 0, 0.12)
.qweet-content
  white-space: pre-line
.qweet-icons
  margin-left: -5px
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
.qweet-file
  padding: 12px
  border: 1px solid #e0e0e0
  border-radius: 4px
  background-color: #f5f5f5
.file-display-image
  img
    max-width: 100%
    max-height: 400px
    border-radius: 4px
.file-display-other
  display: flex
  align-items: center
  color: #666
  a
    color: #1976d2
    text-decoration: none
    &:hover
      text-decoration: underline
</style>
