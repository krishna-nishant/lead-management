import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, MapPin, IndianRupee  } from 'lucide-react';
import { Toaster, toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Wishlist = () => {
  const { user, token } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // const { toast } = useToast();

  const fetchWishlist = () => {
    if (user) {
      setIsLoading(true);
      fetch(`${API_URL}/api/wishlist/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch wishlist");
          return res.json();
        })
        .then((data) => {
          setWishlist(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("❌ Error fetching wishlist:", error);
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const removeFromWishlist = async (hotelId) => {
    try {
  
      const response = await fetch(`${API_URL}/api/wishlist/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user._id, hotelId }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        toast.success("Hotel removed from wishlist");
  
        // ✅ Immediately update the UI by filtering out the removed hotel
        setWishlist((prev) => prev.filter((hotel) => hotel.id !== hotelId));
  
      } else {
        toast.error("Failed to remove hotel from wishlist");
      }
    } catch (error) {
      console.error("❌ Error removing from wishlist:", error);
      toast.error("Something went wrong. Try again.");
    }
  };



  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center">
        <div className="animate-pulse text-center">
          <p className="text-lg">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h2 className="text-3xl font-bold mb-6">Your Wishlist</h2>
      
      {wishlist.length === 0 ? (
        <Alert className="max-w-md mx-auto">
          <AlertTitle>No hotels in your wishlist</AlertTitle>
          <AlertDescription>
            Browse our hotels and add some to your wishlist to see them here.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((hotel) => (
            <Card key={hotel.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="h-48 bg-slate-200 flex items-center justify-center">
                <img 
                  src={hotel.image || `/placeholder.svg?height=200&width=400`} 
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{hotel.name}</CardTitle>
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
              <CardFooter>
                <Button 
                  variant="destructive" 
                  className="w-full flex items-center gap-1"
                  onClick={() => removeFromWishlist(hotel.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove from Wishlist</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
