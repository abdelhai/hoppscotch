<template>
  <pw-section class="pink" :label="$t('notes')" ref="sync" no-legend>
    <div>
      <inputform />
      <feeds />
    </div>

  </pw-section>
</template>

<script>
import { db } from "~/helpers/db"

export default {
  data() {
    return {
      db,
    }
  },
}
</script>
