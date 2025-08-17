export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      
      <div className="max-w-2xl">
        <p className="text-lg mb-8">
          Get in touch with the Racket Ladder team for support, questions, or feedback.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Support</h2>
            <p className="mb-2">For technical support and help with the platform:</p>
            <p className="text-blue-600">support@racketladder.com</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">General Inquiries</h2>
            <p className="mb-2">For general questions and information:</p>
            <p className="text-blue-600">info@racketladder.com</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="/admin" className="text-blue-600 hover:underline">
                Admin Dashboard
              </a>
              {" - "} 
              Manage your club and tournaments
            </li>
            <li>
              <a href="/clubs" className="text-blue-600 hover:underline">
                Browse Clubs
              </a>
              {" - "} 
              Find clubs and join tournaments
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
