module.exports.getTotalTime = (options) => {
  if (!options.startedAt || !options.completedAt) return null

  const totalMilliSeconds = parseInt(options.completedAt, 10) - parseInt(options.startedAt, 10)
  const totalSeconds = totalMilliSeconds / 1000
  const totalMinutes = Math.floor(totalSeconds / 60)
  let hours = Math.floor(totalMinutes / 60)
  let minutes = totalMinutes % 60

  hours = (hours < 10 ? '0' : '') + hours
  minutes = (minutes < 10 ? '0' : '') + minutes

  return `${hours}:${minutes}`
}
//

module.exports.getTotalTimeByLimit = (options) => {
  if (!options.startedAt || !options.completedAt) return null

  const totalMilliSeconds = options.completedAt - options.startedAt
  const totalSeconds = totalMilliSeconds / 1000
  let totalMinutes = Math.floor(totalSeconds / 60)

  if (totalMinutes > 210) {
    totalMinutes = 210
  }

  let hours = Math.floor(totalMinutes / 60)
  let minutes = totalMinutes % 60

  hours = (hours < 10 ? '0' : '') + hours
  minutes = (minutes < 10 ? '0' : '') + minutes

  return `${hours}:${minutes}`
}

module.exports.getStudyInfo = (studyCodes, speechLevels) => {
  const resultCodes = []
  studyCodes = studyCodes ? studyCodes.split(',') : []
  speechLevels = speechLevels ? speechLevels.split(',') : []
  studyCodes.forEach((studyCode, index) => {
    resultCodes.push({studyCode, speechLevel: parseInt(speechLevels[index], 10)})
  })

  return resultCodes
}
