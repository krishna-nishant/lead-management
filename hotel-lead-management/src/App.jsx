import { Link } from "react-router-dom";

const App = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">AI-Powered Hotel Lead Management</h1>
      <nav className="flex space-x-4 mb-6">
        <Link to="/hotels" className="bg-blue-500 text-white px-4 py-2 rounded">
          Browse Hotels
        </Link>
        <Link to="/wishlist" className="bg-yellow-500 text-white px-4 py-2 rounded">
          View Wishlist
        </Link>
      </nav>
      <p className="text-lg">Select an option above to continue.</p>
    </div>
  );
};

export default App;
