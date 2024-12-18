export function displayTime(time?: number | null): string {
  if (time === null || time === undefined) {
    return 'DNS'
  }

  if (time < 0) {
    return 'DNF'
  }

  const hours = Math.floor(time / 3_600_000) // 1 Hour = 3600000 Milliseconds
  const minutes = Math.floor((time % 3_600_000) / 60_000) // 1 Minute = 60000 Milliseconds
  const seconds = Math.floor(((time % 3_600_000) % 60_000) / 1000) // 1 Second = 1000 Milliseconds
  const milliseconds = Math.floor(((time % 3_600_000) % 60_000) % 1000)

  let base = `${milliseconds.toString().padStart(3, '0')}`

  base = base.slice(0, -1)

  if (hours > 0) {
    base = `${hours}:${pad(minutes)}:${pad(seconds)}.${base}`
  } else if (minutes > 0) {
    base = `${minutes}:${pad(seconds)}.${base}`
  } else {
    base = `${seconds}.${base}`
  }

  return base
}

export function pad(num: number): string {
  return num.toString().padStart(2, '0')
}

export function formatCustomTime(timeString: string) {
  const isNumber = parseInt(timeString)

  if (!isNaN(isNumber)) {
    if (isNumber < 0) {
      return -1
    }
    return formatTimeInput(isNumber)
  } else {
    return formatStringToMilliSeconds(timeString)
  }
}

export function formatStringToMilliSeconds(timeString: string) {
  const regex = /^((\d{1,2}:)?\d{1,2}:)?\d{1,2}\.\d{1,2}$/gm

  if (!regex.exec(timeString)) {
    return
  }

  const parts = timeString.split(':').reverse()

  if (parts.length > 3) {
    return
  }

  const s = parts.shift()

  if (!s) return

  const [seconds, milliseconds] = s.split('.')

  if (!seconds || !milliseconds) {
    return 0
  }

  let totalMilliseconds = parseInt(seconds) * 1000 + parseInt(milliseconds) * 10

  if (parts.length === 1) {
    const [minutes] = parts

    if (!minutes) {
      return 0
    }

    totalMilliseconds += parseInt(minutes) * 60 * 1000
  } else if (parts.length === 2) {
    const [minutes, hours] = parts

    if (!minutes || !hours) {
      return 0
    }
    totalMilliseconds += parseInt(minutes) * 60 * 1000
    totalMilliseconds += parseInt(hours) * 60 * 60 * 1000
  }

  return totalMilliseconds
}

export function formatTimeInput(time: number) {
  const hours = Math.floor(time / 1000000)
  const minutes = Math.floor((time % 1000000) / 10000)
  const seconds = Math.floor((time % 10000) / 100)
  const milliSeconds = (time % 100) * 10
  return hours * 3_600_000 + minutes * 60_000 + seconds * 1000 + milliSeconds
}
