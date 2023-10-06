let instance = null

class registeredTags {
    constructor() {
        if (instance) {
            return instance
        }

        instance = this

        this.tags = []
    }

    setTags(tags) {
        if (this.tags.includes(tags)) return
        this.tags.push(tags)
    }
}

module.exports = registeredTags