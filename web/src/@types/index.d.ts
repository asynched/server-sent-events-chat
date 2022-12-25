declare type Maybe<T> = T | null | undefined

declare type User = {
  id: string
  name: string
}

type User = {
  id: string
  name: string
}

type UserSignedIn = {
  discriminant: 'UserSignedIn'
  data: {
    user: User
  }
}

type UserMessage = {
  discriminant: 'UserMessage'
  data: {
    id: string
    user: User
    message: string
  }
}

type UserSignedOff = {
  discriminant: 'UserSignedOff'
  data: {
    user: User
  }
}

type ChatEvent = UserSignedIn | UserMessage | UserSignedOff
