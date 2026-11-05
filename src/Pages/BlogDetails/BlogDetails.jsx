import React from 'react'
import BlogDetailsBreadcrumb from '../../Components/BlogDetailsBreadcrumb/BlogDetailsBreadcrumb'
import NewsBlogStandard from '../../Components/NewsBlogStandard/NewsBlogStandard'
import BlogCommentsSection from '../../Components/BlogCommentsSection/BlogCommentsSection'

const BlogDetails = () => {
  return (
    <div>
        <BlogDetailsBreadcrumb/>
         <NewsBlogStandard/>
         <BlogCommentsSection/>
    </div>
  )
}

export default BlogDetails