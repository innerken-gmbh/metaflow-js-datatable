<template>
  <div
    class="pa-1 px-3 green lighten-3 rounded-pill text-no-wrap"
    style="width: fit-content"
  >
    {{ price | priceDisplay }}
  </div>
</template>

<script>
  export default {
    name: 'PriceTableDisplay',
    props: {
      price: {},
    },
  }
</script>

<style scoped>

</style>
