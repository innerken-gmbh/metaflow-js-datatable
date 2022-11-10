<template>
  <v-btn
    class="mr-4 rounded"
    height="36px"
    width="36px"
    outlined
    tile
    icon
    @click="$emit('close')"
  >
    <v-icon size="24">
      mdi-arrow-left
    </v-icon>
  </v-btn>
</template>

<script>
  export default {
    name: 'BackButton',
  }
</script>

<style scoped>

</style>
