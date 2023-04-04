<template>
  <div class="d-flex align-center">
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
