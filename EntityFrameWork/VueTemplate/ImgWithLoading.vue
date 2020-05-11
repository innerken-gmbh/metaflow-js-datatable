<template>
  <v-img
    :src="imgSrc"
    class="grey lighten-2"
    :height="height"
    :width="width"
    cover
  >
    <template v-slot:placeholder>
      <v-row
        class="fill-height ma-0"
        align="center"
        justify="center"
      >
        <v-progress-circular
          indeterminate
          color="grey lighten-5"
        />
      </v-row>
    </template>
  </v-img>
</template>

<script>
  export default {
    name: 'ImgWithLoading',
    props: {
      imgSrc: {
        type: String,
        default: '',
      },
      height: {
        type: String,
        default: 'auto',
      },
      width: {
        type: String,
        default: 'auto',
      },
    },
  }
</script>

<style scoped>

</style>
