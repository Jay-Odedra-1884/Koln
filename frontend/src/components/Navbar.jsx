import { useNavigate } from 'react-router-dom'

function Navbar() {

  const router = useNavigate();

  return (
    <div className='w-full flex justify-between items-center'>
      <div>
        <h1 className=' text-3xl md:text-5xl cursor-pointer hover:scale-110 transition-all duration-200'><span className='text-[#BF1CBA] '>K</span>oln</h1>
      </div>
      <div className='flex items-center gap-4 md:gap-8'>
        <div 
          className='px-2 py-2 md:w-34 md:px-[2px] text-xl flex justify-center items-center rounded-lg bg-[#BF1CBA] cursor-pointer hover:opacity-75 hover:scale-110 transition-all duration-200' 
          role='button'
          onClick={() => router('/join')}
          >
          Join
        </div>
      </div>
    </div>
  )
}

export default Navbar
