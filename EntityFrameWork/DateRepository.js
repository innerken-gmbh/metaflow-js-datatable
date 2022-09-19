import dayjs from 'dayjs'

function standardFormatter (dayObj) {
  return dayObj.format('YYYY-MM-DD')
}

const now = dayjs().subtract(3, 'hour').subtract(59, 'minute')

export const today = standardFormatter(now)
export const predefinedDateRangeList = [{
  label: 'today',
  dateRange: function () {
    return [today, today]
  },
}, {
  label: 'yesterday',
  dateRange: function () {
    return [standardFormatter(now.subtract(1, 'day')), standardFormatter(now.subtract(1, 'day'))]
  },
}, {
  label: 'lastSevenDays',
  dateRange: function () {
    return [standardFormatter(now.subtract(7, 'day')), today]
  },
}, {
  label: 'lastSameSevenDays',
  dateRange: function () {
    return [standardFormatter(now.subtract(14, 'day')), standardFormatter(now.subtract(8, 'day'))]
  },
}, {
  label: 'thisWeek',
  dateRange: function () {
    return [standardFormatter(now.startOf('week')), today]
  },
}, {
  label: 'lastWeek',
  dateRange: function () {
    return [standardFormatter(now.subtract(1, 'week').startOf('week')), standardFormatter(now.subtract(1, 'week').endOf('week'))]
  },
}, {
  label: 'thisMonth',
  dateRange: function () {
    return [standardFormatter(now.startOf('month')), today]
  },
}, {
  label: 'lastMonth',
  dateRange: function () {
    return [standardFormatter(now.subtract(1, 'month').startOf('month')), standardFormatter(now.subtract(1, 'month').endOf('month'))]
  },
}, {
  label: 'thisYear',
  dateRange: function () {
    return [standardFormatter(now.startOf('year')), today]
  },
}]

export function getNiceLabel (dateRange) {
  const result = predefinedDateRangeList.find(s => s.dateRange().join(',') === dateRange.join(','))
  return (result && result.label) || (dateRange[0] === dateRange[1] ? dateRange[0] : dateRange.join(' ~ '))
}

const stripeDateFormat = 'ddd, DD MMM YYYY HH:mm:ss '

export function convertStripeDate (stripeDateString) {
  return standardFormatter(dayjs(stripeDateString, stripeDateFormat))
}
