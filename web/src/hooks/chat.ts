import { joinParams } from '@/utils/urls'
import { useEffect, useState } from 'react'

type ChatMessage = {
  id: string
  name: string
  message: string
}

export const useRealtimeChatMessages = (user: User) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    const source = new EventSource(
      'http://localhost:3333/chat/sse' + joinParams(user)
    )

    source.addEventListener('message', (event) => {
      const payload = JSON.parse(event.data) as ChatEvent

      let message: ChatMessage

      if (payload.discriminant === 'UserSignedIn') {
        message = {
          id: String(Date.now()),
          name: 'System',
          message: `${payload.data.user.name} has joined the chat`,
        }
      }

      if (payload.discriminant === 'UserMessage') {
        message = {
          id: payload.data.id,
          name: payload.data.user.name,
          message: payload.data.message,
        }
      }

      if (payload.discriminant === 'UserSignedOff') {
        message = {
          id: String(Date.now()),
          name: 'System',
          message: `${payload.data.user.name} has left the chat`,
        }
      }

      setMessages((messages) => [...messages, message])
    })

    return () => source.close()
  }, [user, setMessages])

  return messages
}
