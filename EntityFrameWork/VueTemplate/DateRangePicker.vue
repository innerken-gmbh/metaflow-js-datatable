<template>
  <div class="pa-1">
    <h3>{{ $t('请选择日期范围') }}</h3>
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
                从...
              </div>
              <v-text-field
                v-model="startDate"
                placeholder="从..."
                prepend-inner-icon="mdi-calendar"
                readonly
                hide-details
                outlined
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
                到...
              </div>
              <v-text-field
                v-model="endDate"
                outlined
                placeholder="到..."
                prepend-inner-icon="mdi-calendar"
                readonly
                hide-details
                v-bind="attrs"
                v-on="on"
              />
            </template>
            <v-date-picker
              v-model="endDate"
              :min="startDate"
              :max="today"
              @input="endDateDialog=false"
            />
          </v-dialog>
        </div>
      </div>
    </div>

    <div
      style="display: grid;grid-template-columns: repeat(4,1fr);grid-gap: 8px"
      class="mt-4"
    >
      <base-card
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
      </base-card>
    </div>
  </div>
</template>

<script>

  import BaseCard from './BaseCard'
  import { predefinedDateRangeList, today } from '../DateRepository'

  export default {
    name: 'DateRangePicker',
    components: { BaseCard },
    props: {
      value: {},
    },
    data: function () {
      return {
        today,
        startDate: null,
        endDate: null,
        startDateDialog: null,
        endDateDialog: null,
        predefinedTimeList: predefinedDateRangeList,
      }
    },
    computed: {
      dateRange: {
        get () {
          return [this.startDate, this.endDate]
        },
        set (val) {
          if (val?.length === 2) {
            [this.startDate, this.endDate] = val
          }
        },
      },
    },
    watch: {
      value: {
        immediate: true,
        handler (val) {
          this.dateRange = val
        },
      },
      dateRange (val) {
        this.$emit('input', val)
      },
    },
    methods: {
      currentDateMatch (dateRange) {
        return [this.startDate, this.endDate].join() === dateRange.join()
      },
    },
  }
</script>

<style scoped>

</style>
