<template>
  <img-with-loading
      :height="'50px'"
      :width="'50px'"
      :img-src="root+item[model]"
  />
</template>

<script>
    import ImgWithLoading from './ImgWithLoading'

    export default {
        name: 'ImgTemplate',
        components: { ImgWithLoading },
        props: {
            root: {
                type: String,
                default: '/',
            },
            item: {
                type: Object,
                default: null,
            },
            model: {
                type: String,
                default: 'photo',
            },
        },
    }
</script>

<style scoped>

</style>
