import React from 'react'
import TaggedSlider from './TaggedSliders'

function Inspirations() {
  return (
    <div className='w-full h-screen bg-[#f5f5f5] flex flex-col space-y-8 justify-around items-center'>
      <h1 className='text-4xl font-bold text-[#333] mt-24'>Inspirations</h1>
      <TaggedSlider/>
    </div>
  )
}

export default Inspirations