class Cache {
  static _Cache = {}

  static set (key, value) {
    this._Cache[key] = value
  }

  static get (key) {
    return this._Cache[key]
  }
}

export default {
  cache: Cache
}