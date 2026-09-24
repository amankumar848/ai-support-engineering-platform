import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CreateTicket() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other",
    priority: "Medium",
    severity: "Medium"
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/tickets", formData);

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create Support Ticket</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter ticket title"
            required
          />
        </div>

        <div>
          <label>Description</label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your problem"
            rows="6"
            required
          />
        </div>

        <div>
          <label>Category</label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="Technical">Technical</option>
            <option value="Payment">Payment</option>
            <option value="Account">Account</option>
            <option value="Bug">Bug</option>
            <option value="Feature Request">
              Feature Request
            </option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label>Priority</label>

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div>
          <label>Severity</label>

          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Ticket"}
        </button>
      </form>
    </div>
  );
}

export default CreateTicket;