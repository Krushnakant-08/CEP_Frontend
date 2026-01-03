import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import Details from "../components/Details";
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
  const apiBaseUrl = "http://localhost:5000";

  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
      console.log('Uploading file to Cloudinary:', selectedFile);
      cloudinaryFormData.append('file', selectedFile);
      cloudinaryFormData.append('upload_preset', 'Community_Prog'); // Replace with your Cloudinary upload preset
      
      setUploadProgress(20);
      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/dmkvdl7vk/auto/upload`, // Replace your_cloud_name
        cloudinaryFormData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 50) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );
      console.log('Cloudinary upload response:', cloudinaryResponse.data);
      const fileUrl = cloudinaryResponse.data.secure_url;
      setUploadProgress(60);

      // Then, send the Cloudinary URL to backend
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

      setUploadProgress(100);

      if (response.data.success) {
        setPendingOrders([response.data.order, ...pendingOrders]);
        setSelectedFile(null);
        setCopies(1);
        setPrintType("blackAndWhite");
        setPdfPageCount(0);
      }
      setIsUploading(false);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file. Please try again.');
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
    <div className="min-h-screen bg-gray-50">
      <Header userName={dashboardData?.user?.name || "User"} userEmail={dashboardData?.user?.email || ""} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="shrink-0 bg-blue-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="shrink-0 bg-green-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upload New Document</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
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
                <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {pdfPageCount} {pdfPageCount === 1 ? 'Page' : 'Pages'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Copies</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={copies}
                    onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Print Type</label>
                  <select 
                    value={printType}
                    onChange={(e) => setPrintType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  >
                    <option value="blackAndWhite">Black & White (₹2/page)</option>
                    <option value="color">Color (₹10/page)</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? `Uploading... ${uploadProgress}%` : "Upload & Submit for Printing"}
              </button>
              {isUploading && (
                <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Pending Orders</h2>
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
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status === "processing" ? "Processing" : "Ready to Collect"}
                      </span>
                      <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Details
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
                  <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                    Download Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Details order={selectedOrder} variant="pink" />
            <button 
              onClick={() => setSelectedOrder(null)}
              className="mt-4 w-full bg-white text-gray-900 py-2 px-4 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
