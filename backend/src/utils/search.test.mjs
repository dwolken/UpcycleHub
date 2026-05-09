import { describe, expect, it } from 'vitest'
import searchUtils from './search.js'

const {
  getDamerauLevenshteinDistance,
  getProjectSearchScore,
  normalizeSearchText,
} = searchUtils

const projectValues = [
  'Garten aus Paletten',
  'Kräuter richtig trocknen',
  'Holzöl für alte Bretter',
]

describe('normalizeSearchText', () => {
  it('normalizes lowercase text, umlauts, sharp s and punctuation', () => {
    expect(normalizeSearchText('  Kräuter, Holzöl & Spaß!  ')).toBe(
      'kraeuter holzoel spass',
    )
  })

  it('normalizes decomposed accents consistently', () => {
    expect(normalizeSearchText('Cafe\u0301 Regal')).toBe('cafe regal')
  })
})

describe('getDamerauLevenshteinDistance', () => {
  it('counts a swapped neighboring character as one typo', () => {
    expect(getDamerauLevenshteinDistance('garten', 'graten', 2)).toBe(1)
  })
})

describe('getProjectSearchScore', () => {
  it('matches direct search terms after normalization', () => {
    expect(getProjectSearchScore(projectValues, 'Kraeuter')).toBe(0)
    expect(getProjectSearchScore(projectValues, 'Holzoel')).toBe(0)
  })

  it('allows small typos for longer single-word searches', () => {
    expect(getProjectSearchScore(projectValues, 'Gaten')).toBe(11)
    expect(getProjectSearchScore(projectValues, 'Gartn')).toBe(11)
  })

  it('does not let nonsense queries match every project', () => {
    expect(getProjectSearchScore(projectValues, 'xyzunfug')).toBeNull()
  })

  it('does not fuzzy-match very short searches', () => {
    expect(getProjectSearchScore(projectValues, 'gt')).toBeNull()
  })
})
