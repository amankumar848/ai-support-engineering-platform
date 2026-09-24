import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import AdminAnalytics from "../components/adminAnalytics";
import EngineerAnalytics from "../components/engineerAnalytics";

function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [engineers, setEngineers] = useState([]);

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
  const [assigningTicket, setAssigningTicket] =
    useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: 10
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (status) {
        params.status = status;
      }

      if (priority) {
        params.priority = priority;
      }

      if (severity) {
        params.severity = severity;
      }

      if (category) {
        params.category = category;
      }

      const response = await api.get(
        "/tickets",
        {
          params
        }
      );

      setTickets(
        response.data.tickets || []
      );

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
        "Fetch admin tickets error:",
        error.response?.data ||
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchEngineers = async () => {
    try {
      const response = await api.get(
        "/users/engineers"
      );

      setEngineers(
        response.data.engineers || []
      );
    } catch (error) {
      console.error(
        "Fetch engineers error:",
        error.response?.data ||
          error.message
      );
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [
    page,
    search,
    status,
    priority,
    severity,
    category
  ]);

  useEffect(() => {
    fetchEngineers();
  }, []);

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

  const handleAssign = async (
    ticketId,
    engineerId
  ) => {
    if (!engineerId) {
      return;
    }

    try {
      setAssigningTicket(ticketId);

      await api.put(
        `/tickets/${ticketId}`,
        {
          assignedEngineer: engineerId
        }
      );

      await fetchTickets();
    } catch (error) {
      console.error(
        "Assign ticket error:",
        error.response?.data ||
          error.message
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
      new Date(ticket.slaDueAt).getTime() <
        Date.now()
    ) {
      return "OVERDUE";
    }

    return "WITHIN SLA";
  };

  const getSlaClass = (ticket) => {
    const slaStatus =
      getSlaStatus(ticket);

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

    return new Date(
      date
    ).toLocaleString();
  };

 return (
  <div className="min-h-screen bg-[#070b14] text-white relative overflow-hidden">
    {/* Ambient background */}
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-500/5 blur-3xl" />
    </div>

    <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* ================= HEADER ================= */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Admin Control Center
            </span>

            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            <span className="text-xs text-slate-500">
              Operations Online
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Support Operations
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Monitor tickets, SLAs, assignments and engineering workload
            from one central workspace.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Total Tickets
          </p>

          <p className="mt-1 text-3xl font-bold text-white">
            {pagination.totalTickets}
          </p>
        </div>
      </div>

      {/* ================= ANALYTICS ================= */}
      <div className="space-y-8">

  {/* ================= SUPPORT ANALYTICS ================= */}
  <section>
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
        Overview
      </p>

      <h2 className="mt-1 text-2xl font-bold text-white">
        Support Analytics
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Real-time overview of support operations.
      </p>
    </div>

    <AdminAnalytics />
  </section>


  {/* ================= ENGINEER WORKLOAD ================= */}
  <section>
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
        Engineering
      </p>

      <h2 className="mt-1 text-2xl font-bold text-white">
        Engineer Workload
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Monitor engineer assignments and workload distribution.
      </p>
    </div>

    <EngineerAnalytics />
  </section>

</div>

      {/* ================= TICKET MANAGEMENT ================= */}
      <section className="mt-8">

        {/* Section header */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Operations
            </p>

            <h2 className="mt-1 text-2xl font-bold text-white">
              Ticket Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search, filter and assign support tickets.
            </p>
          </div>

          <div className="w-fit rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2">
            <span className="text-xs text-slate-500">
              Total
            </span>

            <span className="ml-2 font-bold text-white">
              {pagination.totalTickets}
            </span>
          </div>
        </div>

        {/* ================= FILTER PANEL ================= */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-5">

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                🔎
              </span>

              <input
                type="text"
                placeholder="Search tickets..."
                value={searchInput}
                onChange={(e) =>
                  setSearchInput(e.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500/60 focus:bg-black/30 focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20 active:translate-y-0"
            >
              Search
            </button>
          </form>

          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300 outline-none transition focus:border-indigo-500/50"
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
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300 outline-none transition focus:border-indigo-500/50"
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
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300 outline-none transition focus:border-indigo-500/50"
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
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300 outline-none transition focus:border-indigo-500/50"
            >
              <option value="">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Payment">Payment</option>
              <option value="Account">Account</option>
              <option value="Bug">Bug</option>
              <option value="Feature Request">
                Feature Request
              </option>
              <option value="Other">Other</option>
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-400 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* ================= TICKETS ================= */}
        <div className="mt-5 space-y-4">

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.035] px-6 py-16 text-center backdrop-blur-xl">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-400" />

              <p className="text-sm text-slate-400">
                Loading support tickets...
              </p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-2xl">
                🎫
              </div>

              <h3 className="mt-4 text-lg font-semibold text-white">
                No tickets found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                No tickets match your current filters.
              </p>
            </div>
          ) : (
            tickets.map((ticket) => {

              const statusStyles = {
                OPEN:
                  "border-blue-400/20 bg-blue-500/10 text-blue-300",
                IN_PROGRESS:
                  "border-amber-400/20 bg-amber-500/10 text-amber-300",
                WAITING_FOR_CUSTOMER:
                  "border-purple-400/20 bg-purple-500/10 text-purple-300",
                RESOLVED:
                  "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
                CLOSED:
                  "border-slate-400/20 bg-slate-500/10 text-slate-300"
              };

              const priorityStyles = {
                Low: "text-slate-400",
                Medium: "text-blue-300",
                High: "text-orange-300",
                Critical: "text-red-300"
              };

              const severityStyles = {
                Low: "text-slate-400",
                Medium: "text-blue-300",
                High: "text-orange-300",
                Critical: "text-red-300"
              };

              return (
                <div
                  key={ticket._id}
                  className="group rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-indigo-400/20 hover:bg-white/[0.05] hover:shadow-indigo-500/5 sm:p-6"
                >

                  {/* Ticket top */}
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-2">

                        <span
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                            statusStyles[ticket.status] ||
                            "border-white/10 bg-white/5 text-slate-300"
                          }`}
                        >
                          {ticket.status}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-slate-400">
                          {ticket.category}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold leading-7 text-white transition group-hover:text-indigo-200">
                        {ticket.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">
                        {ticket.description}
                      </p>

                      <p className="mt-3 text-xs text-slate-600">
                        Created{" "}
                        {new Date(
                          ticket.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>

                    {/* Ticket ID */}
                    <div className="shrink-0 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-slate-600">
                        Ticket ID
                      </p>

                      <p className="mt-1 font-mono text-xs text-slate-400">
                        #{ticket._id.slice(-8)}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="mt-5 grid grid-cols-2 gap-3 border-y border-white/5 py-4 sm:grid-cols-4">

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-600">
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

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-600">
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

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-600">
                        Customer
                      </p>

                      <p className="mt-1 truncate text-sm font-medium text-slate-300">
                        {ticket.customer?.name ||
                          "Unknown"}
                      </p>

                      <p className="truncate text-xs text-slate-600">
                        {ticket.customer?.email || ""}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-600">
                        Engineer
                      </p>

                      <p className="mt-1 truncate text-sm font-medium text-slate-300">
                        {ticket.assignedEngineer?.name ||
                          "Unassigned"}
                      </p>
                    </div>
                  </div>

                  {/* Assignment + SLA */}
                  <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">

                    {/* Assignment */}
                    <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Assignment
                        </span>

                        {assigningTicket === ticket._id && (
                          <span className="text-xs text-indigo-400">
                            Updating...
                          </span>
                        )}
                      </div>

                      <select
                        value={
                          ticket.assignedEngineer
                            ? ticket.assignedEngineer._id
                            : ""
                        }
                        onChange={(e) =>
                          handleAssign(
                            ticket._id,
                            e.target.value
                          )
                        }
                        disabled={
                          assigningTicket === ticket._id
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#0b101c] px-4 py-3 text-sm text-slate-300 outline-none transition hover:border-white/20 focus:border-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">
                          Unassigned
                        </option>

                        {engineers.map((engineer) => (
                          <option
                            key={engineer._id}
                            value={engineer._id}
                          >
                            {engineer.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* SLA */}
                    <div
                      className={`rounded-2xl border p-4 lg:min-w-[270px] ${(() => {
                        const sla = getSlaStatus(ticket);

                        if (sla === "OVERDUE") {
                          return "border-red-500/20 bg-red-500/5";
                        }

                        if (sla === "COMPLETED") {
                          return "border-emerald-500/20 bg-emerald-500/5";
                        }

                        if (sla === "WITHIN SLA") {
                          return "border-cyan-500/20 bg-cyan-500/5";
                        }

                        return "border-white/5 bg-black/20";
                      })()}`}
                    >
                      <p className="text-[10px] uppercase tracking-wider text-slate-600">
                        Service Level
                      </p>

                      <p
                        className={`mt-1 text-sm font-bold ${
                          getSlaStatus(ticket) ===
                          "OVERDUE"
                            ? "text-red-300"
                            : getSlaStatus(ticket) ===
                              "COMPLETED"
                            ? "text-emerald-300"
                            : getSlaStatus(ticket) ===
                              "WITHIN SLA"
                            ? "text-cyan-300"
                            : "text-slate-400"
                        }`}
                      >
                        {getSlaStatus(ticket)}
                      </p>

                      {ticket.slaDueAt && (
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          Deadline
                          <br />
                          <span className="text-slate-400">
                            {formatSlaDate(
                              ticket.slaDueAt
                            )}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">

                    <span className="text-xs text-slate-600">
                      Support ticket
                    </span>

                    <Link
                      to={`/tickets/${ticket._id}`}
                      className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-2.5 text-sm font-semibold text-indigo-300 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-indigo-500/20 hover:text-indigo-200"
                    >
                      View Ticket →
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ================= PAGINATION ================= */}
        {!loading && tickets.length > 0 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-4 sm:flex-row">

            <button
              disabled={!pagination.hasPreviousPage}
              onClick={() =>
                setPage((previousPage) =>
                  Math.max(previousPage - 1, 1)
                )
              }
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto"
            >
              ← Previous
            </button>

            <div className="text-sm text-slate-500">
              Page{" "}
              <span className="font-semibold text-white">
                {pagination.currentPage}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-white">
                {pagination.totalPages || 1}
              </span>
            </div>

            <button
              disabled={!pagination.hasNextPage}
              onClick={() =>
                setPage(
                  (previousPage) =>
                    previousPage + 1
                )
              }
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto"
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </div>
  </div>
);
}

export default AdminDashboard;

