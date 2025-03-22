import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
// Admin email allowed to access this page
const ADMIN_EMAIL = "nishantkrishna2005@gmail.com";

const AdminDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and is the admin
    if (!user) {
      // Redirect to login if no user
      navigate("/login");
      return;
    }

    if (user.email !== ADMIN_EMAIL) {
      // Unauthorized access, redirect to home
      toast.error("Unauthorized access to admin page");
      navigate("/");
      return;
    }

    setAuthorized(true);
    fetchLeads();
  }, [user, navigate]);

  const fetchLeads = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/leads/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      let updatedLeads = response.data;

      updatedLeads = await Promise.all(
        updatedLeads.map(async (lead) => {
          if (!lead.assignedTo || lead.assignedTo === "unassigned") {
            const assignResponse = await axios.post(
              `${API_URL}/api/leads/assign-lead`,
              { userId: lead._id },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
            return { ...lead, assignedTo: assignResponse.data.assignedTo };
          }
          return lead;
        })
      );

      setLeads(updatedLeads);
    } catch (error) {
      console.error("❌ Error fetching leads:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter((lead) =>
    filter === "all" ? true : lead.category === filter
  );

  const sendAlerts = async () => {
    try {
      // Show loading toast
      const loadingToast = toast.loading("Sending alerts to leads...");
      
      const response = await fetch(
        `${API_URL}/api/leads/check-score`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      const data = await response.json();
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Process and display alert summary
      if (Array.isArray(data.msg) && data.msg.length > 0) {
        // Count different types of alerts
        const summary = data.msg.reduce((acc, message) => {
          if (message.includes("Email sent")) {
            acc.emails++;
          } else if (message.includes("WhatsApp")) {
            acc.whatsapp++;
          } else if (message.includes("Calling")) {
            acc.calls++;
          } else if (message.includes("No action")) {
            acc.noAction++;
          }
          return acc;
        }, { emails: 0, whatsapp: 0, calls: 0, noAction: 0 });
        
        // Show summary as success toast
        toast.success(
          <div>
            <p className="font-bold mb-2">Alerts Summary:</p>
            <ul className="text-sm">
              {summary.emails > 0 && <li>📧 Emails: {summary.emails}</li>}
              {summary.whatsapp > 0 && <li>📱 WhatsApp: {summary.whatsapp}</li>}
              {summary.calls > 0 && <li>📞 Calls: {summary.calls}</li>}
              {summary.noAction > 0 && <li>⏸️ No Action: {summary.noAction}</li>}
            </ul>
          </div>,
          { duration: 5000 }
        );
        
        // Refresh leads data to show updated alert history
        fetchLeads();
      } else {
        toast.success("Alerts processed successfully");
      }
    } catch (error) {
      console.error("Error sending alerts:", error);
      toast.error("Failed to send alerts.");
    }
  };

  const triggerCalls = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/calls/trigger-calls`,
        { 
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      const data = await response.json();
      toast.success(`${data.msg}`);
    } catch (error) {
      console.error("❌ Error triggering calls:", error);
      toast.error("Error placing calls.");
    }
  };

  // If not authorized, show a message
  if (!authorized && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-center mb-4">You don't have permission to access this page.</p>
        <Button onClick={() => navigate("/")}>Return to Home</Button>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  const getCategoryBadge = (category) => {
    switch (category) {
      case "hot":
        return <Badge variant="destructive">Hot Lead</Badge>;
      case "warm":
        return (
          <Badge
            variant="warning"
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            Warm Lead
          </Badge>
        );
      case "cold":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Cold Lead
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="max-w-6xl mx-auto my-8 shadow-lg">
      <CardHeader className="bg-slate-50 dark:bg-slate-800">
        <CardTitle className="text-2xl font-bold">
          Admin Dashboard - Leads
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Filter by Category:</span>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="hot">Hot Leads</SelectItem>
                <SelectItem value="warm">Warm Leads</SelectItem>
                <SelectItem value="cold">Cold Leads</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="default"
            onClick={sendAlerts}
            className="flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            Send Alerts
          </Button>
          <Button
            variant="default"
            onClick={triggerCalls}
            className="flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            Call Leads
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead._id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell className="font-bold">{lead.score}</TableCell>
                  <TableCell>{getCategoryBadge(lead.category)}</TableCell>
                  <TableCell>{lead.assignedTo || "Unassigned"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedLead(lead)}
                    >
                      View Score Breakdown
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredLeads.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No leads found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Score Breakdown Modal */}
        <Dialog
          open={!!selectedLead}
          onOpenChange={(open) => !open && setSelectedLead(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Score Breakdown
              </DialogTitle>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedLead.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedLead.email}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Total Score</p>
                  <p className="text-2xl font-bold">{selectedLead.score}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Breakdown:</h4>
                  {selectedLead.actions.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedLead.actions.map((action, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-md"
                        >
                          <span>{action.action}</span>
                          <Badge variant="outline" className="font-bold">
                            +{action.score || 0} points
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No recorded actions
                    </p>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="default" onClick={() => setSelectedLead(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;
