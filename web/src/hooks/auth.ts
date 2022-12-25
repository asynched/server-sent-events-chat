import { authStore } from '@/stores/auth'
import { useObservable } from '@/hooks/common'

export const useAuth = () => {
  const { user } = useObservable(authStore)

  return user!
}
