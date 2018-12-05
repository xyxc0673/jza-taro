class Cache {
  static _Cache = {}

  static Set (key, value) {
    this._Cache[key] = value
  }

  static Get (key) {
    return this._Cache[key]
  }

  static Clear () {
    this._Cache = {}
  }
}

export default {
  cache: Cache
}