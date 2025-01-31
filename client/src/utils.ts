import { Navigate } from "react-router-dom"



type APIOptions = {
    method: string
    body?: object
}

const defaultOptions: APIOptions = {
    method: 'GET'
}

export async function api(path: string, options: APIOptions = defaultOptions) {
  const response = await fetch(`http://localhost:8000/api${path}`, {
    method: options.method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(options.body),
    credentials: 'include'
  })

  const status = response.status
  const data = await response.json()

  if (status === 401) {
    Navigate({ to: '/login' })
  }

  return { status, data }
}