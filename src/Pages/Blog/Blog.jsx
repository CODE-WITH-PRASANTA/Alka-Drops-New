import React from 'react'
import NewsBlogStandard from '../../Components/NewsBlogStandard/NewsBlogStandard'
import BlogCommentsSection from '../../Components/BlogCommentsSection/BlogCommentsSection'
import BlogbreadCrumb from '../../Components/BlogBreadcrumb/BlogBreadcrumb'

const Blog = () => {
  
  return (
    <div>
        <BlogbreadCrumb/>
        <NewsBlogStandard/>
        <BlogCommentsSection/>
    </div>
  )
}

export default Blog

//