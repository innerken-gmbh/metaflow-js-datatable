<template>
  <v-dialog
      v-model="dialog"
      scrollable
      max-width="300px"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-card
          color="transparent"
          v-on="on"
          v-bind="attrs"
          class="pa-2"
      >
        <span class="d-flex align-center justify-center">
          <flag-icon class="mr-2" :flag="currentLocale.flag"></flag-icon>
          <span>{{ currentLocale.label }}</span>
        </span>
      </v-card>
    </template>
    <v-card
        dark
        class="pa-2">
      <v-card-title>
        {{ $t('SelectLang') }}
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text style="height: 300px;">
        <v-list dense>
          <div v-for="item in allLocales"
               :key="item.code"
               @click="setLocale(item.code)"
               class="mt-8 "
          >
            <div class="d-flex align-center">
              <flag-icon class="mr-4" :flag="item.flag"></flag-icon>
              <div>
                <span class="text-body-2">{{ item.label }}</span>
              </div>
              <div v-if="currentLocale === item"
                   class="ma-auto mr-0">
                <v-icon>
                  mdi-check-circle-outline
                </v-icon>
              </div>
            </div>
          </div>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import FlagIcon from './FlagIcon'

export default {
  name: 'LangSwitch',
  components: {
    FlagIcon
  },
  props: {
    locales: {},
    currentLocaleCode: {}
  },
  data() {
    return {
      dialog: false
    }
  },
  computed: {
    currentLocale() {
      return this.locales.find(it => it.code === this.currentLocaleCode)
    },
    allLocales() {
      return this.locales.filter(el => el.code !== this.currentLocale)
    },
  },
  methods: {
    setLocale(locale) {
      this.$emit('language-change', locale)
      this.dialog = false
    }
  }
}
</script>

<style>
</style>