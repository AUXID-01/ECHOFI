import { Mic, Bell } from 'lucide-react'

const Header = ({ title = 'EchoFi' }) => (
  <header className="sticky top-0 bg-white flex items-center justify-between px-4 py-3 shadow">
    <h1 className="text-xl font-bold">{title}</h1>
    <div className="flex items-center gap-4">
      <button className="p-2 bg-blue-100 rounded-full">
        <Mic className="w-5 h-5 text-blue-600" />
      </button>
      <button className="p-2 bg-blue-100 rounded-full">
        <Bell className="w-5 h-5 text-blue-600" />
      </button>
    </div>
  </header>
)

export default Header
