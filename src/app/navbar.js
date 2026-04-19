import { Show, UserButton } from '@clerk/nextjs'

export default function Navbar() {
  return (
    <div>
      <header className="flex justify-end items-center p-4 gap-4 h-16">
        <Show when="signed-out">
          <a href='auth/login' className="bg-gray-900 flex flex-col justify-center text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
            Login
          </a>
          <a href='auth/signup' className="bg-purple-700 flex flex-col justify-center text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
            Sign Up
          </a>
        </Show>
        <Show when="signed-in">
          <div className="flex flex-row p-4 gap-4">
            <UserButton />
          </div>
        </Show>
          </header>
    </div>
  )
}
