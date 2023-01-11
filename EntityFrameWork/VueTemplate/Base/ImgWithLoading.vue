<template>
  <v-card color="#f6f6f6" elevation="0" width="fit-content">
    <v-img
        :src="imgSrc"
        :height="height"
        :width="width"
        contain
    >
      <template v-slot:placeholder>
        <v-card :height="height" :width="width"
                tile
                class="d-flex align-center justify-center"
        >
          <v-icon>mdi-image</v-icon>
        </v-card>
      </template>
    </v-img>
  </v-card>

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
