import { useEffect, useState } from "react";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(storedWishlist);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Wishlist</h2>
      {wishlist.length === 0 ? (
        <p>No hotels in wishlist.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {wishlist.map((hotel, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <h3 className="text-lg font-semibold">{hotel.name}</h3>
              <p>{hotel.location}</p>
              <p className="font-bold">${hotel.price} per night</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
