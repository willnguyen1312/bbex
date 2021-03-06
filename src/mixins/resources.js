import { mapGetters, mapActions } from 'vuex'

export default {
  data () {
    return {
      options: {
        text: '',
        limit: 15,
        maxResults: 100000
      },
      resources: [],
      subscriptions: [],
      status: 'init'
    }
  },
  computed: {
    ...mapGetters([
      'resourceSearch'
    ])
  },
  created () {
  },
  destroyed () {
    for (const subscription of this.subscriptions) {
      this.$pubsub.unsubscribe(subscription)
    }
  },
  mounted: function () {
    this.options = this.resourceSearch
    this.subscriptions.push(this.$pubsub.subscribe('ResourceSearch', this.onResourceSearch))
    this.subscriptions.push(this.$pubsub.subscribe('ResourceAction', this.onResourceAction))
  },
  methods: {
    ...mapActions([
      'setResourceSearch'
    ]),
    more (index, done) {
      this.$nextTick(async () => {
        console.log(`more: ${index}`)
        console.log(this.options)
        const limit = this.options.limit
        const resources = await this.$resources.more((index - 1) * limit, limit, this.options)
        console.log('more', index, resources.length)
        if (resources.length === 0) {
          this.$refs.infiniteScroll.stop()
          if (index === 1) {
            this.status = 'failure'
          } else { this.status = 'success' }
          return done()
        }
        this.resources = this.resources.concat(resources)
        this.status = 'success'
        done()
      })
    },
    reload () {
      console.log('reload')
      this.status = 'loading'
      this.resources = []
      if (this.$refs.infiniteScroll) {
        this.$refs.infiniteScroll.reset()
        this.$refs.infiniteScroll.resume()
        this.$refs.infiniteScroll.trigger()
      }
    },
    onResourceSearch (msg, data) {
      this.options = data
      console.log('onResourceSearch')
      console.log(this.options)
      this.reload()
    },
    onResourceAction (msg, data) {
    }
  }
}
