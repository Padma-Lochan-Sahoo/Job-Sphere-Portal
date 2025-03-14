import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import JobListing from '../components/JobListing'
import Footer from '../components/Footer'
import ChatbotButton from '../components/ChatbotButton'

const Home = () => {
  return (
    <div>
        <Navbar/>
        <Hero/>
        <JobListing/>
        <ChatbotButton/>
        <Footer />
    </div>
  )
}

export default Home