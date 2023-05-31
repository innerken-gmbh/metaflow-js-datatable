<!--
  - Copyright (c) 2023. Haodong JU
  -->

<template>
  <v-dialog v-model="loginDialog" fullscreen>
    <div
        class="d-flex"
        style="height: 100vh"
    >
      <div
          class="hidden-sm-and-down"
          style="width: 50%;height:100%;background-color: #f9f9f1"
      >
        <div
            class="d-flex flex-column align-center justify-center pa-8"
            style="height: 100%"
        >
          <primary-logo-display/>
        </div>
      </div>
      <div
          :style="{width:$vuetify.breakpoint.smAndDown?'100%':'50%'}"
          class="grey lighten-4"
      >
        <LoginPage
            v-if="realPage === ''"
        />
        <error-page
            v-if="realPage === 'error'"
        />
        <store-page
            v-if="realPage === 'store'"
        />
      </div>
    </div>
  </v-dialog>
</template>

<script>

import PrimaryLogoDisplay from './PrimaryLogoDisplay'
import {initialLogin} from "../../firebase/google-fire-base";
import LoginPage from "./Login";
import ErrorPage from "./ErrorPage";
import StorePage from "./StorePage";

const LoginPages = {
  store: "store",
  error: "error",
  start: ""
}
export default {
  name: 'IndexPage',
  components: {
    StorePage,
    ErrorPage,
    LoginPage,
    PrimaryLogoDisplay
  },
  props: {
    loginDialog: {
      default: false,
    },
    code: {}
  },
  data: function () {
    return {
      realPage: LoginPages.start,
      LoginPages,
    }
  },
  async mounted() {
    this.$emit('showLoginPage')
    initialLogin(() => {
      this.realPage = LoginPages.store
    }, () => {
      this.realPage = LoginPages.error
    }, () => {
      this.loginDialog = false
    },this.code)
  },
  methods: {}
}
</script>

<style scoped>

</style>
