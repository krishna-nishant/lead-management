import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Wishlist = () => {
  const { user, token } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = () => {
    if (user) {
      fetch(`http://localhost:5000/api/wishlist/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch wishlist");
          return res.json();
        })
        .then((data) => setWishlist(data))
        .catch((error) => console.error("❌ Error fetching wishlist:", error));
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const removeFromWishlist = async (hotelId) => {
    try {
      const response = await fetch("http://localhost:5000/api/wishlist/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user._id, hotelId }),
      });

      const data = await response.json();
      alert(data.msg);

      // ✅ Update UI instantly
      setWishlist(prev => prev.filter(hotel => hotel.id !== hotelId));
    } catch (error) {
      console.error("❌ Error removing from wishlist:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Wishlist</h2>
      {wishlist.length === 0 ? (
        <p>No hotels in wishlist.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {wishlist.map((hotel) => (
            <div key={hotel.id} className="border p-4 rounded-lg">
              <h3 className="text-lg font-semibold">{hotel.name}</h3>
              <p>{hotel.location}</p>
              <p className="font-bold">${hotel.price} per night</p>
              <button
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => removeFromWishlist(hotel.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
