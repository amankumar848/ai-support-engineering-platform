
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const response = await api.get("/tickets", {
        params: {
          page,
          limit: 10,
        },
      });

      setTickets(response.data.tickets || []);

      setPagination(
        response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (error) {
      console.error(
        "Fetch tickets error:",
        error?.response?.data || error?.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page]);

  const getStatusStyles = (status) => {
    switch (status) {
      case "OPEN":
        return {
          badge: "border-blue-200 bg-blue-50 text-blue-700",
          dot: "bg-blue-500",
        };

      case "IN_PROGRESS":
        return {
          badge: "border-amber-200 bg-amber-50 text-amber-700",
          dot: "bg-amber-500 animate-pulse",
        };

      case "WAITING_FOR_CUSTOMER":
        return {
          badge: "border-purple-200 bg-purple-50 text-purple-700",
          dot: "bg-purple-500",
        };

      case "RESOLVED":
        return {
          badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
          dot: "bg-emerald-500",
        };

      case "CLOSED":
        return {
          badge: "border-gray-200 bg-gray-100 text-gray-600",
          dot: "bg-gray-400",
        };

      default:
        return {
          badge: "border-gray-200 bg-gray-100 text-gray-600",
          dot: "bg-gray-400",
        };
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "Critical":
        return "text-red-600";

      case "High":
        return "text-orange-600";

      case "Medium":
        return "text-amber-600";

      case "Low":
        return "text-emerald-600";

      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-8 text-gray-900 sm:px-6 lg:px-8">
      {/* =========================================================
          DECORATIVE BACKGROUND
      ========================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 animate-pulse rounded-full bg-indigo-200/30 blur-3xl" />

        <div
          className="absolute -right-32 top-20 h-80 w-80 animate-pulse rounded-full bg-violet-200/30 blur-3xl"
          style={{ animationDelay: "1s" }}
        />

        <div
          className="absolute bottom-0 left-1/3 h-72 w-72 animate-pulse rounded-full bg-cyan-200/20 blur-3xl"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* =========================================================
            HEADER
        ========================================================= */}

        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="animate-[fadeIn_0.6s_ease-out]">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

              <span className="text-xs font-semibold text-gray-600">
                Support Center
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              Welcome back
              <span className="ml-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
                👋
              </span>
            </h1>

            <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500 sm:text-base">
              Manage your support requests and get help from our team.
            </p>
          </div>

          {/* CREATE TICKET BUTTON */}

          <Link to="/create-ticket" className="group">
            <button className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-300 active:translate-y-0 sm:w-auto">
              {/* Button shine */}

              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

              <span className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 text-lg transition-transform duration-300 group-hover:rotate-90">
                +
              </span>

              <span className="relative">Create Ticket</span>

              <span className="relative text-base transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>
          </Link>
        </div>

        {/* =========================================================
            SMALL INTRO CARD
        ========================================================= */}

        <div className="mb-8 overflow-hidden rounded-3xl border border-indigo-100 bg-white/80 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl text-white shadow-lg shadow-indigo-200">
              🎫
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Your Support Requests
              </h2>

              <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                View your existing tickets or create a new request whenever
                you need assistance.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================
            TICKETS SECTION
        ========================================================= */}

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              My Tickets
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Your recent support requests
            </p>
          </div>

          {!loading && tickets.length > 0 && (
            <div className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-500 shadow-sm">
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* =========================================================
            LOADING
        ========================================================= */}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-4 h-4 w-24 rounded bg-gray-200" />

                    <div className="h-6 w-2/3 rounded bg-gray-200" />

                    <div className="mt-3 h-4 w-full rounded bg-gray-100" />

                    <div className="mt-2 h-4 w-4/5 rounded bg-gray-100" />
                  </div>

                  <div className="h-10 w-28 rounded-xl bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          /* =======================================================
             EMPTY STATE
          ======================================================= */

          <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
            {/* Decorative circles */}

            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-100/60 blur-2xl transition-transform duration-700 group-hover:scale-150" />

            <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-violet-100/60 blur-2xl transition-transform duration-700 group-hover:scale-150" />

            <div className="relative">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-3xl shadow-xl shadow-indigo-200 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                🎫
              </div>

              <h2 className="text-2xl font-black text-gray-900">
                No tickets yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                You haven't created any support requests yet. If you need
                assistance, create your first ticket.
              </p>

              <Link to="/create-ticket" className="inline-block">
                <button className="mt-7 rounded-xl bg-indigo-50 px-6 py-3 text-sm font-bold text-indigo-700 transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-100 hover:shadow-lg">
                  Create Your First Ticket →
                </button>
              </Link>
            </div>
          </div>
        ) : (
          /* =======================================================
             TICKET CARDS
          ======================================================= */

          <div className="space-y-4">
            {tickets.map((ticket, index) => {
              const statusStyles = getStatusStyles(ticket.status);

              return (
                <div
                  key={ticket._id}
                  className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${
                      index * 0.08
                    }s both`,
                  }}
                >
                  {/* Top gradient line */}

                  <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Hover glow */}

                  <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-indigo-100/40 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative p-5 sm:p-6">
                    {/* TOP ROW */}

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="min-w-0 flex-1">
                        {/* Badges */}

                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                            #{ticket._id.slice(-6).toUpperCase()}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles.badge}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusStyles.dot}`}
                            />

                            {ticket.status.replaceAll("_", " ")}
                          </span>
                        </div>

                        {/* TITLE */}

                        <h3 className="text-lg font-bold text-gray-900 transition-colors duration-300 group-hover:text-indigo-700 sm:text-xl">
                          {ticket.title}
                        </h3>

                        {/* DATE */}

                        <p className="mt-1 text-xs text-gray-400">
                          Created{" "}
                          {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {/* VIEW BUTTON */}

                      <Link
                        to={`/tickets/${ticket._id}`}
                        className="shrink-0"
                      >
                        <button className="group/button flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow-md sm:w-auto">
                          View Ticket

                          <span className="transition-transform duration-300 group-hover/button:translate-x-1">
                            →
                          </span>
                        </button>
                      </Link>
                    </div>

                    {/* DESCRIPTION */}

                    <p className="mt-5 line-clamp-2 text-sm leading-6 text-gray-600">
                      {ticket.description}
                    </p>

                    {/* INFO */}

                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
                      {/* CATEGORY */}

                      <div className="rounded-xl bg-gray-50 px-3 py-2 transition-colors duration-300 group-hover:bg-indigo-50">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">
                          Category
                        </span>

                        <span className="mt-0.5 block text-xs font-semibold text-gray-700">
                          {ticket.category}
                        </span>
                      </div>

                      {/* PRIORITY */}

                      <div className="rounded-xl bg-gray-50 px-3 py-2 transition-colors duration-300 group-hover:bg-indigo-50">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">
                          Priority
                        </span>

                        <span
                          className={`mt-0.5 block text-xs font-bold ${getPriorityStyles(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* =========================================================
            PAGINATION
        ========================================================= */}

        {!loading && tickets.length > 0 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
            <div className="text-xs text-gray-500">
              Page{" "}
              <span className="font-bold text-gray-800">
                {pagination.currentPage}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-800">
                {pagination.totalPages || 1}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                disabled={!pagination.hasPreviousPage}
                onClick={() =>
                  setPage((previousPage) =>
                    Math.max(previousPage - 1, 1)
                  )
                }
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 transition-all duration-300 hover:-translate-x-0.5 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <button
                disabled={!pagination.hasNextPage}
                onClick={() =>
                  setPage((previousPage) => previousPage + 1)
                }
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-300 hover:translate-x-0.5 hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            BOTTOM
        ========================================================= */}

        <div className="mt-10 pb-4 text-center">
          <p className="text-xs text-gray-400">
            Need help? Create a ticket and our support team will assist you.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

