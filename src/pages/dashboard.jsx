import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
// import { calculatePrice } from "../utils/pricing";

function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [copies, setCopies] = useState(1);
  const [printType, setPrintType] = useState("blackAndWhite");
  const [dashboardData, setDashboardData] = useState(null);
  const apiBaseUrl = "http://localhost:5000";

  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);

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
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    fetchDashboardData();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("Please select a PDF file");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('copies', copies);
      formData.append('printType', printType);
      formData.append('paperSize', 'A4');
      formData.append('orientation', 'portrait');

      const token = localStorage.getItem('token');
      const response = await axios.post(`${apiBaseUrl}/api/orders/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        setPendingOrders([response.data.order, ...pendingOrders]);
        setSelectedFile(null);
        setCopies(1);
        setPrintType("blackAndWhite");
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
      case "ready":
        return "bg-green-100 text-green-800";
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
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
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedOrders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3 flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-600"> ₹ </span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">₹245</p>
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
                  {selectedFile ? selectedFile.name : "Drop your PDF here, or click to browse"}
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="sr-only"
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">PDF files only, up to 50MB</p>
            </div>
          </div>

          {selectedFile && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Print Options</span>
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
                      <div className="flex-shrink-0">
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
                      <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
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
                    <div className="flex-shrink-0">
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
    </div>
  );
}

export default Dashboard;
