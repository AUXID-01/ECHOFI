import { useState } from 'react'

const TransactionFilters = ({ onSearch }) => {
  const [type, setType] = useState('all')
  const [date, setDate] = useState('')
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch({ type, date, query })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end my-4">
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border px-3 py-2 rounded"
      >
        <option value="all">All</option>
        <option value="credit">Credit</option>
        <option value="debit">Debit</option>
        <option value="upi">UPI</option>
      </select>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border px-3 py-2 rounded"
      />
      <input
        type="text"
        placeholder="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border px-3 py-2 rounded"
      />
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        type="submit"
      >
        Filter
      </button>
    </form>
  )
}

export default TransactionFilters
