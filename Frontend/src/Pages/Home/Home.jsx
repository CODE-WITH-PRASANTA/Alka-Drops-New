import React from 'react'
import HomeMain from '../../Components/HomeMain/HomeMain'
import HomeWhyChoose from '../../Components/HomeWhyChoose/HomeWhyChoose'
import HomeExperienced from '../../Components/HomeExperienced/HomeExperienced'
import HomeOurProducts from '../../Components/HomeOurProducts/HomeOurProducts'
import HomeWhoWeAre from '../../Components/HomeWhoWeAre/HomeWhoWeAre'
import HomeTestimonial from '../../Components/HomeTestimonial/HomeTestimonial'
import HomeNews from '../../Components/HomeNews/HomeNews'

const Home = () => {
  return (
    <div>
      <HomeMain/>
      <HomeWhyChoose/>
      <HomeExperienced/>
      <HomeOurProducts/>
      <HomeWhoWeAre/>
      <HomeTestimonial/>
      <HomeNews/>
    </div>
  )
}

export default Home