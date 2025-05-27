export function displayTime(time?: number | null): string {
  if (time === null || time === undefined) {
    return 'DNS'
  }

  if (time < 0) {
    return 'DNF'
  }

  const hours = Math.floor(time / 3_600_000)
  const minutes = Math.floor((time % 3_600_000) / 60_000)
  const seconds = Math.floor((time % 60_000) / 1000)
  const milliseconds = Math.floor((time % 1000) / 10) // get hundredths

  const msString = milliseconds.toString().padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}.${msString}`
  } else if (minutes > 0) {
    return `${minutes}:${pad(seconds)}.${msString}`
  } else {
    return `${seconds}.${msString}`
  }
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

export function formatStringToMilliSeconds(
  timeString: string,
): number | undefined {
  if (timeString === 'DNF') {
    return -1
  }
  // Match formats like SS.MS, MM:SS.MS, or HH:MM:SS.MS
  const regex = /^(\d{1,2}:)?(\d{1,2}:)?\d{1,2}\.\d{1,3}$/

  if (!regex.test(timeString)) {
    return
  }

  const parts = timeString.split(':')
  const lastPart = parts.pop() // always SS.MS
  if (!lastPart) return

  const secondsWithMillis = parseFloat(lastPart)
  let totalMilliseconds = Math.round(secondsWithMillis * 1000)

  if (parts.length === 1) {
    const minutes = parseInt(parts[0]!, 10)
    totalMilliseconds += minutes * 60 * 1000
  } else if (parts.length === 2) {
    const minutes = parseInt(parts[1]!, 10)
    const hours = parseInt(parts[0]!, 10)
    totalMilliseconds += minutes * 60 * 1000 + hours * 60 * 60 * 1000
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
