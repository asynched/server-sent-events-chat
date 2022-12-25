import { createObservable } from '@/hooks/common'

type User = {
  id: string
  name: string
}

export const authStore = createObservable({
  user: null as Maybe<User>,
})

export const setUser = (user: Maybe<User>) => {
  authStore.update({
    user,
  })
}
