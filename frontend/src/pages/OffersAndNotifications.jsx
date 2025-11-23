const offers = [
  {
    id: 1,
    type: 'Offer',
    text: 'Get ₹200 cashback with your next UPI transaction!',
  },
  {
    id: 2,
    type: 'Notification',
    text: 'Your statement for Nov 2025 is ready.',
  },
]

const OffersAndNotifications = () => (
  <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
    <h2 className="text-2xl font-bold mb-6">Offers & Notifications</h2>
    <ul className="space-y-4">
      {offers.map((o) => (
        <li key={o.id} className="border p-4 rounded flex justify-between">
          <span
            className={`font-semibold ${
              o.type === 'Offer' ? 'text-green-600' : 'text-blue-600'
            }`}
          >
            {o.type}:
          </span>
          <span>{o.text}</span>
        </li>
      ))}
    </ul>
  </div>
)

export default OffersAndNotifications
