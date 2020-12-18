import firebase from "firebase/app"
import "firebase/firestore"
import "firebase/auth"

// Initialize Firebase, copied from cloud console
const firebaseConfig = {
  apiKey: process.env.API_KEY || "AIzaSyCMsFreESs58-hRxTtiqQrIcimh4i1wbsM",
  authDomain: process.env.AUTH_DOMAIN || "postwoman-api.firebaseapp.com",
  databaseURL: process.env.DATABASE_URL || "https://postwoman-api.firebaseio.com",
  projectId: process.env.PROJECT_ID || "postwoman-api",
  storageBucket: process.env.STORAGE_BUCKET || "postwoman-api.appspot.com",
  messagingSenderId: process.env.MESSAGING_SENDER_ID || "421993993223",
  appId: process.env.APP_ID || "1:421993993223:web:ec0baa8ee8c02ffa1fc6a2",
  measurementId: process.env.MEASUREMENT_ID || "G-ERJ6025CEB",
}

export const authProviders = {
  google: () => new firebase.auth.GoogleAuthProvider(),
  github: () => new firebase.auth.GithubAuthProvider(),
}

export class FirebaseInstance {
  constructor(fbapp, authProviders) {
    this.app = fbapp
    this.authProviders = authProviders

    this.usersCollection = this.app.firestore().collection("users")

    this.currentUser = null
    this.currentFeeds = []
    this.currentSettings = []
    this.currentHistory = []
    this.currentCollections = []
    this.currentEnvironments = []
    
    // DETA dev
    this.url = p => `https://6r4u7v.deta.dev/api${p}`
    if (true) {
      this.currentUser = {uid: 1, displayName: "mustafa", email: "mustafa@deta.sh",  photoURL: "https://avatars2.githubusercontent.com/u/1752577"}
      this.currentSettings = [{value: true}, {value: true}, {value: true}] // TODO: what's inside

      // get the notes
      fetch(this.url("/notes")).then(r => r.json()).then(d => {
        this.currentFeeds = d
      }).catch(e => console.error(e))

      // get the envs
      fetch(this.url("/envs")).then(r => r.json()).then(d => {
        this.currentEnvironments = d.environment
      }).catch(e => console.error(e))

      // get the collections
      fetch(this.url("/collections")).then(r => r.json()).then(d => {
        this.currentCollections = d.collection
      }).catch(e => console.error(e))

    // get the history
    fetch(this.url("/history")).then(r => r.json()).then(d => {
      this.currentHistory = d
    }).catch(e => console.error(e))

    } else {
    this.app.auth().onAuthStateChanged((user) => {
      if (user) {
        this.currentUser = user

        this.currentUser.providerData.forEach((profile) => {
          let us = {
            updatedOn: new Date(),
            provider: profile.providerId,
            name: profile.displayName,
            email: profile.email,
            photoUrl: profile.photoURL,
            uid: profile.uid,
          }
          this.usersCollection
            .doc(this.currentUser.uid)
            .set(us, { merge: true })
            .catch((e) => console.error("error updating", us, e))
        })

        this.usersCollection.doc(this.currentUser.uid).onSnapshot((doc) => {
          this.currentUser.provider = doc.data().provider
          this.currentUser.accessToken = doc.data().accessToken
        })

        this.usersCollection
          .doc(this.currentUser.uid)
          .collection("feeds")
          .orderBy("createdOn", "desc")
          .onSnapshot((feedsRef) => {
            const feeds = []
            feedsRef.forEach((doc) => {
              const feed = doc.data()
              feed.id = doc.id
              feeds.push(feed)
            })
            this.currentFeeds = feeds
          })

        this.usersCollection
          .doc(this.currentUser.uid)
          .collection("settings")
          .onSnapshot((settingsRef) => {
            const settings = []
            settingsRef.forEach((doc) => {
              const setting = doc.data()
              setting.id = doc.id
              settings.push(setting)
            })
            this.currentSettings = settings
          })

        this.usersCollection
          .doc(this.currentUser.uid)
          .collection("history")
          .onSnapshot((historyRef) => {
            const history = []
            historyRef.forEach((doc) => {
              const entry = doc.data()
              entry.id = doc.id
              history.push(entry)
            })
            this.currentHistory = history
          })

      } 
    })
    }
  }

  async signInUserWithGoogle() {
    return await this.app.auth().signInWithPopup(this.authProviders.google())
  }

  async signInUserWithGithub() {
    return await this.app.auth().signInWithPopup(this.authProviders.github().addScope("gist"))
  }

  async signInWithEmailAndPassword(email, password) {
    return await this.app.auth().signInWithEmailAndPassword(email, password)
  }

  async getSignInMethodsForEmail(email) {
    return await this.app.auth().fetchSignInMethodsForEmail(email)
  }

  async signOutUser() {
    if (!this.currentUser) throw new Error("No user has logged in")

    await this.app.auth().signOut()
    this.currentUser = null
  }

  async writeFeeds(message, label) {
    const dt = {
      created_on: new Date(),
      author: this.currentUser.uid,
      author_name: this.currentUser.displayName,
      author_image: this.currentUser.photoURL,
      message,
      label,
    }
      console.log("saving a note", this.currentUser.uid, dt)
      fetch(this.url("/notes"), {
        method: "post",
        body: JSON.stringify(dt)
      })
  }

  async deleteFeed(id) {
    console.log("deteleFeed", id)
    fetch(this.url(`/notes?key=${id}`), {
      method: "delete",
    })
  }

  async writeSettings(setting, value) {
    const st = {
      updatedOn: new Date(),
      author: this.currentUser.uid,
      author_name: this.currentUser.displayName,
      author_image: this.currentUser.photoURL,
      name: setting,
      value,
    }

    try {
      await this.usersCollection
        .doc(this.currentUser.uid)
        .collection("settings")
        .doc(setting)
        .set(st)
    } catch (e) {
      console.error("error updating", st, e)
      throw e
    }
  }

  async writeHistory(entry) {
    console.log("writeHistory", entry)
    try {
      // await this.usersCollection.doc(this.currentUser.uid).collection("history").add(hs)
      
      fetch(this.url("/history"), {
        method: "post",
        body: JSON.stringify(entry)
      })
    } catch (e) {
      console.error("error inserting", entry, e)
      throw e
    }
  }

  async deleteHistory(entry) {
    console.log("deleteHistory", entry)
    fetch(this.url(`/history?key=${entry.key}`), {
      method: "delete",
    })
  }

  async clearHistory() {
    fetch(this.url(`/history/all`), {
      method: "delete",
    })
    this.currentHistory = []
  }

  async toggleStar(entry, value) {
    entry.star = value
    console.log("toggleStar", entry, value)
    try {
      fetch(this.url("/history"), {
        method: "post",
        body: JSON.stringify(entry)
      })
      
    } catch (e) {
      console.error("error starring", entry, e)

      throw e
    }
  }

  async writeCollections(collection) {
    const cl = {
      updated_on: new Date(),
      author: this.currentUser.uid,
      author_name: this.currentUser.displayName,
      author_image: this.currentUser.photoURL,
      collection,
    }

    try {
      // await this.usersCollection
      //   .doc(this.currentUser.uid)
      //   .collection("collections")
      //   .doc("sync")
      //   .set(cl)
      console.log("sync collections", cl)
      fetch(this.url("/collections"), {
        method: "post",
        body: JSON.stringify(cl)
      })
    } catch (e) {
      console.error("error updating", cl, e)

      throw e
    }
  }

  async writeEnvironments(environment) {
    const ev = {
      updated_on: new Date(),
      author: this.currentUser.uid,
      author_name: this.currentUser.displayName,
      author_image: this.currentUser.photoURL,
      environment,
    }

    try {
      console.log("writeEnvironments", ev)
      fetch(this.url("/envs"), {
        method: "post",
        body: JSON.stringify(ev)
      })
    } catch (e) {
      console.error("error updating", ev, e)

      throw e
    }
  }

  async setProviderInfo(id, token) {
    const us = {
      updatedOn: new Date(),
      provider: id,
      accessToken: token,
    }
    try {
      await this.usersCollection
        .doc(this.currentUser.uid)
        .update(us)
        .catch((e) => console.error("error updating", us, e))
    } catch (e) {
      console.error("error updating", ev, e)

      throw e
    }
  }
}

export const fb = new FirebaseInstance(firebase.initializeApp(firebaseConfig), authProviders)
