import { v4 } from 'uuid'
import cors from 'cors'
import pino from 'pino'
import express, { json } from 'express'
import { Observable } from '@/observables'
import { messageSchema, signInSchema, userSchema } from '@/schemas'

const app = express()
const logger = pino(
  {
    level: 'info',
  },
  pino.multistream([
    {
      stream: process.stdout,
    },
    {
      stream: process.stderr,
    },
    {
      stream: pino.destination('server.logs'),
    },
  ])
)

app.use(cors())
app.use(json())

const events = new Observable<ChatEvent>()

app.get('/chat/sse', (req, res) => {
  const result = userSchema.safeParse(req.query)

  if (!result.success) {
    logger.error({
      route: '/chat/sse',
      message: 'User tried to connect with invalid identity',
    })

    return res.status(400).send(result.error)
  }

  logger.info({
    route: '/chat/sse',
    message: 'User connected',
    user: result.data,
  })

  res.header('Cache-Control', 'no-store')
  res.header('Content-Type', 'text/event-stream')
  res.header('Connection', 'keep-alive')

  const unsubscribe = events.subscribe((event) => {
    res.write(`event: message\n`)
    res.write(`data: ${JSON.stringify(event)}\n\n`)
  })

  req.on('close', () => {
    logger.info({
      route: '/chat/sse',
      message: 'User disconnected',
      user: result.data,
    })

    unsubscribe()
    events.emit({
      discriminant: 'UserSignedOut',
      data: {
        user: result.data,
      },
    })
  })
})

app.post('/chat/register', (req, res) => {
  const result = signInSchema.safeParse(req.body)

  if (!result.success) {
    logger.error({
      route: '/chat/register',
      message: 'User tried to register with invalid data',
    })

    return res.status(400).send(result)
  }

  const user = {
    id: v4(),
    name: result.data.name,
  }

  logger.info({
    route: '/chat/register',
    message: 'User registered',
    user,
  })

  events.emit({
    discriminant: 'UserSignedIn',
    data: {
      user,
    },
  })

  return res.json(user)
})

app.post('/chat/message', (req, res) => {
  const result = messageSchema.safeParse(req.body)

  if (!result.success) {
    logger.error({
      route: '/chat/message',
      message: 'User tried to send a message with invalid data',
    })

    return res.status(400).send(result.error)
  }

  logger.info({
    route: '/chat/message',
    message: 'User sent a message',
    user: result.data.user,
  })

  events.emit({
    discriminant: 'UserMessage',
    data: {
      ...result.data,
      id: v4(),
    },
  })

  return res.status(204).end()
})

app.listen(3333, () => {
  logger.info({
    message: 'Server started',
    port: 3333,
  })
})
