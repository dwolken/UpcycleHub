function AppIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 14c3.5 0 6-2 8-6 1.5 5-1 10-5.5 11.5-2 .7-4.1.3-5.5-.5 1-.1 2-.5 3-1.2" />
      <path d="M7 14c0 2.5 1.3 4.3 4 5" />
    </svg>
  )
}

export default AppIcon
