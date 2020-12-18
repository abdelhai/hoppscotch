const conf = {
  url: process.env.MICRO_URL || "https://6r4u7v.deta.dev/api",
}

export class Database {
  constructor() {
    this.usersCollection = []
    this.currentUser = null
    this.currentFeeds = []
    this.currentSettings = []
    this.currentHistory = []
    this.currentCollections = []
    this.currentEnvironments = []
    
    // DETA dev
    this.url = p => `${conf.url}${p}`

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
    console.log("writeSettings", setting, value)
    const st = {
      updatedOn: new Date(),
      author: this.currentUser.uid,
      author_name: this.currentUser.displayName,
      author_image: this.currentUser.photoURL,
      name: setting,
      value,
    }
    // TODO: write seetings
  }

  async writeHistory(entry) {
    console.log("writeHistory", entry)
    fetch(this.url("/history"), {
      method: "post",
      body: JSON.stringify(entry)
    })
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
    console.log("toggleStar", entry, value)
    entry.star = value
    fetch(this.url("/history"), {
      method: "post",
      body: JSON.stringify(entry)
    })
  }

  async writeCollections(collection) {
    const cl = {
      updated_on: new Date(),
      author: this.currentUser.uid,
      author_name: this.currentUser.displayName,
      author_image: this.currentUser.photoURL,
      collection,
    }
    console.log("sync collections", cl)
    fetch(this.url("/collections"), {
      method: "post",
      body: JSON.stringify(cl)
    })
  }

  async writeEnvironments(environment) {
    const ev = {
      updated_on: new Date(),
      author: this.currentUser.uid,
      author_name: this.currentUser.displayName,
      author_image: this.currentUser.photoURL,
      environment,
    }
    console.log("writeEnvironments", ev)
    fetch(this.url("/envs"), {
      method: "post",
      body: JSON.stringify(ev)
    })
  }

}

export const db = new Database()
