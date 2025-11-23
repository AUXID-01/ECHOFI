const announcements = [
  {
    id: 1,
    title: 'Interest Rate Change',
    desc: 'Savings rate now 4.2%. Effective Dec 1, 2025.',
  },
  {
    id: 2,
    title: 'New Fixed Deposit Offer!',
    desc: 'Lock in 7% for 5-year FD.',
  },
]

const Announcements = () => (
  <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
    <h2 className="text-2xl font-bold mb-6">Bank Announcements</h2>
    <ul className="space-y-4">
      {announcements.map((a) => (
        <li key={a.id} className="border p-4 rounded">
          <h3 className="text-lg font-bold">{a.title}</h3>
          <p className="text-gray-700">{a.desc}</p>
        </li>
      ))}
    </ul>
  </div>
)

export default Announcements
