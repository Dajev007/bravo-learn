import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'

export default function InstallPWAPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) return

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Store the event so it can be triggered later
      setDeferredPrompt(e)
      // Show the install prompt
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Remember that user dismissed the prompt (for 7 days)
    const dismissUntil = new Date().getTime() + (7 * 24 * 60 * 60 * 1000)
    localStorage.setItem('pwa-install-dismissed', dismissUntil.toString())
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="mx-4 mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl shadow-2xl p-4 text-white">
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6" />
          </div>

          {/* Content */}
          <div className="flex-grow">
            <h3 className="font-bold text-lg mb-1">Install BravoLearn</h3>
            <p className="text-sm text-white/90 mb-3">
              Add to your home screen for quick access and offline learning!
            </p>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleInstallClick}
                className="bg-white text-primary-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                Install App
              </button>
              <button
                onClick={handleDismiss}
                className="text-white/90 hover:text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/10 transition-colors text-sm"
              >
                Not Now
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
