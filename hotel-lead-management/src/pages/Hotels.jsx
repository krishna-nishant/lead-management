import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, MapPin, IndianRupee  } from 'lucide-react';
import { Toaster, toast } from "sonner";

const Hotels = () => {
  const { user, token } = useContext(AuthContext);
  const [hotels, setHotels] = useState([]);
  // const { toast } = useToast();

  useEffect(() => {
    fetch("/hotels.json")
      .then((res) => res.json())
      .then((data) => setHotels(data))
      .catch((error) => console.error("Error fetching hotels:", error));
  }, []);

  const addToWishlist = async (hotelId) => {
    if (!user) {
      toast.error("You must be logged in to add to wishlist.");
      return;
    }
  
    try {
      // ✅ Send request to add hotel to wishlist
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
        toast.success(`${data.msg}`);
  
        // ✅ **Send request to update score**
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
          console.log("🎉 Score Updated:", scoreData.score);          
        } else {
          console.error("❌ Score Update Error:", scoreData.msg);
        }
      } else {
        toast.error(`${data.msg}`);
      }
    } catch (error) {
      console.error("❌ Error adding to wishlist:", error);
      toast.error("Something went wrong. Try again.");
    }
  };
  
  const bookHotel = async (hotelId, hotelName) => {
    if (!user) {
        toast.error("You must be logged in to book a hotel.");
        return;
    }

    const confirmBooking = window.confirm(`Are you sure you want to book ${hotelName}?`);
    if (!confirmBooking) return;

    try {
        // ✅ Step 1: Update Lead Score
        const response = await fetch("http://localhost:5000/api/leads/update-score", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId: user._id, action: "booking" }),
        });

        const data = await response.json();

        if (response.status === 403) {
            toast.error("Unauthorized. Please log in again.");
            return;
        }

        if (response.ok) {
            toast.success(`Successfully booked ${hotelName}! New Score: ${data.score}`);

            // ✅ Step 2: Send AI-generated email confirmation
            const emailResponse = await fetch("http://localhost:5000/api/leads/send-booking-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId: user._id, hotelName }),
            });

            const emailData = await emailResponse.json();

            if (emailResponse.ok) {
                toast.success("📩 Confirmation email sent!");
            } else {
                console.error("❌ Error sending email:", emailData.msg);
                toast.error("Failed to send email.");
            }
        } else {
            console.error("❌ Error updating score:", data.msg);
        }

    } catch (error) {
        console.error("❌ Error booking hotel:", error);
        toast.error("Something went wrong. Try again.");
    }
};

  return (
    <div className="container mx-auto py-8 px-4">
      <h2 className="text-3xl font-bold mb-6">Available Hotels</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <Card key={hotel.id} className="overflow-hidden transition-all hover:shadow-lg">
            <div className="h-48 bg-slate-200 flex items-center justify-center">
              <img 
                src={hotel.image || `/placeholder.svg?height=200&width=400`} 
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{hotel.name}</span>
              </CardTitle>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{hotel.location}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-lg font-bold">
                <IndianRupee  className="h-5 w-5 text-green-600" />
                <span>₹{hotel.price}</span>
                <span className="text-sm font-normal text-muted-foreground ml-1">per night</span>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 flex items-center gap-1"
                onClick={() => addToWishlist(hotel.id)}
              >
                <Heart className="h-4 w-4" />
                <span>Wishlist</span>
              </Button>
              <Button 
                className="flex-1 flex items-center gap-1 bg-green-600 hover:bg-green-700"
                onClick={() => bookHotel(hotel.id, hotel.name)}
              >
                <BookOpen className="h-4 w-4" />
                <span>Book Now</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Hotels;
