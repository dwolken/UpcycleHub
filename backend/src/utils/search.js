function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getSearchDistanceLimit(query) {
  if (query.length < 4) {
    return 0
  }

  if (query.length <= 5) {
    return 1
  }

  if (query.length <= 8) {
    return 2
  }

  return 3
}

function getDamerauLevenshteinDistance(leftValue, rightValue, maxDistance) {
  if (leftValue === rightValue) {
    return 0
  }

  if (Math.abs(leftValue.length - rightValue.length) > maxDistance + 1) {
    return maxDistance + 1
  }

  const distances = Array.from({ length: leftValue.length + 1 }, () =>
    Array(rightValue.length + 1).fill(0),
  )

  for (let leftIndex = 0; leftIndex <= leftValue.length; leftIndex += 1) {
    distances[leftIndex][0] = leftIndex
  }

  for (let rightIndex = 0; rightIndex <= rightValue.length; rightIndex += 1) {
    distances[0][rightIndex] = rightIndex
  }

  for (let leftIndex = 1; leftIndex <= leftValue.length; leftIndex += 1) {
    let rowMinimum = distances[leftIndex][0]

    for (let rightIndex = 1; rightIndex <= rightValue.length; rightIndex += 1) {
      const substitutionCost =
        leftValue[leftIndex - 1] === rightValue[rightIndex - 1] ? 0 : 1

      const distance = Math.min(
        distances[leftIndex - 1][rightIndex] + 1,
        distances[leftIndex][rightIndex - 1] + 1,
        distances[leftIndex - 1][rightIndex - 1] + substitutionCost,
      )

      distances[leftIndex][rightIndex] = distance

      if (
        leftIndex > 1 &&
        rightIndex > 1 &&
        leftValue[leftIndex - 1] === rightValue[rightIndex - 2] &&
        leftValue[leftIndex - 2] === rightValue[rightIndex - 1]
      ) {
        distances[leftIndex][rightIndex] = Math.min(
          distances[leftIndex][rightIndex],
          distances[leftIndex - 2][rightIndex - 2] + 1,
        )
      }

      rowMinimum = Math.min(rowMinimum, distances[leftIndex][rightIndex])
    }

    if (rowMinimum > maxDistance) {
      return maxDistance + 1
    }
  }

  return distances[leftValue.length][rightValue.length]
}

function isFuzzySearchCandidate(query, word, allowedDistance) {
  return (
    word[0] === query[0] &&
    word.length >= query.length &&
    Math.abs(word.length - query.length) <= allowedDistance + 1
  )
}

function getProjectSearchScore(searchableValues, query) {
  const normalizedQuery = normalizeSearchText(query)

  if (!normalizedQuery) {
    return 0
  }

  const searchableText = normalizeSearchText(searchableValues.join(' '))

  if (searchableText.includes(normalizedQuery)) {
    return 0
  }

  const queryWords = normalizedQuery.split(' ').filter(Boolean)
  const fuzzyQuery = queryWords.length === 1 ? queryWords[0] : ''
  const distanceLimit = getSearchDistanceLimit(fuzzyQuery)

  if (distanceLimit === 0) {
    return null
  }

  const searchableWords = [...new Set(searchableText.split(' ').filter(Boolean))]
  let bestDistance = distanceLimit + 1

  searchableWords.forEach((word) => {
    if (!isFuzzySearchCandidate(fuzzyQuery, word, distanceLimit)) {
      return
    }

    const distance = getDamerauLevenshteinDistance(
      fuzzyQuery,
      word,
      distanceLimit,
    )

    bestDistance = Math.min(bestDistance, distance)
  })

  return bestDistance <= distanceLimit ? 10 + bestDistance : null
}

module.exports = {
  getDamerauLevenshteinDistance,
  getProjectSearchScore,
  getSearchDistanceLimit,
  isFuzzySearchCandidate,
  normalizeSearchText,
}
