import { describe, expect, it } from 'vitest'
import apiResponses from './apiResponses.js'

const { sendData, sendError } = apiResponses

function createResponseDouble() {
  return {
    body: null,
    statusCode: null,
    json(payload) {
      this.body = payload
      return this
    },
    status(statusCode) {
      this.statusCode = statusCode
      return this
    },
  }
}

describe('api response helpers', () => {
  it('wraps successful response data', () => {
    const res = createResponseDouble()

    sendData(res, { id: 1 }, 201)

    expect(res.statusCode).toBe(201)
    expect(res.body).toEqual({
      data: { id: 1 },
    })
  })

  it('returns a predictable error response shape', () => {
    const res = createResponseDouble()

    sendError(res, 'Projekt wurde nicht gefunden.', 404)

    expect(res.statusCode).toBe(404)
    expect(res.body).toEqual({
      message: 'Projekt wurde nicht gefunden.',
      error: {
        message: 'Projekt wurde nicht gefunden.',
        status: 404,
        code: 'not_found',
      },
    })
  })
})
