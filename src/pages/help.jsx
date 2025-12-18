import { Link } from "react-router-dom";

function Help() {
  const faqs = [
    {
      question: "How do I upload a document for printing?",
      answer: "Go to your Dashboard and click on the upload area. Select your PDF file, choose the number of copies and print type (Black & White or Color), then click 'Upload & Submit for Printing'."
    },
    {
      question: "What file formats are supported?",
      answer: "Currently, we only accept PDF files for printing. Make sure your document is saved as a PDF before uploading."
    },
    {
      question: "How long does it take to process my order?",
      answer: "Most orders are processed within 15-30 minutes. You'll receive a notification when your order is ready for collection."
    },
    {
      question: "What are the printing rates?",
      answer: "Black & White printing costs ₹2 per page, and Color printing costs ₹10 per page. Prices are automatically calculated based on your document."
    },
    {
      question: "How do I pay for my orders?",
      answer: "Payment is processed securely through UPI gateway when you place your order. You can pay using any UPI app like Google Pay, PhonePe, Paytm, or any other UPI-enabled payment method."
    },
    {
      question: "Can I cancel my order?",
      answer: "Yes, you can cancel your order before it starts processing. Once processing begins, cancellation is not possible. A full refund will be issued for cancelled orders."
    },
    {
      question: "Where do I collect my printed documents?",
      answer: "Visit the PrintHub counter at the campus xerox center. Show your order ID or the notification you received when your order was ready."
    },
    {
      question: "What if there's an issue with my print?",
      answer: "If you find any issues with print quality, please report it at the counter immediately. We'll reprint your document at no extra cost."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">PrintHub</span>
            </Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Support</h1>
          <p className="text-lg text-gray-600">Find answers to common questions</p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-sm text-gray-600 mb-3">Get help via email</p>
            <a href="mailto:support@printhub.com" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              support@printhub.com
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-sm text-gray-600 mb-3">Call us during work hours</p>
            <a href="tel:+919876543210" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              +91 98765 43210
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Visit Us</h3>
            <p className="text-sm text-gray-600 mb-3">Campus Xerox Center</p>
            <p className="text-indigo-600 text-sm font-medium">
              Main Building, Ground Floor
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {faqs.map((faq, index) => (
              <details key={index} className="group">
                <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </summary>
                <div className="px-6 pb-4 text-gray-600">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="mt-12 bg-indigo-50 border border-indigo-200 rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h3>
          <p className="text-gray-600 mb-4">Our support team is here to assist you</p>
          <a
            href="mailto:support@printhub.com"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

export default Help;
