import React, { useRef } from 'react'
import { useAuth } from '@/hooks/auth'
import { sendMessage } from '@/services/api/messages'
import { useRealtimeChatMessages } from '@/hooks/chat'

export default function Chat() {
  const user = useAuth()
  const formRef = useRef<HTMLFormElement>(null)
  const messages = useRealtimeChatMessages(user)

  const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = formRef.current!
    const data = new FormData(form)

    sendMessage({
      user,
      message: data.get('message') as string,
    })
      .then(() => form.reset())
      .catch((err) => alert(err.message))
  }

  return (
    <div>
      <h1>Chat</h1>
      <p>
        <b>Logged in as: </b>
        {user.name}
      </p>
      <form onSubmit={handleSendMessage} ref={formRef}>
        <input type="text" name="message" placeholder="Message" />
        <button type="submit">Submit</button>
      </form>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            <strong>{message.name}</strong>: {message.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
