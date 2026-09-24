import { useEffect, useState } from "react";
import api from "../services/api";

function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const response = await api.get("/tickets/analytics");

      setAnalytics(response.data);
    } catch (error) {
      console.error(
        "Fetch analytics error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <p>Loading analytics...</p>;
  }

  if (!analytics) {
    return <p>Unable to load analytics.</p>;
  }


return (
  <div className="space-y-6">

    {/* ================= METRIC CARDS ================= */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

      {/* Total */}
      <div className="group relative overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 to-transparent p-5 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/40 hover:shadow-lg hover:shadow-indigo-500/10">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl transition group-hover:bg-indigo-500/20" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
            Total Tickets
          </p>

          <p className="mt-3 text-4xl font-bold text-white">
            {analytics.totalTickets}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            All support requests
          </p>
        </div>
      </div>

      {/* Open */}
      <div className="group relative overflow-hidden rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-transparent p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl transition group-hover:bg-blue-500/20" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
            Open Tickets
          </p>

          <p className="mt-3 text-4xl font-bold text-white">
            {analytics.openTickets}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Awaiting resolution
          </p>
        </div>
      </div>

      {/* In Progress */}
      <div className="group relative overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 to-transparent p-5 transition duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/10">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl transition group-hover:bg-amber-500/20" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
            In Progress
          </p>

          <p className="mt-3 text-4xl font-bold text-white">
            {analytics.inProgressTickets}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Currently being handled
          </p>
        </div>
      </div>

      {/* Critical */}
      <div className="group relative overflow-hidden rounded-2xl border border-red-400/20 bg-gradient-to-br from-red-500/10 to-transparent p-5 transition duration-300 hover:-translate-y-1 hover:border-red-400/40 hover:shadow-lg hover:shadow-red-500/10">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-500/10 blur-2xl transition group-hover:bg-red-500/20" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-300">
            Critical Tickets
          </p>

          <p className="mt-3 text-4xl font-bold text-white">
            {analytics.criticalTickets}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Requires immediate attention
          </p>
        </div>
      </div>

      {/* Resolved */}
      <div className="group relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/10">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/20" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Resolved
          </p>

          <p className="mt-3 text-4xl font-bold text-white">
            {analytics.resolvedTickets}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Successfully resolved
          </p>
        </div>
      </div>

      {/* Closed */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-400/20 bg-gradient-to-br from-slate-500/10 to-transparent p-5 transition duration-300 hover:-translate-y-1 hover:border-slate-300/30 hover:shadow-lg hover:shadow-slate-500/10">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-500/10 blur-2xl transition group-hover:bg-slate-500/20" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Closed
          </p>

          <p className="mt-3 text-4xl font-bold text-white">
            {analytics.closedTickets}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Completed support lifecycle
          </p>
        </div>
      </div>

      {/* Overdue */}
      <div className="group relative overflow-hidden rounded-2xl border border-orange-400/20 bg-gradient-to-br from-orange-500/10 to-transparent p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-400/40 hover:shadow-lg hover:shadow-orange-500/10">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl transition group-hover:bg-orange-500/20" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-300">
            Overdue Tickets
          </p>

          <p className="mt-3 text-4xl font-bold text-white">
            {analytics.overdueTickets}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Past SLA deadline
          </p>
        </div>
      </div>

    </div>


    {/* ================= BREAKDOWN CARDS ================= */}
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

      {/* Priority */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl transition hover:border-indigo-400/20">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Distribution
          </p>

          <h3 className="mt-1 text-lg font-bold text-white">
            Tickets by Priority
          </h3>
        </div>

        <div className="space-y-3">
          {analytics.byPriority?.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-3 transition hover:border-indigo-400/20 hover:bg-white/[0.04]"
            >
              <span className="text-sm text-slate-400">
                {item._id}
              </span>

              <span className="rounded-lg bg-indigo-500/10 px-3 py-1 text-sm font-bold text-indigo-300">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>


      {/* Category */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl transition hover:border-violet-400/20">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
            Distribution
          </p>

          <h3 className="mt-1 text-lg font-bold text-white">
            Tickets by Category
          </h3>
        </div>

        <div className="space-y-3">
          {analytics.byCategory?.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-3 transition hover:border-violet-400/20 hover:bg-white/[0.04]"
            >
              <span className="text-sm text-slate-400">
                {item._id}
              </span>

              <span className="rounded-lg bg-violet-500/10 px-3 py-1 text-sm font-bold text-violet-300">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>


      {/* Status */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl transition hover:border-cyan-400/20">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Distribution
          </p>

          <h3 className="mt-1 text-lg font-bold text-white">
            Tickets by Status
          </h3>
        </div>

        <div className="space-y-3">
          {analytics.byStatus?.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-3 transition hover:border-cyan-400/20 hover:bg-white/[0.04]"
            >
              <span className="text-sm text-slate-400">
                {item._id}
              </span>

              <span className="rounded-lg bg-cyan-500/10 px-3 py-1 text-sm font-bold text-cyan-300">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>

  </div>
);


}

export default AdminAnalytics;