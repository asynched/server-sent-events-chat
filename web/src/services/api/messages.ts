type MessageDto = {
  user: User
  message: string
}

export const sendMessage = async (message: MessageDto) => {
  const response = await fetch('http://localhost:3333/chat/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  })

  if (!response.ok) {
    throw new Error('Failed to send message')
  }
}
