import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
// import { calculatePrice } from "../utils/pricing";

function Orders() {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const apiBaseUrl = "http://localhost:5000";

  // Fetch orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${apiBaseUrl}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setOrders([]);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return ["processing", "ready"].includes(order.status);
    if (activeTab === "completed") return order.status === "completed";
    return false;
  });

  const getStatusBadge = (status) => {
    const styles = {
      processing: "bg-yellow-100 text-yellow-800",
      ready: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800"
    };
    
    const labels = {
      processing: "Processing",
      ready: "Ready to Collect",
      completed: "Completed"
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">View and manage all your print orders</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === "all"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === "pending"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Pending ({orders.filter(o => ["processing", "ready"].includes(o.status)).length})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === "completed"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Completed ({orders.filter(o => o.status === "completed").length})
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
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">{order.fileName}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Order ID: {order.id}</p>
                        {order.status !== "completed" && (
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>{order.pages} pages</span>
                            <span>•</span>
                            <span>{order.copies} {order.copies > 1 ? 'copies' : 'copy'}</span>
                            <span>•</span>
                            <span className="capitalize">{order.printType === "blackAndWhite" ? "B&W" : "Color"}</span>
                            <span>•</span>
                            <span className="font-semibold text-gray-900">₹{order.price}</span>
                          </div>
                        )}
                        {order.status === "completed" && (
                          <div className="mt-2 text-sm">
                            <span className="font-semibold text-gray-900">₹{order.price}</span>
                          </div>
                        )}
                        {order.estimatedReadyTime && (
                          <p className="text-sm text-gray-500 mt-2">
                            Estimated ready: {new Date(order.estimatedReadyTime).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition">
                        View Details
                      </button>
                      {order.status === "completed" && (
                        <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition">
                          Download Receipt
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Orders;
