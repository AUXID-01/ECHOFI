const Loader = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center h-40 w-full">
    <div className="border-4 border-blue-200 border-t-blue-600 rounded-full w-10 h-10 animate-spin"></div>
    <div className="mt-3 text-blue-600">{text}</div>
  </div>
)

export default Loader
