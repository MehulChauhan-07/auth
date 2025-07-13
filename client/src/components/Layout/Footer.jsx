import React from 'react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <div className='flex items-center justify-between gap-4 px-4 lg:px-44 py-3'>
      <Link to='/'>
        <img width={150} src={assets.logo} alt="" />
        </Link>
      <p className='flex border-1 border-gray-400 pl-4 text-sm text-gray-500 max-sm:hidden'>Copyright @MehulChauhan-07.dev | All Rights Reserved</p>
      <div className='flex gap-1'>
        <Link to={{ pathname: "https://www.facebook.com/" }} target="_blank">
          <img width={40} src={assets.facebook_icon} alt="Facebook" />
        </Link>
        <Link to={{ pathname: "https://twitter.com/" }} target="_blank">
          <img width={40} src={assets.twitter_icon} alt="Twitter" />
        </Link>
        <Link to={{ pathname: "https://www.instagram.com/" }} target="_blank">
          <img width={40} src={assets.google_plus_icon} alt="Instagram" />
        </Link>
      </div>
    </div>
  )
}

export default Footer