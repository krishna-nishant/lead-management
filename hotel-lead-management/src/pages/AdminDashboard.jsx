import { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/leads/all");
        let updatedLeads = response.data;

        updatedLeads = await Promise.all(
          updatedLeads.map(async (lead) => {
            if (!lead.assignedTo || lead.assignedTo === "unassigned") {
              const assignResponse = await axios.post(
                "http://localhost:5000/api/leads/assign-lead",
                { userId: lead._id } // ✅ Send correct userId
              );
              return { ...lead, assignedTo: assignResponse.data.assignedTo };
            }
            return lead;
          })
        );

        setLeads(updatedLeads);
      } catch (error) {
        console.error("❌ Error fetching leads:", error);
      }
    };

    fetchLeads();
  }, []);

  const filteredLeads = leads.filter((lead) =>
    filter === "all" ? true : lead.category === filter
  );

  const sendAlerts = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/leads/check-score",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      alert(`✅ Alerts Sent: ${data.msg}`);
    } catch (error) {
      console.error("Error sending alerts:", error);
      alert("❌ Failed to send alerts.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard - Leads</h2>
      <div className="mb-4">
        <label className="mr-2 font-semibold">Filter by Category:</label>
        <select
          className="p-2 border rounded"
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="hot">Hot Leads</option>
          <option value="warm">Warm Leads</option>
          <option value="cold">Cold Leads</option>
        </select>
      </div>
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Score</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Assigned To</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeads.map((lead) => (
            <tr key={lead._id} className="text-center">
              <td className="border p-2">{lead.name}</td>
              <td className="border p-2">{lead.email}</td>
              <td className="border p-2 font-bold">{lead.score}</td>
              <td
                className={`border p-2 ${
                  lead.category === "hot"
                    ? "text-red-500"
                    : lead.category === "warm"
                    ? "text-yellow-500"
                    : "text-blue-500"
                }`}
              >
                {lead.category}
              </td>
              <td className="border p-2">{lead.assignedTo || "Unassigned"}</td>
              <td className="border p-2">
                <button
                  className="bg-blue-500 text-white px-4 py-1 rounded"
                  onClick={() => setSelectedLead(lead)}
                >
                  View Score Breakdown
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="bg-blue-500 text-white px-4 py-1 rounded mx-4 my-4"
        onClick={sendAlerts}
      >
        Send Alerts
      </button>

      {/* ✅ Score Breakdown Modal */}
      {selectedLead && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Score Breakdown</h3>
            <p>
              <strong>Name:</strong> {selectedLead.name}
            </p>
            <p>
              <strong>Email:</strong> {selectedLead.email}
            </p>
            <p>
              <strong>Total Score:</strong> {selectedLead.score}
            </p>
            <hr className="my-2" />
            <h4 className="font-semibold">Breakdown:</h4>
            <ul className="list-disc pl-5">
              {selectedLead.actions.length > 0 ? (
                selectedLead.actions.map((action, index) => (
                  <li key={index}>
                    {action.action} →{" "}
                    <span className="font-bold">+{action.score || 0}</span>{" "}
                    points
                  </li>
                ))
              ) : (
                <li>No recorded actions</li>
              )}
            </ul>
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setSelectedLead(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
