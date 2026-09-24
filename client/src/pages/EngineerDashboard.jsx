
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function EngineerDashboard() {
  const [tickets, setTickets] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [severity, setSeverity] = useState("");
  const [category, setCategory] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalTickets: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const [loading, setLoading] = useState(true);
  const [assigningTicket, setAssigningTicket] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: 10
      };

      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (severity) params.severity = severity;
      if (category) params.category = category;

      const response = await api.get("/tickets", {
        params
      });

      setTickets(response.data.tickets || []);

      setPagination(
        response.data.pagination || {
          currentPage: 1,
          itemsPerPage: 10,
          totalTickets: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      );
    } catch (error) {
      console.error(
        "Fetch engineer tickets error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, search, status, priority, severity, category]);

  const handleSearch = (e) => {
    e.preventDefault();

    setPage(1);
    setSearch(searchInput);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPriority("");
    setSeverity("");
    setCategory("");
    setPage(1);
  };

  const handleAssignToMe = async (ticketId) => {
    try {
      setAssigningTicket(ticketId);

      await api.put(`/tickets/${ticketId}/assign`);

      await fetchTickets();
    } catch (error) {
      console.error(
        "Assign ticket error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to assign ticket"
      );
    } finally {
      setAssigningTicket(null);
    }
  };

  const getSlaStatus = (ticket) => {
    if (!ticket.slaDueAt) {
      return "NO SLA";
    }

    if (
      ["RESOLVED", "CLOSED"].includes(
        ticket.status
      )
    ) {
      return "COMPLETED";
    }

    if (
      ticket.isOverdue ||
      new Date(ticket.slaDueAt).getTime() < Date.now()
    ) {
      return "OVERDUE";
    }

    return "WITHIN SLA";
  };

  const getSlaClass = (ticket) => {
    const slaStatus = getSlaStatus(ticket);

    if (slaStatus === "OVERDUE") {
      return "sla-overdue";
    }

    if (slaStatus === "COMPLETED") {
      return "sla-completed";
    }

    if (slaStatus === "WITHIN SLA") {
      return "sla-within";
    }

    return "sla-none";
  };

  const formatSlaDate = (date) => {
    if (!date) {
      return "Not set";
    }

    return new Date(date).toLocaleString();
  };

  return (
  <div className="min-h-screen bg-[#080c16] px-4 py-6 text-white sm:px-6 lg:px-8">
    {/* Ambient background */}
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-500/5 blur-[120px]" />
    </div>

    <div className="relative mx-auto max-w-7xl">

      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
            Engineering Workspace
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Engineer Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Manage assigned tickets, monitor SLA deadlines, and pick up
            unassigned tickets.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Visible Tickets
          </p>
          <p className="mt-1 text-2xl font-bold text-white">
            {pagination.totalTickets}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-7 rounded-2xl border border-white/10 bg-[#0d1322]/80 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-5">

        <form
          onSubmit={handleSearch}
          className="mb-4 flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search tickets by title or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#080d18] py-3 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/20"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-3">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="min-w-[150px] rounded-xl border border-white/10 bg-[#080d18] px-3 py-2.5 text-xs text-slate-300 outline-none transition focus:border-indigo-500/50"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_FOR_CUSTOMER">
              Waiting for Customer
            </option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="min-w-[150px] rounded-xl border border-white/10 bg-[#080d18] px-3 py-2.5 text-xs text-slate-300 outline-none transition focus:border-indigo-500/50"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <select
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value);
              setPage(1);
            }}
            className="min-w-[150px] rounded-xl border border-white/10 bg-[#080d18] px-3 py-2.5 text-xs text-slate-300 outline-none transition focus:border-indigo-500/50"
          >
            <option value="">All Severities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="min-w-[150px] rounded-xl border border-white/10 bg-[#080d18] px-3 py-2.5 text-xs text-slate-300 outline-none transition focus:border-indigo-500/50"
          >
            <option value="">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Payment">Payment</option>
            <option value="Account">Account</option>
            <option value="Bug">Bug</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Other">Other</option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-slate-400 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Tickets */}
      <div>
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-white/10 bg-[#0d1322]/70">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-400" />
              <p className="text-sm text-slate-400">
                Loading tickets...
              </p>
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d1322]/60 px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
              ◇
            </div>

            <h3 className="text-lg font-semibold text-white">
              No tickets found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              No tickets match your current search or filter settings.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const slaStatus = getSlaStatus(ticket);

              const isAssignedToMe =
                ticket.assignedEngineer &&
                typeof ticket.assignedEngineer === "object" &&
                ticket.assignedEngineer._id;

              const statusStyles = {
                OPEN:
                  "border-blue-400/20 bg-blue-400/10 text-blue-300",
                IN_PROGRESS:
                  "border-violet-400/20 bg-violet-400/10 text-violet-300",
                WAITING_FOR_CUSTOMER:
                  "border-amber-400/20 bg-amber-400/10 text-amber-300",
                RESOLVED:
                  "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
                CLOSED:
                  "border-slate-400/20 bg-slate-400/10 text-slate-400",
              };

              const priorityStyles = {
                Low: "text-slate-400",
                Medium: "text-blue-400",
                High: "text-orange-400",
                Critical: "text-red-400",
              };

              const severityStyles = {
                Low: "text-slate-400",
                Medium: "text-yellow-400",
                High: "text-orange-400",
                Critical: "text-red-400",
              };

              const slaStyles = {
                OVERDUE:
                  "border-red-500/20 bg-red-500/[0.06] text-red-300",
                COMPLETED:
                  "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300",
                "WITHIN SLA":
                  "border-cyan-500/20 bg-cyan-500/[0.06] text-cyan-300",
              };

              return (
                <div
                  key={ticket._id}
                  className="group rounded-2xl border border-white/10 bg-[#0d1322]/80 p-5 shadow-xl shadow-black/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-400/20 hover:bg-[#10182a] hover:shadow-2xl hover:shadow-indigo-500/[0.05] sm:p-6"
                >
                  {/* Ticket header */}
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                          #{ticket._id.slice(-6).toUpperCase()}
                        </span>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                            statusStyles[ticket.status] ||
                            "border-white/10 bg-white/5 text-slate-400"
                          }`}
                        >
                          {ticket.status.replaceAll("_", " ")}
                        </span>
                      </div>

                      <h3 className="truncate text-lg font-semibold text-white transition-colors group-hover:text-indigo-200 sm:text-xl">
                        {ticket.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-600">
                        Created{" "}
                        {new Date(ticket.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        {ticket.category}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-5 line-clamp-2 text-sm leading-6 text-slate-400">
                    {ticket.description}
                  </p>

                  {/* Meta */}
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                        Priority
                      </p>
                      <p
                        className={`mt-1 text-sm font-semibold ${
                          priorityStyles[ticket.priority] ||
                          "text-slate-300"
                        }`}
                      >
                        {ticket.priority}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                        Severity
                      </p>
                      <p
                        className={`mt-1 text-sm font-semibold ${
                          severityStyles[ticket.severity] ||
                          "text-slate-300"
                        }`}
                      >
                        {ticket.severity}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                        Assigned
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-300">
                        {ticket.assignedEngineer
                          ? ticket.assignedEngineer.name
                          : "Unassigned"}
                      </p>
                    </div>

                    <div
                      className={`rounded-xl border p-3 ${
                        slaStyles[slaStatus] ||
                        "border-white/5 bg-white/[0.02] text-slate-400"
                      }`}
                    >
                      <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">
                        SLA
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {slaStatus}
                      </p>
                    </div>
                  </div>

                  {/* SLA deadline */}
                  {ticket.slaDueAt && (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-white/5 bg-black/10 px-4 py-3">
                      <span className="text-xs text-slate-500">
                        SLA Deadline
                      </span>

                      <span className="text-xs font-medium text-slate-300">
                        {formatSlaDate(ticket.slaDueAt)}
                      </span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-5 flex flex-col gap-3 border-t border-white/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                      to={`/tickets/${ticket._id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-slate-300 transition-all duration-300 hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white"
                    >
                      View Ticket →
                    </Link>

                    <div className="flex flex-wrap items-center gap-3">
                      {!ticket.assignedEngineer && (
                        <button
                          onClick={() =>
                            handleAssignToMe(ticket._id)
                          }
                          disabled={
                            assigningTicket === ticket._id
                          }
                          className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {assigningTicket === ticket._id
                            ? "Assigning..."
                            : "Assign to Me"}
                        </button>
                      )}

                      {isAssignedToMe && (
                        <span className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300">
                          ✓ Assigned to you
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && tickets.length > 0 && (
        <div className="mt-7 flex items-center justify-between rounded-2xl border border-white/10 bg-[#0d1322]/70 p-3 backdrop-blur-xl sm:px-5">
          <button
            disabled={!pagination.hasPreviousPage}
            onClick={() =>
              setPage((previousPage) =>
                Math.max(previousPage - 1, 1)
              )
            }
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            ← Previous
          </button>

          <span className="text-xs font-medium text-slate-500">
            Page{" "}
            <span className="text-white">
              {pagination.currentPage}
            </span>{" "}
            of{" "}
            <span className="text-white">
              {pagination.totalPages || 1}
            </span>
          </span>

          <button
            disabled={!pagination.hasNextPage}
            onClick={() =>
              setPage(
                (previousPage) => previousPage + 1
              )
            }
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  </div>
);
}

export default EngineerDashboard;