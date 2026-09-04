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
                <img :src="userProfilePicture || 'https://s.gravatar.com/avatar/ce7f3697e231df38b3ca6065848520da?s=80'">
              </q-avatar>
            </template>
          </q-input>
        </div>
        <div class="col col-shrink">
          <q-btn
            @click="attemptAddNewQweet"
            :disable="!newQweetContent"
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
                  @click="toggleDisliked(qweet)"
                  :color="qweet.disliked ? 'yellow' : 'grey'"
                  icon="fas fa-thumbs-down"
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

    <!-- Dialog for dislike reason -->
    <q-dialog v-model="showDislikeReasonDialog" @hide="resetDislikeDialog">
      <q-card style="min-width: 300px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Why are you disliking this?</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="dislikeReason"
            label="Enter your reason"
            outlined
            autofocus
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Dislike"
            color="yellow"
            @click="submitDislike"
            :disable="!dislikeReason.trim()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog for missing profile picture -->
    <q-dialog v-model="showMissingProfilePictureDialog" @hide="closeMissingProfileDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Complete Your Profile</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-body1 q-mb-md">
            Before you can post Qweets, you need to add a profile picture to your account.
          </div>
          <div class="text-body2 text-grey-7">
            A profile picture helps other users identify you and builds trust in our community.
          </div>
        </q-card-section>

        <q-card-section class="flex flex-center q-py-md bg-grey-2">
          <ProfilePictureUpload
            :userId="currentUserId"
            :profilePicture="userProfilePicture"
            @picture-updated="onProfilePictureUpdated"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import db from 'src/boot/firebase'
import { formatDistance } from 'date-fns'
import userService from 'src/services/userService'
import ProfilePictureUpload from 'src/components/ProfilePictureUpload.vue'

export default {
  name: 'PageHome',
  components: {
    ProfilePictureUpload
  },
  data() {
    return {
      newQweetContent: '',
      qweets: [],
      showDislikeReasonDialog: false,
      dislikeReason: '',
      currentQweetBeingDisliked: null,
      showMissingProfilePictureDialog: false,
      currentUserId: userService.getCurrentUserId(),
      userProfilePicture: null
    }
  },
  methods: {
    /**
     * Attempt to add a new qweet - checks for profile picture first
     */
    async attemptAddNewQweet() {
      try {
        const hasProfilePicture = await userService.hasProfilePicture(this.currentUserId)
        if (!hasProfilePicture) {
          this.showMissingProfilePictureDialog = true
          return
        }
        this.addNewQweet()
      } catch (error) {
        console.error('Error checking profile picture:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Error validating profile',
          position: 'top'
        })
      }
    },
    addNewQweet() {
      let newQweet = {
        content: this.newQweetContent,
        date: Date.now(),
        liked: false,
        disliked: false,
        dislikeReason: ''
      }
      db.collection('qweets').add(newQweet).then(function(docRef) {
        console.log('Document written with ID: ', docRef.id)
      }).catch(function(error) {
        console.error('Error adding document: ', error)
      })
      this.newQweetContent = ''
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
    },
    toggleDisliked(qweet) {
      if (qweet.disliked) {
        // If already disliked, just toggle it off
        db.collection('qweets').doc(qweet.id).update({
          disliked: false,
          dislikeReason: ''
        })
        .then(function() {
          console.log('Dislike removed!')
        })
        .catch(function(error) {
          console.error('Error updating document: ', error)
        })
      } else {
        // If not disliked, show dialog to get reason
        this.currentQweetBeingDisliked = qweet
        this.dislikeReason = ''
        this.showDislikeReasonDialog = true
      }
    },
    submitDislike() {
      if (this.currentQweetBeingDisliked && this.dislikeReason.trim()) {
        db.collection('qweets').doc(this.currentQweetBeingDisliked.id).update({
          disliked: true,
          dislikeReason: this.dislikeReason
        })
        .then(function() {
          console.log('Dislike added with reason!')
        })
        .catch(function(error) {
          console.error('Error updating document: ', error)
        })
        this.showDislikeReasonDialog = false
        this.resetDislikeDialog()
      }
    },
    resetDislikeDialog() {
      this.dislikeReason = ''
      this.currentQweetBeingDisliked = null
    },
    closeMissingProfileDialog() {
      this.showMissingProfilePictureDialog = false
    },
    async onProfilePictureUpdated(imageData) {
      this.userProfilePicture = imageData
      this.showMissingProfilePictureDialog = false
    },
    async loadUserProfile() {
      try {
        const profile = await userService.getUserProfile(this.currentUserId)
        if (profile && profile.profilePicture) {
          this.userProfilePicture = profile.profilePicture
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
      }
    }
  },
  filters: {
    relativeDate(value) {
      return formatDistance(value, new Date())
    }
  },
  async mounted() {
    // Initialize user profile and load profile picture
    try {
      await userService.initializeUserProfile(this.currentUserId)
      await this.loadUserProfile()
    } catch (error) {
      console.error('Error initializing user profile:', error)
    }

    // Load qweets
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
</style>
