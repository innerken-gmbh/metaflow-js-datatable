<!--
  - Copyright (c) 2022. Haodong JU
  -->

<template>
  <v-navigation-drawer
      v-model="realValue"
      :width="$vuetify.breakpoint.smAndDown ? '100%' : width"
      style="z-index: 10 !important;"
      :style="$vuetify.breakpoint.smAndDown ? 'left: 0;' : ''"
      color="#fafbfc"
      fixed
      right
      temporary
      touchless
  >
    <no-chain-scroll-container>
      <slot/>
    </no-chain-scroll-container>
  </v-navigation-drawer>
</template>

<script>
import NoChainScrollContainer from '@/composable/NoChainScrollContainer'

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
      realValue: null,
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
