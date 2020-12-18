<template>
  <div>
    <button class="icon" @click="logout" v-close-popover>
      <i class="material-icons">exit_to_app</i>
      <span>{{ $t("logout") }}</span>
    </button>
  </div>
</template>

<script>
import { db } from "~/helpers/db"

export default {
  data() {
    return {
      db,
    }
  },
  methods: {
    async logout() {
      try {
        await db.signOutUser()

        this.$toast.info(this.$t("logged_out"), {
          icon: "vpn_key",
        })
      } catch (err) {
        this.$toast.show(err.message || err, {
          icon: "error",
        })
      }
    },
  },
}
</script>
