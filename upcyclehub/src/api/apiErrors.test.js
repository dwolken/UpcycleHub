import { describe, expect, it } from 'vitest'
import {
  ApiError,
  LOAD_ERROR_MESSAGE,
  cleanErrorMessage,
  createApiError,
  getStatusMessage,
  toUserMessage,
} from './apiErrors.js'

describe('api error helpers', () => {
  it('replaces empty or technical messages with the fallback', () => {
    expect(cleanErrorMessage('', 'Fallback')).toBe('Fallback')
    expect(cleanErrorMessage('Failed to fetch', 'Fallback')).toBe('Fallback')
  })

  it('keeps readable user-facing messages', () => {
    expect(cleanErrorMessage('Bitte pruefe deine Eingaben.')).toBe(
      'Bitte pruefe deine Eingaben.',
    )
  })

  it('uses status-specific fallback messages', () => {
    expect(getStatusMessage(404)).toBe('Der gesuchte Inhalt wurde nicht gefunden.')
    expect(getStatusMessage(418, 'Allgemeiner Fehler')).toBe('Allgemeiner Fehler')
  })

  it('creates ApiError objects from backend error responses', () => {
    const error = createApiError(
      { status: 409 },
      {
        error: {
          message: 'Benutzername ist bereits vergeben.',
          code: 'conflict',
        },
      },
    )

    expect(error).toBeInstanceOf(ApiError)
    expect(error.message).toBe('Benutzername ist bereits vergeben.')
    expect(error.status).toBe(409)
    expect(error.code).toBe('conflict')
  })

  it('extracts a safe user message with custom status overrides', () => {
    expect(
      toUserMessage(new ApiError('Server stack trace', { status: 401 }), LOAD_ERROR_MESSAGE, {
        401: 'Bitte zuerst anmelden.',
      }),
    ).toBe('Bitte zuerst anmelden.')
  })
})
