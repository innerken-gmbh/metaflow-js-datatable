<template>
  <div class="d-flex align-center py-4 pb-6">
    <slot name="navigation"/>
    <span class="text-h2 font-weight-bold"><slot/></span>
  </div>
</template>

<script>
  export default {
    name: 'PageHeader',
  }
</script>

<style scoped>

</style>
