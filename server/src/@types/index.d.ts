declare type User = {
  id: string
  name: string
}

declare type UserSignedIn = {
  discriminant: 'UserSignedIn'
  data: {
    user: User
  }
}

declare type UserMessage = {
  discriminant: 'UserMessage'
  data: {
    id: string
    user: User
    message: string
  }
}

declare type UserSignedOut = {
  discriminant: 'UserSignedOut'
  data: {
    user: User
  }
}

declare type ChatEvent = UserSignedIn | UserMessage | UserSignedOut
