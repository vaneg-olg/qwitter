import firebase from "firebase/app"
import "firebase/firestore"
import "firebase/storage"

const firebaseConfig = {
  // YOUR CONFIG HERE
}

firebase.initializeApp(firebaseConfig)

let db = firebase.firestore()
let storage = firebase.storage()

export { db, storage }
export default db
