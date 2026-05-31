import { auth } from '@/auth'
import { logDevDbFallback, shouldUseDevDbFallback } from './db/dev-fallback'

export async function safeAuth() {
  try {
    return await auth()
  } catch (error) {
    if (shouldUseDevDbFallback(error)) {
      logDevDbFallback('auth', error)
      return null
    }
    throw error
  }
}
