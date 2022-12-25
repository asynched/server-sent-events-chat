import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useObservable } from '@/hooks/common'
import { authStore } from '@/stores/auth'

import SignIn from '@/pages/SignIn'
import Chat from '@/pages/Chat'

export default function Router() {
  const { user } = useObservable(authStore)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route
          path="/chat"
          element={
            <PrivateRoute user={user}>
              <Chat />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

type PrivateRouteProps = {
  user: Maybe<User>
  children: React.ReactNode
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ user, children }) => {
  return user ? <>{children}</> : <Navigate to="/" />
}
