/* eslint-disable react-refresh/only-export-components */

import { createFileRoute } from '@tanstack/react-router'
import App from '../App.jsx'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return <App />
}
