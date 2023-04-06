<template>
  <v-navigation-drawer
      v-model="realValue"
      fixed
      :width="$vuetify.breakpoint.smAndDown ? '100%' : width"
      color="#fafbfc"
      right
      touchless
      temporary
      style="z-index: 10 !important;"
      :style="$vuetify.breakpoint.smAndDown ? 'left: 0;' : ''"
  >
    <no-chain-scroll-container>
      <slot/>
    </no-chain-scroll-container>
  </v-navigation-drawer>
</template>

<script>


import NoChainScrollContainer from './NoChainScrollContainer'

export default {
  name: 'NiceDialog',
  components: { NoChainScrollContainer },
  props: {
    value: {
      default: null,
      type: Boolean,
    },
    width: {
      default: 'min(700px,calc(100vw - 300px))',
      type: String,
    },
  },
  data: function () {
    return {
      realValue: {},
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (val) {
        this.realValue = val
      },
    },
    realValue (val, old) {
      if (val !== old) {
        this.$emit('input', val)
      }
    },
  },
}
</script>

<style scoped>

</style>
