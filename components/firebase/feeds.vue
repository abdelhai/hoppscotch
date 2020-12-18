<template>
  <div
    v-if="db.currentFeeds.length !== 0"
    class="divide-y virtual-list divide-dashed divide-brdColor"
  >
    <ul v-for="feed in db.currentFeeds" :key="feed.id" class="flex-col">
      <div data-test="list-item" class="show-on-large-screen">
        <li class="info">
          <label data-test="list-label">
            {{ feed.label || $t("no_label") }}
          </label>
        </li>
        <button class="icon" @click="deleteFeed(feed)">
          <i class="material-icons">delete</i>
        </button>
      </div>
      <div class="show-on-large-screen">
        <li data-test="list-message" class="info clamb-3">
          <label>{{ feed.message || $t("empty") }}</label>
        </li>
      </div>
    </ul>
  </div>
  <ul v-else class="flex-col">
    <li>
      <p class="info">{{ $t("empty") }}</p>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.virtual-list {
  max-height: calc(100vh - 296px);
}

.clamb-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  @apply overflow-hidden;
}
</style>

<script>
import { db } from "~/helpers/db"

export default {
  data() {
    return {
      db,
    }
  },
  methods: {
    async deleteFeed({key}) {
      await db.deleteFeed(key)
      this.$toast.success(this.$t("deleted"), {
        icon: "delete",
      })
    },
  },
}
</script>
