import React, { use, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const Loading = () => {
  const {nextUrl} = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (nextUrl) {
      setTimeout(() => {
        navigate('/' + nextUrl);
      }, 8000); // Redirect after 8 seconds
    }
  }, [nextUrl, navigate]);
  return (
    <div className='flex justify-center items-center h-[80vh]'>
      <div className='animate-spin rounded-full h-24 w-24 border-b-2 border-primary'>
            
      </div>
    </div>
  )
}

export default Loading
