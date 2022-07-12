<!--
  - Copyright (c) 2022. Haodong JU
  -->

<template>
  <v-card
    :color="active?'primary':'white'"
    class="pa-4"
    elevation="0"
    @click="$emit('click')"
  >
    <slot/>
  </v-card>
</template>

<script>
  export default {
    name: 'SmallBaseCard',
    props: {
      active: {},
      clickable: { default: true },

    },
  }
</script>

<style scoped>

</style>
