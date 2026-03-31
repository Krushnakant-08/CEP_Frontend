import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [copies, setCopies] = useState(1);
  const [printType, setPrintType] = useState("blackAndWhite");
  const [dashboardData, setDashboardData] = useState(null);
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${apiBaseUrl}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(response.data);
        if (response.data.pendingOrders) setPendingOrders(response.data.pendingOrders);
        if (response.data.completedOrders) setCompletedOrders(response.data.completedOrders);
      } catch (error) {
        // console.error('Failed to fetch dashboard data:', error);
        if(error.response && error.response.statusText === 'Unauthorized') {
          window.location.href = '/login';
        }
      }
    };
    fetchDashboardData();
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    // console.log('Selected file:', file.name);
    if (file && (file.type === "application/pdf" || file.type === "image/jpeg" || file.type === "image/png")) {
      setSelectedFile(file);
      // console.log('File selected:', file.name);
      
      // Extract page count if it's a PDF
      if (file.type === "application/pdf") {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          setPdfPageCount(pdf.numPages);
        } catch (error) {
          console.error('Failed to read PDF page count:', error);
          setPdfPageCount(0);
        }
      } else {
        // For images, set page count to 1
        setPdfPageCount(1);
      }
    } else {
      alert("Please select a PDF, JPG, or PNG file");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // First, upload to Cloudinary
      const cloudinaryFormData = new FormData();
      
      cloudinaryFormData.append('file', selectedFile);
      cloudinaryFormData.append('upload_preset', 'Community_Prog'); 

      // 1. DETERMINE RESOURCE TYPE
      const resourceType = selectedFile.type === 'application/pdf' ? 'raw' : 'auto';

      setUploadProgress(20);
      
      const cloudinaryResponse = await axios.post(
        // 2. USE THE DYNAMIC URL
        `https://api.cloudinary.com/v1_1/dmkvdl7vk/${resourceType}/upload`, 
        cloudinaryFormData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 50) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );

      // 3. GET THE LINK
      const fileUrl = cloudinaryResponse.data.secure_url;
      setUploadProgress(60);

      const orderData = {
        fileUrl,
        fileName: selectedFile.name,
        copies,
        printType,
        pages: pdfPageCount
      };
      
      const token = localStorage.getItem('token');
      const response = await axios.post(`${apiBaseUrl}/api/orders/upload`, orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setUploadProgress(80);

      if (response.data.success) {
        const { razorpayOrderId, razorpayKeyId, amount, currency, order: createdOrder } = response.data;

        // Open Razorpay Checkout
        const options = {
          key: razorpayKeyId,
          amount: amount,
          currency: currency,
          name: "Campus E-Print",
          description: `Print Order: ${createdOrder.fileName}`,
          order_id: razorpayOrderId,
          prefill: {
            name: dashboardData?.user?.name || "",
            email: dashboardData?.user?.email || "",
            contact: dashboardData?.user?.phone || "",
          },
          notes: {
            orderId: createdOrder.id,
            fileName: createdOrder.fileName,
          },
          method: {
            upi: true,
            card: true,
            netbanking: true,
            wallet: true,
          },
          theme: {
            color: "#4F46E5"
          },
          handler: async function (paymentResponse) {
            // Payment successful — verify with backend
            try {
              const verifyRes = await axios.post(
                `${apiBaseUrl}/api/payment/verify`,
                {
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  orderId: createdOrder.id
                },
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );

              if (verifyRes.data.success) {
                // Payment verified — update local state
                const updatedOrder = { ...createdOrder, status: "processing", paymentStatus: "paid" };
                setPendingOrders([updatedOrder, ...pendingOrders]);
                setSelectedFile(null);
                setCopies(1);
                setPrintType("blackAndWhite");
                setPdfPageCount(0);
                setUploadProgress(100);
                alert('Payment successful! Your order is being processed.');
              }
            } catch (verifyError) {
              console.error('Payment verification failed:', verifyError);
              alert('Payment verification failed. Please contact support.');
            }
          },
          modal: {
            ondismiss: function () {
              alert('Payment cancelled. Your order will be auto-cancelled in 5 minutes if not paid.');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          alert('Payment failed: ' + response.error.description);
        });
        rzp.open();
      }
      setIsUploading(false);
    } catch (error) {
      alert('Failed to create order. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-blue-100 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl top-1/2 -right-48 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute w-64 h-64 bg-blue-300/30 rounded-full blur-3xl bottom-0 left-1/3 animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      <div className="relative z-10">
        <Header userName={dashboardData?.user?.name || "User"} userEmail={dashboardData?.user?.email || ""} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-blue-100/50 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="shrink-0 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-3 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-green-100/50 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="shrink-0 bg-linear-to-br from-green-500 to-green-600 rounded-xl p-3 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-900">{completedOrders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 mb-8 border border-blue-100/50">
          <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">Upload New Document</h2>
          <div className="border-2 border-dashed border-blue-200 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300">
            <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-semibold text-gray-900">
                  {selectedFile ? `${selectedFile.name} (${pdfPageCount} ${pdfPageCount === 1 ? 'page' : 'pages'})` : "Drop your PDF here, or click to browse"}
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={handleFileSelect}
                  className="sr-only"
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">PDF files only, up to 50MB</p>
            </div>
          </div>

          {selectedFile && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Print Options</span>
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {pdfPageCount} {pdfPageCount === 1 ? 'Page' : 'Pages'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Copies</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={copies}
                    onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-blue-300" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Print Type</label>
                  <select 
                    value={printType}
                    onChange={(e) => setPrintType(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-blue-300"
                  >
                    <option value="blackAndWhite">Black & White (₹2/page)</option>
                    <option value="color">Color (₹10/page)</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-blue-500/30"
              >
                {isUploading ? `Uploading... ${uploadProgress}%` : "Upload & Submit for Printing"}
              </button>
              {isUploading && (
                <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pending Orders */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl mb-8 border border-blue-100/50">
          <div className="px-6 py-4 border-b border-blue-100">
            <h2 className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pending Orders</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingOrders.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No pending orders. Upload a document to get started!
              </div>
            ) : (
              pendingOrders.map((order) => (
                <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="shrink-0">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{order.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {order.pages} pages • {order.copies} {order.copies > 1 ? 'copies' : 'copy'} • {order.uploadedAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status === "processing" ? "Processing" : "Ready to Collect"}
                      </span>
                      {order.fileUrl ? (
                        <a
                          href={order.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          View
                        </a>
                      ) : (
                        <span className="px-3 py-1 bg-gray-200 text-gray-500 text-sm rounded-lg font-medium cursor-not-allowed">
                          File Expired
                        </span>
                      )}
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Completed Orders</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {completedOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="shrink-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{order.fileName}</p>
                      <p className="text-sm text-gray-600 mt-1 font-semibold">₹{order.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {order.fileUrl ? (
                      <a
                        href={order.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-medium"
                      >
                        View
                      </a>
                    ) : (
                      <span className="px-3 py-1 bg-gray-200 text-gray-500 text-sm rounded-lg font-medium cursor-not-allowed">
                        File Expired
                      </span>
                    )}
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                    >
                      Receipt
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-medium">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status === "processing" ? "Processing" : selectedOrder.status === "ready" ? "Ready to Collect" : "Completed"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">File Name</p>
                  <p className="font-medium">{selectedOrder.fileName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pages</p>
                  <p className="font-medium">{selectedOrder.pages}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Copies</p>
                  <p className="font-medium">{selectedOrder.copies}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Print Type</p>
                  <p className="font-medium">
                    {selectedOrder.printType === "blackAndWhite" ? "Black & White" : "Color"}
                  </p>
                </div>
                {selectedOrder.paperSize && (
                  <div>
                    <p className="text-sm text-gray-600">Paper Size</p>
                    <p className="font-medium">{selectedOrder.paperSize}</p>
                  </div>
                )}
                {selectedOrder.orientation && (
                  <div>
                    <p className="text-sm text-gray-600">Orientation</p>
                    <p className="font-medium capitalize">{selectedOrder.orientation}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-medium text-lg text-blue-600">₹{selectedOrder.price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ordered At</p>
                  <p className="font-medium">{selectedOrder.uploadedAt || new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* File URL Info */}
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold text-gray-900 mb-2">Document</h3>
                {selectedOrder.fileUrl ? (
                  <a
                    href={selectedOrder.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                ) : (
                  <span className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    File Expired (auto-deleted after 2 weeks)
                  </span>
                )}
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Estimated Ready Time */}
              {selectedOrder.estimatedReadyTime && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold text-gray-900 mb-2">Estimated Ready Time</h3>
                  <p className="text-sm text-gray-600">{new Date(selectedOrder.estimatedReadyTime).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPdfPreview && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Document Preview</h2>
              <button
                onClick={() => {
                  setShowPdfPreview(false);
                  setPreviewUrl(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              {/* Try direct iframe first */}
              <iframe
                src={`${previewUrl}#toolbar=0`}
                className="w-full h-full border rounded"
                title="Document Preview"
                onError={(e) => {
                  console.error('Failed to load PDF in iframe:', e);
                }}
              />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Dashboard;
