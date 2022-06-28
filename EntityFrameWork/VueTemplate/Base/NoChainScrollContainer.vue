<template>
  <div
    :style="{height: height}"
    style="overflow: scroll;overscroll-behavior: contain"
  >
    <slot/>
  </div>
</template>

<script>
  export default {
    name: 'NoChainScrollContainer',
    props: {
      height: {
        default: '100vh',
        type: String,
      },
    },
  }
</script>

<style scoped>

</style>
