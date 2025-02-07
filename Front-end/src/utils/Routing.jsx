import React from 'react'
import { Routes } from 'react-router-dom'
import Login from '../components/Login'

function Routing() {
  return (
    <div>
      <Routes path="/" element={<Login />}></Routes>
    </div>
  )
}

export default Routing
