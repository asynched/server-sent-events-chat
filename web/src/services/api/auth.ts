type SignInDto = {
  name: string
}

type UserDto = {
  id: string
  name: string
}

export const signIn = async (dto: SignInDto) => {
  const response = await fetch('http://localhost:3333/chat/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  })

  if (!response.ok) {
    throw new Error('Failed to sign in')
  }

  const user = (await response.json()) as UserDto

  return user
}
