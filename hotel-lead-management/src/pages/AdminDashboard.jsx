import { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/leads/all");
        let updatedLeads = response.data;

        // Assign leads if not assigned
        updatedLeads = await Promise.all(
          updatedLeads.map(async (lead) => {
            if (!lead.assignedTo || lead.assignedTo === "unassigned") {
              const assignResponse = await axios.post("http://localhost:5000/api/leads/assign-lead", {
                email: lead.email
              });
              return { ...lead, assignedTo: assignResponse.data.assignedTo };
            }
            return lead;
          })
        );

        setLeads(updatedLeads);
      } catch (error) {
        console.error("Error fetching leads:", error);
      }
    };

    fetchLeads();
  }, []);

  const filteredLeads = leads.filter((lead) =>
    filter === "all" ? true : lead.category === filter
  );

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
              <td className={`border p-2 ${lead.category === "hot" ? "text-red-500" : lead.category === "warm" ? "text-yellow-500" : "text-blue-500"}`}>
                {lead.category}
              </td>
              <td className="border p-2">{lead.assignedTo || "Unassigned"}</td>
              <td className="border p-2">
                <button className="bg-blue-500 text-white px-4 py-1 rounded">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
