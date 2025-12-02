import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import React from 'react'

function wrapper({ children }: any) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthContext', () => {
  it('initially loads stored user from localStorage', () => {
    // set localStorage
    localStorage.setItem('auth', JSON.stringify({ user: { id: 1, name: 'X', email: 'x@test.com', role: 'user' }, token: 't' }))
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toMatchObject({ email: 'x@test.com' })
    expect(result.current.token).toBe('t')
  })
})
