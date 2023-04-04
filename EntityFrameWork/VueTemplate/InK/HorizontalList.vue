<template>
  <div
      style="overflow-x: scroll;padding-bottom: 8px;display: grid;grid-auto-flow: column;grid-gap: 8px;grid-auto-columns: max-content"
  >
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'HorizontalList',
}
</script>

<style scoped>

</style>
