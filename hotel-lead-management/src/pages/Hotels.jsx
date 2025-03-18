import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Hotels = () => {
  const { user, token } = useContext(AuthContext);
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    fetch("/hotels.json")
      .then((res) => res.json())
      .then((data) => setHotels(data))
      .catch((error) => console.error("Error fetching hotels:", error));
  }, []);

  const addToWishlist = async (hotelId) => {
    if (!user) {
      alert("You must be logged in to add to wishlist.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/wishlist/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user._id, hotelId }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert(data.msg);
  
        // ✅ **Update Score After Adding to Wishlist**
        const scoreResponse = await fetch("http://localhost:5000/api/leads/update-score", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: user._id, action: "wishlist" }),
        });
  
        const scoreData = await scoreResponse.json();
        if (scoreResponse.ok) {
          alert(`Score updated! New Score: ${scoreData.score}`);
        } else {
          console.error("Error updating score:", scoreData.msg);
        }
  
      } else {
        alert("Failed to add to wishlist.");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      alert("Something went wrong. Try again.");
    }
  };
  


  const bookHotel = async (hotelId, hotelName) => {
    if (!user) {
      alert("You must be logged in to book a hotel.");
      return;
    }

    const confirmBooking = window.confirm(`Are you sure you want to book ${hotelName}?`);
    if (!confirmBooking) return;

    try {
      const scoreResponse = await fetch("http://localhost:5000/api/leads/update-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user._id, action: "booking" }),
      });

      const scoreData = await scoreResponse.json();
      if (scoreResponse.ok) {
        alert(`Successfully booked ${hotelName}! New Score: ${scoreData.score}`);
      } else {
        console.error("Error updating score:", scoreData.msg);
      }

    } catch (error) {
      console.error("Error booking hotel:", error);
      alert("Something went wrong. Try again.");
    }
};


  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Available Hotels</h2>
      <div className="grid grid-cols-3 gap-4">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold">{hotel.name}</h3>
            <p>{hotel.location}</p>
            <p className="font-bold">${hotel.price} per night</p>
            <button className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded" onClick={() => addToWishlist(hotel.id)}>
              Add to Wishlist
            </button>
            <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded" onClick={() => bookHotel(hotel.id, hotel.name)}>
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hotels;
