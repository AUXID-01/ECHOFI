const faqs = [
  { q: 'How do I reset my password?', a: 'Go to Profile > Change Password.' },
  {
    q: 'How to block my card?',
    a: 'Call support at 1800-123-456, or visit Profile > Block Card.',
  },
  {
    q: 'Security Tips?',
    a: 'Never share OTP or password. Use strong passwords and update regularly.',
  },
]

const SupportCenter = () => (
  <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
    <h2 className="text-2xl font-bold mb-6">Support & FAQs</h2>
    <ul className="space-y-4">
      {faqs.map((f, idx) => (
        <li key={idx} className="border p-4 rounded">
          <h3 className="text-lg font-semibold">{f.q}</h3>
          <p className="text-gray-700">{f.a}</p>
        </li>
      ))}
    </ul>
    <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded">
      Submit Support Ticket
    </button>
  </div>
)

export default SupportCenter
