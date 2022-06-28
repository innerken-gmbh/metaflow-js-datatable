<template>
  <div
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
