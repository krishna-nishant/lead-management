import { useEffect, useState } from "react";

const Hotels = () => {
  const [hotels, setHotels] = useState([]);

  // Fetch hotels from local JSON file
  useEffect(() => {
    fetch("/hotels.json")
      .then((res) => res.json())
      .then((data) => setHotels(data))
      .catch((error) => console.error("Error fetching hotels:", error));
  }, []);

  // Add hotel to wishlist (stored in localStorage)
  const addToWishlist = (hotel) => {
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    if (!wishlist.find((item) => item.id === hotel.id)) {
      wishlist.push(hotel);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      alert(`Added "${hotel.name}" to wishlist!`);
    } else {
      alert("This hotel is already in your wishlist.");
    }

    // Send lead score update to backend
    fetch("http://localhost:5000/api/leads/update-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nishantkrishna2005@gmail.com", action: "wishlist", hotelId: hotel.id }),
    });
  };

  // Book a hotel (Send data to backend)
  const bookHotel = async (hotel) => {
    console.log("Booking:", hotel.name);

    await fetch("http://localhost:5000/api/leads/update-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nishantkrishna2005@gmail.com", action: "booking", hotelId: hotel.id }),
    });

    alert(`Successfully booked ${hotel.name}!`);
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
            <button
              className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded"
              onClick={() => addToWishlist(hotel)}
            >
              Add to Wishlist
            </button>
            <button
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => bookHotel(hotel)}
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hotels;
