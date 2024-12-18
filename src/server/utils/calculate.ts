import { ResultType } from '../db/schema'

export const getBest = (solves: number[]) => {
  const filtered = solves.filter((i) => i > 0)
  const min = Math.min(...filtered)

  return Number.POSITIVE_INFINITY === min ? -1 : min
}

const getWorst = (solves: number[]) => {
  const filtered = solves.filter((i) => i > 0)

  if (solves.length > filtered.length) {
    return -1
  }

  return Math.max(...filtered)
}

export const getAverage = (solves: number[], type: ResultType) => {
  return type === 'ao5' ? getAverage5(solves) : getAverage3(solves)
}

const getAverage3 = (solves: number[]) => {
  if (solves.length !== 3) {
    throw new Error('Эвлүүлэлтийн тоо таарахгүй байна.')
  }

  const filtered = solves.filter((i) => i > 0)

  if (solves.length > filtered.length) {
    return -1
  }

  return Math.floor(filtered.reduce((a, b) => a + b, 0) / 3)
}

const getAverage5 = (solves: number[]) => {
  if (solves.length !== 5) {
    throw new Error('Эвлүүлэлтийн тоо таарахгүй байна.')
  }

  const filtered = solves.filter((i) => i < 0)

  if (filtered.length >= 2) {
    return -1
  }

  const bestIndex = solves.indexOf(getBest(solves))
  const worstIndex = solves.indexOf(getWorst(solves))

  const filteredSolves = solves.filter(
    (_, index) => index !== bestIndex && index !== worstIndex,
  )

  return getAverage3(filteredSolves)
}
