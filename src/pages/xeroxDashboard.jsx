import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function XeroxDashboard() {
  const [activeTab, setActiveTab] = useState("pending");
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    ready: 0,
    completed: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const apiBaseUrl = "http://localhost:5000";
  const navigate = useNavigate();

  // Fetch orders on mount
  useEffect(() => {
    const token = localStorage.getItem('xeroxToken');
    if (!token) {
      navigate('/xerox-login');
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('xeroxToken');
      
      // Fetch dashboard stats
      const dashboardResponse = await axios.get(`${apiBaseUrl}/api/xerox/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch all orders
      const ordersResponse = await axios.get(`${apiBaseUrl}/api/xerox/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const ordersData = ordersResponse.data.orders || [];
      setOrders(ordersData);
      
      // Use stats from dashboard
      const dashboardStats = dashboardResponse.data.stats;
      setStats({
        pending: dashboardStats.processingOrders || 0,
        ready: ordersData.filter(o => o.status === "ready").length,
        completed: dashboardStats.completedOrders || 0,
        totalRevenue: dashboardStats.totalRevenue || 0
      });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('xeroxToken');
        navigate('/xerox-login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('xeroxToken');
      await axios.put(
        `${apiBaseUrl}/api/xerox/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh orders
      fetchOrders();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('xeroxToken');
    localStorage.removeItem('xerox');
    navigate('/xerox-login');
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === "pending") return order.status === "processing";
    if (activeTab === "ready") return order.status === "ready";
    if (activeTab === "completed") return order.status === "completed";
    return true;
  });

  const getStatusBadge = (status) => {
    const styles = {
      processing: "bg-yellow-100 text-yellow-800 border-yellow-300",
      ready: "bg-green-100 text-green-800 border-green-300",
      completed: "bg-gray-100 text-gray-800 border-gray-300"
    };
    
    const labels = {
      processing: "Processing",
      ready: "Ready",
      completed: "Completed"
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Xerox Shop Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchOrders}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ready to Collect</p>
                <p className="text-3xl font-bold text-green-600">{stats.ready}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-600">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-purple-600">₹{stats.totalRevenue}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === "pending"
                    ? "border-yellow-600 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setActiveTab("ready")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === "ready"
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Ready ({stats.ready})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === "completed"
                    ? "border-gray-600 text-gray-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Completed ({stats.completed})
              </button>
            </nav>
          </div>

          {/* Orders List */}
          <div className="divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-4 text-gray-500">No orders found</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="px-6 py-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="shrink-0">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">{order.fileName || "Document.pdf"}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Order ID: {order.id}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>{order.pages} pages</span>
                          <span>•</span>
                          <span>{order.copies} {order.copies > 1 ? 'copies' : 'copy'}</span>
                          <span>•</span>
                          <span className="capitalize">{order.printType === "blackAndWhite" ? "B&W" : "Color"}</span>
                          <span>•</span>
                          <span className="font-semibold text-gray-900">₹{order.price}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Customer: {order.customer?.name || "N/A"} • Ordered: {formatDate(order.createdAt || new Date())}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {order.status === "processing" && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, "completed")}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition font-medium"
                        >
                          Mark Ready
                        </button>
                      )}
                      {order.status === "ready" && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, "completed")}
                          className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition font-medium"
                        >
                          Mark Completed
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-medium transition"
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
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={() => setShowModal(false)}
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
                  {getStatusBadge(selectedOrder.status)}
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
                <div>
                  <p className="text-sm text-gray-600">Paper Size</p>
                  <p className="font-medium">{selectedOrder.paperSize}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Orientation</p>
                  <p className="font-medium capitalize">{selectedOrder.orientation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-medium text-lg text-purple-600">₹{selectedOrder.price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ordered At</p>
                  <p className="font-medium">{formatDate(selectedOrder.createdAt || new Date())}</p>
                </div>
              </div>

              {/* File Preview/Link */}
              {selectedOrder.fileUrl && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold text-gray-900 mb-2">Document</h3>
                  <a 
                    href={selectedOrder.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View/Download Document
                  </a>
                </div>
              )}

              {/* Customer Details */}
              {selectedOrder.customer && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Name</p>
                      <p className="font-medium">{selectedOrder.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium">{selectedOrder.customer.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium">{selectedOrder.customer.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}

              {selectedOrder.status === "processing" && (
                <div className="pt-4 border-t">
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, "completed")}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    Mark as Ready to Collect
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default XeroxDashboard;
