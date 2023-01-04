<!--
  - Copyright (c) 2022. Haodong JU
  -->

<template>
  <div class="pa-1">
    <h3>{{ $t('chooseDateRange') }}</h3>
    <div class="mt-2">
      <div style="display: grid;grid-template-columns: repeat(2,1fr);grid-gap: 8px">
        <div>
          <v-dialog
              ref="dialog"
              v-model="startDateDialog"
              width="290px"
          >
            <template #activator="{ on, attrs }">
              <div class="text-overline">
                {{ $t('from') }}
              </div>
              <v-text-field
                  v-model="startDate"
                  :placeholder="$t('from')"
                  hide-details
                  outlined
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
              />
            </template>
            <v-date-picker
                v-model="startDate"
                :max="endDate"
                @input="startDateDialog=false"
            />
          </v-dialog>
        </div>
        <div>
          <v-dialog
              ref="dialog"
              v-model="endDateDialog"
              width="290px"
          >
            <template #activator="{ on, attrs }">
              <div class="text-overline">
                {{ $t('to') }}
              </div>
              <v-text-field
                  v-model="endDate"
                  :placeholder="$t('to')"
                  hide-details
                  outlined
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
              />
            </template>
            <v-date-picker
                v-model="endDate"
                :max="today"
                :min="startDate"
                @input="endDateDialog=false"
            />
          </v-dialog>
        </div>
      </div>
    </div>

    <div
        class="mt-4"
        style="display: grid;grid-template-columns: repeat(3,1fr);grid-gap: 8px"
    >
      <small-base-card
          v-for="d in predefinedTimeList"
          :key="d.label"
          :active="currentDateMatch(d.dateRange())"
          :style="currentDateMatch(d.dateRange())?{color:'white'}:{}"
          @click="dateRange=d.dateRange()"
      >
        <div
            class="d-flex justify-center align-center text-body-1"
            style="height: 100%"
        >
          {{ $t(d.label) }}
        </div>
      </small-base-card>
    </div>
  </div>
</template>

<script>



import SmallBaseCard from './SmallBaseCard'
import { predefinedDateRangeList, today } from '../../DateRepository'

export default {
  name: 'DateRangePicker',
  components: {SmallBaseCard},
  props: {
    value: {}
  },
  data: function () {
    return {
      today,
      startDate: null,
      endDate: null,
      startDateDialog: null,
      endDateDialog: null,
      predefinedTimeList: predefinedDateRangeList
    }
  },
  computed: {
    dateRange: {
      get () {
        return [this.startDate ?? this.endDate ?? today, this.endDate ?? this.startDate ?? today]
      },
      set (val) {
        if (val?.length === 2) {
          [this.startDate, this.endDate] = val
        }
      }
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (val) {
        this.dateRange = val
      }
    },
    dateRange (val) {
      this.$emit('input', val)
    }
  },
  methods: {
    currentDateMatch (dateRange) {
      return [this.startDate, this.endDate].join() === dateRange.join()
    }
  }
}
</script>

<style scoped>

</style>
