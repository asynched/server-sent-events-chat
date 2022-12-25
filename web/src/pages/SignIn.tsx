import React from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '@/services/api/auth'
import { setUser } from '@/stores/auth'

export default function SignIn() {
  const navigate = useNavigate()

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const data = new FormData(event.currentTarget)

    signIn({
      name: data.get('name') as string,
    })
      .then((user) => {
        setUser(user)
        navigate('/chat')
      })
      .catch((err) => alert(err.message))
  }

  return (
    <div>
      <h1>Sign in</h1>
      <form onSubmit={handleSignIn}>
        <input type="text" name="name" placeholder="Name" />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}
