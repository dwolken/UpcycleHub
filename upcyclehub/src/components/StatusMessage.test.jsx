import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  EmptyState,
  ErrorState,
  LoadingState,
  NotFoundState,
} from './StatusMessage.jsx'

vi.mock('@tanstack/react-router', () => ({
  Link({ children, to }) {
    return <a href={to}>{children}</a>
  },
}))

describe('StatusMessage states', () => {
  it('renders loading text', () => {
    render(<LoadingState>Projekte werden geladen.</LoadingState>)

    expect(screen.getByText('Projekte werden geladen.')).toBeInTheDocument()
  })

  it('renders an empty state title and description', () => {
    render(
      <EmptyState title="Noch keine Projekte">
        Erstelle dein erstes Upcycling-Projekt.
      </EmptyState>,
    )

    expect(screen.getByText('Noch keine Projekte')).toBeInTheDocument()
    expect(
      screen.getByText('Erstelle dein erstes Upcycling-Projekt.'),
    ).toBeInTheDocument()
  })

  it('renders an error title and message', () => {
    render(
      <ErrorState title="Projekt konnte nicht geladen werden.">
        Bitte versuche es später erneut.
      </ErrorState>,
    )

    expect(
      screen.getByText('Projekt konnte nicht geladen werden.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Bitte versuche es später erneut.')).toBeInTheDocument()
  })

  it('renders not-found text and navigation actions', () => {
    render(
      <NotFoundState title="Projekt wurde nicht gefunden">
        Dieses Projekt ist nicht verfügbar.
      </NotFoundState>,
    )

    expect(screen.getByText('Projekt wurde nicht gefunden')).toBeInTheDocument()
    expect(screen.getByText('Dieses Projekt ist nicht verfügbar.')).toBeInTheDocument()
    expect(screen.getByText('Zur Startseite')).toBeInTheDocument()
    expect(screen.getByText('Zu den Projekten')).toBeInTheDocument()
  })
})
