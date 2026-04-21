"use client"

import React from 'react'
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

const HomePage = () => {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw />
		</div>
  )
}

export default HomePage
