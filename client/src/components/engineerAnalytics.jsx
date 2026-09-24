
import { useEffect, useState } from "react";
import api from "../services/api";

function EngineerAnalytics() {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEngineerAnalytics = async () => {
    try {
      setLoading(true);

      const response = await api.get("/tickets/analytics/engineers");

      setEngineers(response.data.engineers || []);
    } catch (error) {
      console.error(
        "Engineer analytics error:",
        error?.response?.data || error?.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngineerAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
        <p className="text-sm text-slate-400">
          Loading engineer workload...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent p-6">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Team Performance
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Engineer Workload
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Monitor ticket distribution and workload across support engineers.
          </p>
        </div>
      </div>

      {engineers.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-xl">
            👥
          </div>

          <h3 className="text-lg font-semibold text-white">
            No assigned tickets
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Engineer workload will appear here once tickets are assigned.
          </p>
        </div>
      ) : (
        <>
          {/* ENGINEER CARDS */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {engineers.map((engineer) => (
              <div
                key={engineer.engineerId}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-indigo-500/5"
              >
                {/* Glow */}
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl transition group-hover:bg-indigo-500/20" />

                <div className="relative">
                  {/* ENGINEER HEADER */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-lg font-bold text-indigo-300 ring-1 ring-indigo-400/20">
                        {engineer.engineerName
                          ?.charAt(0)
                          ?.toUpperCase() || "E"}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-white">
                          {engineer.engineerName}
                        </h3>

                        <p className="truncate text-xs text-slate-500">
                          {engineer.engineerEmail}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-indigo-300">
                        Total
                      </p>
                      <p className="text-xl font-bold text-white">
                        {engineer.totalTickets}
                      </p>
                    </div>
                  </div>

                  {/* WORKLOAD GRID */}
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-blue-400/10 bg-blue-500/5 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-300">
                        Open
                      </p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        {engineer.openTickets}
                      </p>
                    </div>

                    <div className="rounded-xl border border-amber-400/10 bg-amber-500/5 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                        In Progress
                      </p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        {engineer.inProgressTickets}
                      </p>
                    </div>

                    <div className="rounded-xl border border-violet-400/10 bg-violet-500/5 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-300">
                        Waiting
                      </p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        {engineer.waitingTickets}
                      </p>
                    </div>

                    <div className="rounded-xl border border-emerald-400/10 bg-emerald-500/5 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                        Resolved
                      </p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        {engineer.resolvedTickets}
                      </p>
                    </div>

                    <div className="rounded-xl border border-red-400/10 bg-red-500/5 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-red-300">
                        Critical
                      </p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        {engineer.criticalTickets}
                      </p>
                    </div>

                    <div className="rounded-xl border border-cyan-400/10 bg-cyan-500/5 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                        Active
                      </p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        {Number(engineer.openTickets || 0) +
                          Number(engineer.inProgressTickets || 0) +
                          Number(engineer.waitingTickets || 0)}
                      </p>
                    </div>
                  </div>

                  {/* WORKLOAD BAR */}
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">
                        Current workload
                      </span>

                      <span className="text-xs font-semibold text-indigo-300">
                        {engineer.totalTickets} tickets
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                        style={{
                          width: `${
                            engineer.totalTickets > 0
                              ? Math.min(
                                  100,
                                  ((Number(engineer.openTickets || 0) +
                                    Number(engineer.inProgressTickets || 0) +
                                    Number(engineer.waitingTickets || 0)) /
                                    engineer.totalTickets) *
                                    100
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* COMPACT TABLE */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-xl">
            <div className="border-b border-white/10 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Workload Overview
              </p>

              <h3 className="mt-1 text-lg font-bold text-white">
                Engineer Summary
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Engineer
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Total
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Open
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      In Progress
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Waiting
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Resolved
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Critical
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {engineers.map((engineer) => (
                    <tr
                      key={engineer.engineerId}
                      className="border-b border-white/5 transition hover:bg-white/[0.035]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-sm font-bold text-indigo-300">
                            {engineer.engineerName
                              ?.charAt(0)
                              ?.toUpperCase() || "E"}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-white">
                              {engineer.engineerName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {engineer.engineerEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-white">
                        {engineer.totalTickets}
                      </td>

                      <td className="px-5 py-4 text-sm text-blue-300">
                        {engineer.openTickets}
                      </td>

                      <td className="px-5 py-4 text-sm text-amber-300">
                        {engineer.inProgressTickets}
                      </td>

                      <td className="px-5 py-4 text-sm text-violet-300">
                        {engineer.waitingTickets}
                      </td>

                      <td className="px-5 py-4 text-sm text-emerald-300">
                        {engineer.resolvedTickets}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-red-300">
                        {engineer.criticalTickets}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default EngineerAnalytics;

