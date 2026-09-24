import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../services/api";

const statusStyles = {
  OPEN: "bg-blue-500/10 text-blue-300 border-blue-400/20",
  IN_PROGRESS: "bg-violet-500/10 text-violet-300 border-violet-400/20",
  WAITING_FOR_CUSTOMER:
    "bg-amber-500/10 text-amber-300 border-amber-400/20",
  RESOLVED: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
  CLOSED: "bg-slate-500/10 text-slate-300 border-slate-400/20",
};

const priorityStyles = {
  Low: "text-slate-300 bg-slate-500/10 border-slate-400/20",
  Medium: "text-blue-300 bg-blue-500/10 border-blue-400/20",
  High: "text-amber-300 bg-amber-500/10 border-amber-400/20",
  Critical: "text-red-300 bg-red-500/10 border-red-400/20",
};

const severityStyles = {
  Low: "text-slate-300 bg-slate-500/10 border-slate-400/20",
  Medium: "text-blue-300 bg-blue-500/10 border-blue-400/20",
  High: "text-orange-300 bg-orange-500/10 border-orange-400/20",
  Critical: "text-red-300 bg-red-500/10 border-red-400/20",
};

const actionLabels = {
  CREATED: "Ticket created",
  ASSIGNED: "Ticket assigned",
  STATUS_CHANGED: "Status changed",
  PRIORITY_CHANGED: "Priority changed",
  SEVERITY_CHANGED: "Severity changed",
  CATEGORY_CHANGED: "Category changed",
  RESOLUTION_ADDED: "Resolution added",
  COMMENT_ADDED: "Comment added",
  ATTACHMENT_ADDED: "Attachment added",
};

const actionColors = {
  CREATED: "bg-cyan-400",
  ASSIGNED: "bg-violet-400",
  STATUS_CHANGED: "bg-blue-400",
  PRIORITY_CHANGED: "bg-amber-400",
  SEVERITY_CHANGED: "bg-red-400",
  CATEGORY_CHANGED: "bg-fuchsia-400",
  RESOLUTION_ADDED: "bg-emerald-400",
  COMMENT_ADDED: "bg-indigo-400",
  ATTACHMENT_ADDED: "bg-sky-400",
};

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTimeRemaining(dueAt) {
  if (!dueAt) {
    return {
      text: "N/A",
      percent: 0,
      overdue: false,
    };
  }

  const now = Date.now();
  const due = new Date(dueAt).getTime();
  const diff = due - now;

  if (diff <= 0) {
    return {
      text: "OVERDUE",
      percent: 100,
      overdue: true,
    };
  }

  const totalHours = diff / (1000 * 60 * 60);

  if (totalHours < 1) {
    return {
      text: `${Math.max(1, Math.floor(totalHours * 60))}m`,
      percent: 90,
      overdue: false,
    };
  }

  if (totalHours < 24) {
    return {
      text: `${Math.floor(totalHours)}h ${Math.floor(
        (totalHours % 1) * 60
      )}m`,
      percent: Math.min(95, Math.max(15, 100 - totalHours * 4)),
      overdue: false,
    };
  }

  return {
    text: `${Math.floor(totalHours / 24)}d`,
    percent: Math.min(70, Math.max(5, 100 - totalHours)),
    overdue: false,
  };
}

function getInitials(name = "User") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-400/20 text-violet-300">
        {icon}
      </div>

      <div>
        <h2 className="text-sm font-semibold tracking-wide text-white">
          {title}
        </h2>

        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </label>

      <select
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className="
          w-full rounded-xl border border-[#252d45]
          bg-[#0a0f1d] px-3 py-2.5
          text-sm text-slate-200 outline-none
          transition-all duration-200
          hover:border-violet-500/40
          focus:border-violet-500/70
          focus:ring-2 focus:ring-violet-500/10
          disabled:cursor-not-allowed disabled:opacity-50
        "
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function TicketDetails() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingField, setUpdatingField] = useState("");
  const [comment, setComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponseLoading, setAiResponseLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiSources, setAiSources] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [editedSuggestion, setEditedSuggestion] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const socketRef = useRef(null);
  const commentsEndRef = useRef(null);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const timeRemaining = useMemo(
    () => getTimeRemaining(ticket?.slaDueAt),
    [ticket?.slaDueAt]
  );

  const fetchTicket = async () => {
    const response = await api.get(`/tickets/${id}`);
    setTicket(response.data.ticket || response.data);
  };

  const fetchComments = async () => {
    const response = await api.get(`/comments/${id}`);
    setComments(response.data.comments || response.data || []);
  };

  const fetchActivities = async () => {
    const response = await api.get(`/activities/${id}`);
    setActivities(response.data.activities || response.data || []);
  };

  const fetchAttachments = async () => {
    const response = await api.get(`/attachments/${id}`);
    setAttachments(response.data.attachments || response.data || []);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        await Promise.all([
          fetchTicket(),
          fetchComments(),
          fetchActivities(),
          fetchAttachments(),
        ]);
      } catch (error) {
        console.error("Failed to load ticket:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinTicket", id);
    });

    socket.on("ticketUpdated", (updatedTicket) => {
      if (updatedTicket?._id === id) {
        setTicket(updatedTicket);
      }
    });

    socket.on("newComment", (newComment) => {
      if (newComment?.ticket === id || newComment?.ticket?._id === id) {
        setComments((prev) => {
          const exists = prev.some(
            (item) => item._id === newComment._id
          );

          return exists ? prev : [...prev, newComment];
        });

        setTimeout(() => {
          commentsEndRef.current?.scrollIntoView({
            behavior: "smooth",
          });
        }, 100);
      }
    });

    socket.on("newActivity", (newActivity) => {
      if (
        newActivity?.ticket === id ||
        newActivity?.ticket?._id === id
      ) {
        setActivities((prev) => {
          const exists = prev.some(
            (item) => item._id === newActivity._id
          );

          return exists ? prev : [newActivity, ...prev];
        });
      }
    });

    socket.on("newAttachment", (newAttachment) => {
      if (
        newAttachment?.ticket === id ||
        newAttachment?.ticket?._id === id
      ) {
        setAttachments((prev) => {
          const exists = prev.some(
            (item) => item._id === newAttachment._id
          );

          return exists ? prev : [...prev, newAttachment];
        });
      }
    });

    return () => {
      socket.emit("leaveTicket", id);
      socket.disconnect();
    };
  }, [id]);

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;

    try {
      setUpdatingStatus(true);

      const response = await api.put(`/tickets/${id}`, {
        status: newStatus,
      });

      setTicket(response.data.ticket || response.data);
      await fetchActivities();
    } catch (error) {
      console.error("Status update failed:", error);
      alert(
        error.response?.data?.message || "Failed to update status"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleTicketFieldChange = async (field, value) => {
    try {
      setUpdatingField(field);

      const response = await api.put(`/tickets/${id}`, {
        [field]: value,
      });

      setTicket(response.data.ticket || response.data);
      await fetchActivities();
    } catch (error) {
      console.error(`${field} update failed:`, error);
      alert(
        error.response?.data?.message ||
          `Failed to update ${field}`
      );
    } finally {
      setUpdatingField("");
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (!comment.trim()) return;

    try {
      setCommentLoading(true);

      await api.post(`/comments/${id}`, {
        message: comment.trim(),
      });

      setComment("");
      await Promise.all([fetchComments(), fetchActivities()]);

      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } catch (error) {
      console.error("Comment failed:", error);
      alert(
        error.response?.data?.message || "Failed to add comment"
      );
    } finally {
      setCommentLoading(false);
    }
  };

  const handleAIAnalysis = async () => {
    try {
      setAiLoading(true);

      const response = await api.post(`/ai/analyze/${id}`);

      setAiAnalysis(response.data.analysis || response.data);
      setAiSources(response.data.sources || []);
    } catch (error) {
      console.error("AI analysis failed:", error);

      alert(
        error.response?.data?.message ||
          "AI analysis failed. Please check your API credits."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateAIResponse = async () => {
    try {
      setAiResponseLoading(true);

      const response = await api.post(`/ai/response/${id}`);

      const suggestion =
        response.data.suggestion ||
        response.data.response ||
        "";

      setAiSuggestion(suggestion);
      setEditedSuggestion(suggestion);
    } catch (error) {
      console.error("AI response failed:", error);

      alert(
        error.response?.data?.message ||
          "Failed to generate AI response"
      );
    } finally {
      setAiResponseLoading(false);
    }
  };

  const useAISuggestion = () => {
    if (!editedSuggestion.trim()) return;

    setComment(editedSuggestion);
    setTimeout(() => {
      document
        .getElementById("comment-box")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadingFile(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      await api.post(`/attachments/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSelectedFile(null);

      const fileInput = document.getElementById("ticket-file");
      if (fileInput) {
        fileInput.value = "";
      }

      await Promise.all([fetchAttachments(), fetchActivities()]);
    } catch (error) {
      console.error("Upload failed:", error);

      alert(
        error.response?.data?.message ||
          "File upload failed"
      );
    } finally {
      setUploadingFile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A13] text-white flex items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-violet-300">
            ✦
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-[#070A13] text-white flex items-center justify-center">
        <div className="rounded-2xl border border-red-500/20 bg-[#0F1424] px-8 py-10 text-center">
          <div className="text-4xl mb-4">⚠</div>
          <h2 className="text-xl font-semibold">
            Ticket not found
          </h2>

          <Link
            to="/dashboard"
            className="mt-5 inline-block text-sm text-violet-300 hover:text-violet-200"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const customer = ticket.customer;
  const assignedEngineer = ticket.assignedEngineer;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070A13] text-slate-200">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-cyan-500/8 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-indigo-600/8 blur-[130px]" />

        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Top navigation */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to={
              currentUser.role === "admin"
                ? "/admin"
                : currentUser.role === "engineer"
                ? "/engineer"
                : "/dashboard"
            }
            className="
              group inline-flex w-fit items-center gap-2
              rounded-xl border border-[#20283D]
              bg-[#0B1020]/80 px-4 py-2.5
              text-sm text-slate-400
              transition-all duration-300
              hover:-translate-x-1
              hover:border-violet-500/40
              hover:text-white
            "
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            Back to dashboard
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-slate-500">
                Logged in as
              </p>
              <p className="text-sm font-medium text-white">
                {currentUser.name || "User"}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-sm font-bold text-violet-300">
              {getInitials(currentUser.name)}
            </div>
          </div>
        </div>

        {/* Hero ticket header */}
        <div
          className="
            group relative mb-6 overflow-hidden rounded-3xl
            border border-[#252d45]
            bg-[#0B1020]/90
            p-6 shadow-2xl shadow-black/20
            transition-all duration-500
            hover:border-violet-500/30
          "
        >
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/10 blur-[90px] transition-all duration-700 group-hover:bg-violet-500/20" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-lg border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 font-mono text-xs text-violet-300">
                  #{ticket._id?.slice(-8).toUpperCase()}
                </span>

                <span className="rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                  AI SUPPORT
                </span>
              </div>

              <h1 className="max-w-4xl text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                {ticket.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                <span>
                  Created {formatShortDate(ticket.createdAt)}
                </span>

                <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:block" />

                <span>
                  Customer:{" "}
                  <span className="text-slate-300">
                    {customer?.name || "Unknown"}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <div
                className={`
                  inline-flex items-center justify-center gap-2
                  rounded-full border px-4 py-2
                  text-xs font-bold uppercase tracking-wider
                  ${statusStyles[ticket.status] || statusStyles.OPEN}
                `}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    ticket.status === "IN_PROGRESS"
                      ? "animate-pulse bg-violet-400"
                      : "bg-current"
                  }`}
                />
                {ticket.status?.replaceAll("_", " ")}
              </div>

              <select
                value={ticket.status}
                onChange={handleStatusChange}
                disabled={updatingStatus}
                className="
                  rounded-xl border border-[#252d45]
                  bg-[#070A13] px-4 py-2.5
                  text-xs font-medium text-slate-300
                  outline-none transition-all duration-200
                  hover:border-violet-500/40
                  focus:border-violet-500/60
                "
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="WAITING_FOR_CUSTOMER">
                  WAITING FOR CUSTOMER
                </option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
          {/* Main column */}
          <div className="space-y-6">
            {/* Description */}
            <section
              className="
                group rounded-2xl border border-[#20283D]
                bg-[#0F1424]/90 p-6
                transition-all duration-300
                hover:-translate-y-1
                hover:border-violet-500/25
                hover:shadow-[0_15px_50px_rgba(124,58,237,0.08)]
              "
            >
              <SectionTitle
                icon="◈"
                title="Problem Description"
                subtitle="Customer reported issue"
              />

              <div className="rounded-xl border border-[#20283D] bg-[#090E1A] p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                  {ticket.description}
                </p>
              </div>
            </section>

            {/* AI Analysis */}
            {currentUser?.role !== "customer" && (
            <section
              className="
                relative overflow-hidden rounded-2xl
                border border-violet-500/20
                bg-gradient-to-br from-[#17132d] via-[#10152a] to-[#0F1424]
                p-6 shadow-[0_0_50px_rgba(124,58,237,0.06)]
              "
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-600/15 blur-[90px]" />

              <div className="relative">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <SectionTitle
                    icon="✦"
                    title="AI Support Intelligence"
                    subtitle="Automated ticket analysis"
                  />

                  <button
                    onClick={handleAIAnalysis}
                    disabled={aiLoading}
                    className="
                      group/ai relative overflow-hidden
                      rounded-xl border border-violet-400/20
                      bg-violet-500/10 px-4 py-2.5
                      text-xs font-semibold text-violet-200
                      transition-all duration-300
                      hover:scale-[1.03]
                      hover:border-violet-400/50
                      hover:bg-violet-500/20
                      hover:shadow-[0_0_25px_rgba(124,58,237,0.2)]
                      disabled:cursor-not-allowed disabled:opacity-50
                    "
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span
                        className={
                          aiLoading
                            ? "animate-spin"
                            : "transition-transform duration-300 group-hover/ai:rotate-180"
                        }
                      >
                        ✦
                      </span>

                      {aiLoading
                        ? "Analyzing..."
                        : "Analyze Ticket"}
                    </span>
                  </button>
                </div>

                {aiAnalysis ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-[#2a3150] bg-[#090E1A]/70 p-5 transition-all duration-300 hover:border-violet-400/30">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Summary
                      </p>

                      <p className="text-sm leading-6 text-slate-300">
                        {aiAnalysis.summary || "No summary available."}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#2a3150] bg-[#090E1A]/70 p-5 transition-all duration-300 hover:border-red-400/20">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Root Cause
                      </p>

                      <p className="text-sm leading-6 text-slate-300">
                        {aiAnalysis.rootCause ||
                          "No root cause identified."}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#2a3150] bg-[#090E1A]/70 p-5">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Suggested Category
                      </p>

                      <p className="text-sm font-medium text-violet-300">
                        {aiAnalysis.category || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#2a3150] bg-[#090E1A]/70 p-5">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Suggested Priority
                      </p>

                      <p className="text-sm font-medium text-amber-300">
                        {aiAnalysis.priority || "—"}
                      </p>
                    </div>

                    {aiSources?.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          Knowledge Sources
                        </p>

                        <div className="grid gap-2 sm:grid-cols-2">
                          {aiSources.map((source, index) => (
                            <div
                              key={source._id || index}
                              className="
                                rounded-xl border border-[#2a3150]
                                bg-[#090E1A]/60 p-4
                                transition-all duration-300
                                hover:border-cyan-400/30
                                hover:bg-cyan-400/[0.03]
                              "
                            >
                              <p className="text-xs font-medium text-cyan-300">
                                {source.title ||
                                  source.name ||
                                  `Source ${index + 1}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-violet-400/20 bg-violet-500/[0.03] p-8 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl text-violet-300">
                      ✦
                    </div>

                    <p className="text-sm font-medium text-slate-300">
                      AI analysis is ready
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Analyze this ticket to generate summary,
                      root cause and priority insights.
                    </p>
                  </div>
                )}

                {/* AI response assistant */}
                <div className="mt-6 border-t border-[#252d45] pt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        AI Response Assistant
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Generate a customer-facing response
                      </p>
                    </div>

                    <button
                      onClick={handleGenerateAIResponse}
                      disabled={aiResponseLoading}
                      className="
                        rounded-lg border border-cyan-400/20
                        bg-cyan-400/5 px-3 py-2
                        text-xs font-medium text-cyan-300
                        transition-all duration-300
                        hover:scale-[1.03]
                        hover:border-cyan-400/40
                        hover:bg-cyan-400/10
                        disabled:opacity-50
                      "
                    >
                      {aiResponseLoading
                        ? "Generating..."
                        : "Generate"}
                    </button>
                  </div>

                  {(aiSuggestion || editedSuggestion) && (
                    <div className="space-y-3">
                      <textarea
                        value={editedSuggestion}
                        onChange={(event) =>
                          setEditedSuggestion(event.target.value)
                        }
                        rows={5}
                        className="
                          w-full resize-none rounded-xl
                          border border-[#2a3150]
                          bg-[#090E1A]
                          p-4 text-sm leading-6 text-slate-300
                          outline-none transition-all duration-200
                          focus:border-cyan-400/40
                          focus:ring-2 focus:ring-cyan-400/10
                        "
                      />

                      <button
                        onClick={useAISuggestion}
                        className="
                          rounded-xl bg-gradient-to-r
                          from-cyan-500/80 to-violet-500/80
                          px-4 py-2.5 text-xs font-semibold
                          text-white transition-all duration-300
                          hover:scale-[1.02]
                          hover:shadow-lg
                          hover:shadow-violet-500/10
                        "
                      >
                        Use in Reply →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>)}

            {/* Conversation */}
            <section
              className="
                rounded-2xl border border-[#20283D]
                bg-[#0F1424]/90 p-6
                transition-all duration-300
                hover:border-indigo-500/20
              "
            >
              <SectionTitle
                icon="◌"
                title="Conversation"
                subtitle={`${comments.length} message${
                  comments.length === 1 ? "" : "s"
                }`}
              />

              <div className="max-h-[620px] space-y-5 overflow-y-auto pr-2">
                {comments.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#293149] p-8 text-center">
                    <div className="mb-2 text-2xl text-slate-600">
                      ◌
                    </div>

                    <p className="text-sm text-slate-500">
                      No messages yet.
                    </p>
                  </div>
                ) : (
                  comments.map((item) => {
                    const isCurrentUser =
                      item.user?._id === currentUser.userId ||
                      item.user?._id === currentUser._id;

                    const isCustomer =
                      item.user?.role === "customer";

                    return (
                      <div
                        key={item._id}
                        className={`flex gap-3 ${
                          isCurrentUser
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {!isCurrentUser && (
                          <div
                            className={`
                              mt-1 flex h-9 w-9 shrink-0
                              items-center justify-center
                              rounded-full border text-xs font-bold
                              ${
                                isCustomer
                                  ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                                  : "border-violet-400/20 bg-violet-400/10 text-violet-300"
                              }
                            `}
                          >
                            {getInitials(item.user?.name)}
                          </div>
                        )}

                        <div
                          className={`
                            max-w-[82%] rounded-2xl p-4
                            transition-all duration-300
                            hover:-translate-y-0.5
                            ${
                              isCurrentUser
                                ? "rounded-br-md bg-gradient-to-br from-violet-600/90 to-indigo-600/90 text-white shadow-lg shadow-violet-900/10"
                                : "rounded-bl-md border border-[#252d45] bg-[#090E1A]"
                            }
                          `}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-xs font-semibold">
                              {item.user?.name || "User"}
                            </span>

                            <span
                              className={`text-[10px] ${
                                isCurrentUser
                                  ? "text-violet-200/70"
                                  : "text-slate-600"
                              }`}
                            >
                              {formatDate(item.createdAt)}
                            </span>
                          </div>

                          <p className="whitespace-pre-wrap text-sm leading-6">
                            {item.message}
                          </p>
                        </div>

                        {isCurrentUser && (
                          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-xs font-bold text-violet-300">
                            {getInitials(currentUser.name)}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                <div ref={commentsEndRef} />
              </div>

              {/* Comment box */}
              <form
                id="comment-box"
                onSubmit={handleCommentSubmit}
                className="mt-6 border-t border-[#252d45] pt-5"
              >
                <div className="overflow-hidden rounded-2xl border border-[#293149] bg-[#090E1A] transition-all duration-300 focus-within:border-violet-500/40 focus-within:shadow-[0_0_25px_rgba(124,58,237,0.08)]">
                  <textarea
                    value={comment}
                    onChange={(event) =>
                      setComment(event.target.value)
                    }
                    rows={4}
                    placeholder="Write a response..."
                    className="
                      w-full resize-none bg-transparent
                      px-4 pt-4 text-sm text-slate-200
                      outline-none placeholder:text-slate-600
                    "
                  />

                  <div className="flex items-center justify-between border-t border-[#20283D] px-3 py-3">
                    <p className="text-[10px] text-slate-600">
                      Press send when you're ready
                    </p>

                    <button
                      type="submit"
                      disabled={
                        commentLoading || !comment.trim()
                      }
                      className="
                        rounded-xl bg-gradient-to-r
                        from-violet-600 to-indigo-600
                        px-5 py-2.5 text-xs font-semibold
                        text-white
                        transition-all duration-300
                        hover:scale-[1.03]
                        hover:shadow-lg
                        hover:shadow-violet-500/20
                        active:scale-95
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      {commentLoading
                        ? "Sending..."
                        : "Send Reply →"}
                    </button>
                  </div>
                </div>
              </form>
            </section>

            {/* Attachments */}
            <section
              className="
                rounded-2xl border border-[#20283D]
                bg-[#0F1424]/90 p-6
                transition-all duration-300
                hover:border-cyan-500/20
              "
            >
              <SectionTitle
                icon="⌁"
                title="Attachments"
                subtitle="Files associated with this ticket"
              />

              <div className="mb-5 rounded-xl border border-dashed border-[#303952] bg-[#090E1A] p-5 transition-all duration-300 hover:border-cyan-400/30">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    id="ticket-file"
                    type="file"
                    onChange={(event) =>
                      setSelectedFile(event.target.files?.[0] || null)
                    }
                    className="
                      block w-full text-xs text-slate-500
                      file:mr-3 file:rounded-lg file:border-0
                      file:bg-violet-500/10
                      file:px-3 file:py-2
                      file:text-xs file:font-medium
                      file:text-violet-300
                      hover:file:bg-violet-500/20
                    "
                  />

                  <button
                    onClick={handleFileUpload}
                    disabled={!selectedFile || uploadingFile}
                    className="
                      shrink-0 rounded-xl border
                      border-cyan-400/20
                      bg-cyan-400/5 px-4 py-2.5
                      text-xs font-semibold text-cyan-300
                      transition-all duration-300
                      hover:scale-[1.03]
                      hover:border-cyan-400/40
                      hover:bg-cyan-400/10
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    {uploadingFile
                      ? "Uploading..."
                      : "Upload File"}
                  </button>
                </div>

                <p className="mt-3 text-[10px] text-slate-600">
                  Supported: JPG, PNG, PDF, TXT · Maximum 5MB
                </p>
              </div>

              {attachments.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-600">
                  No attachments.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {attachments.map((file) => (
                    <a
                      key={file._id}
                      href={`http://localhost:5000${file.filePath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        group flex items-center gap-3
                        rounded-xl border border-[#252d45]
                        bg-[#090E1A] p-4
                        transition-all duration-300
                        hover:-translate-y-1
                        hover:border-cyan-400/30
                        hover:bg-cyan-400/[0.03]
                      "
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 transition-transform duration-300 group-hover:scale-110">
                        ↗
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-slate-300 group-hover:text-white">
                          {file.originalName}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-600">
                          {file.uploadedBy?.name || "User"}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </section>

            {/* Activity */}
            <section
              className="
                rounded-2xl border border-[#20283D]
                bg-[#0F1424]/90 p-6
              "
            >
              <SectionTitle
                icon="⌁"
                title="Activity Timeline"
                subtitle="Ticket history"
              />

              {activities.length === 0 ? (
                <p className="py-5 text-center text-xs text-slate-600">
                  No activity yet.
                </p>
              ) : (
                <div className="relative ml-2">
                  <div className="absolute bottom-0 left-[7px] top-0 w-px bg-gradient-to-b from-violet-500/40 via-[#293149] to-transparent" />

                  <div className="space-y-6">
                    {activities.map((activity) => {
                      const dotColor =
                        actionColors[activity.action] ||
                        "bg-slate-400";

                      return (
                        <div
                          key={activity._id}
                          className="group relative flex gap-4"
                        >
                          <div
                            className={`
                              relative z-10 mt-1
                              h-[15px] w-[15px]
                              shrink-0 rounded-full
                              border-4 border-[#0F1424]
                              ${dotColor}
                              transition-all duration-300
                              group-hover:scale-150
                              group-hover:shadow-[0_0_15px_currentColor]
                            `}
                          />

                          <div className="min-w-0 pb-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-slate-300">
                                {actionLabels[activity.action] ||
                                  activity.action}
                              </p>

                              <span className="text-[10px] text-slate-600">
                                {formatDate(activity.createdAt)}
                              </span>
                            </div>

                            {activity.details && (
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {activity.details}
                              </p>
                            )}

                            {activity.user?.name && (
                              <p className="mt-1 text-[10px] text-slate-600">
                                by {activity.user.name}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Ticket Health */}
            <section
              className="
                relative overflow-hidden rounded-2xl
                border border-[#252d45]
                bg-[#0F1424]/95 p-6
                transition-all duration-300
                hover:-translate-y-1
                hover:border-violet-500/30
                hover:shadow-[0_15px_50px_rgba(124,58,237,0.08)]
              "
            >
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-600/10 blur-[60px]" />

              <div className="relative">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">
                  Ticket Health
                </p>

                <p className="mb-6 text-xs text-slate-500">
                  Current operational state
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-[#252d45] bg-[#090E1A] p-4 transition-all duration-300 hover:border-amber-400/20">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-600">
                        Priority
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-200">
                        {ticket.priority}
                      </p>
                    </div>

                    <span
                      className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold ${
                        priorityStyles[ticket.priority]
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[#252d45] bg-[#090E1A] p-4 transition-all duration-300 hover:border-red-400/20">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-600">
                        Severity
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-200">
                        {ticket.severity}
                      </p>
                    </div>

                    <span
                      className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold ${
                        severityStyles[ticket.severity]
                      }`}
                    >
                      {ticket.severity}
                    </span>
                  </div>

                  <div className="rounded-xl border border-[#252d45] bg-[#090E1A] p-4">
                    <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-600">
                      Category
                    </p>

                    <p className="text-sm font-semibold text-white">
                      {ticket.category || "Other"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SLA */}
            <section
              className={`
                relative overflow-hidden rounded-2xl
                border p-6
                transition-all duration-300
                hover:-translate-y-1
                ${
                  timeRemaining.overdue
                    ? "border-red-500/30 bg-red-500/[0.04]"
                    : "border-cyan-400/20 bg-[#0F1424]/95"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                    SLA Monitor
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Resolution deadline
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-300">
                  ◷
                </div>
              </div>

              <div className="my-6 text-center">
                <p
                  className={`text-4xl font-bold tracking-tight ${
                    timeRemaining.overdue
                      ? "text-red-400"
                      : "text-white"
                  }`}
                >
                  {timeRemaining.text}
                </p>

                <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-600">
                  {timeRemaining.overdue
                    ? "Deadline exceeded"
                    : "Remaining"}
                </p>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#20283D]">
                <div
                  className={`
                    h-full rounded-full
                    transition-all duration-1000
                    ${
                      timeRemaining.overdue
                        ? "bg-red-500"
                        : "bg-gradient-to-r from-cyan-500 to-violet-500"
                    }
                  `}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(5, timeRemaining.percent)
                    )}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex justify-between text-[10px] text-slate-600">
                <span>Created</span>
                <span>
                  Due {formatShortDate(ticket.slaDueAt)}
                </span>
              </div>
            </section>

            {/* Ticket Information */}
            <section
              className="
                rounded-2xl border border-[#20283D]
                bg-[#0F1424]/95 p-6
              "
            >
              <SectionTitle
                icon="⚙"
                title="Ticket Controls"
                subtitle="Update ticket properties"
              />

              <div className="space-y-4">
                <SelectField
                  label="Category"
                  value={ticket.category}
                  disabled={updatingField === "category"}
                  onChange={(event) =>
                    handleTicketFieldChange(
                      "category",
                      event.target.value
                    )
                  }
                  options={[
                    "Technical",
                    "Payment",
                    "Account",
                    "Bug",
                    "Feature Request",
                    "Other",
                  ]}
                />

                <SelectField
                  label="Priority"
                  value={ticket.priority}
                  disabled={updatingField === "priority"}
                  onChange={(event) =>
                    handleTicketFieldChange(
                      "priority",
                      event.target.value
                    )
                  }
                  options={[
                    "Low",
                    "Medium",
                    "High",
                    "Critical",
                  ]}
                />

                <SelectField
                  label="Severity"
                  value={ticket.severity}
                  disabled={updatingField === "severity"}
                  onChange={(event) =>
                    handleTicketFieldChange(
                      "severity",
                      event.target.value
                    )
                  }
                  options={[
                    "Low",
                    "Medium",
                    "High",
                    "Critical",
                  ]}
                />
              </div>
            </section>

            {/* People */}
            <section
              className="
                rounded-2xl border border-[#20283D]
                bg-[#0F1424]/95 p-6
                transition-all duration-300
                hover:border-cyan-500/20
              "
            >
              <SectionTitle
                icon="◎"
                title="People"
                subtitle="Ticket participants"
              />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-xs font-bold text-cyan-300">
                    {getInitials(customer?.name)}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-slate-600">
                      Customer
                    </p>

                    <p className="truncate text-sm font-medium text-white">
                      {customer?.name || "Unknown"}
                    </p>

                    <p className="truncate text-[10px] text-slate-600">
                      {customer?.email || ""}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-[#20283D]" />

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-400/20 bg-violet-400/10 text-xs font-bold text-violet-300">
                    {getInitials(assignedEngineer?.name)}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-slate-600">
                      Engineer
                    </p>

                    <p className="truncate text-sm font-medium text-white">
                      {assignedEngineer?.name ||
                        "Unassigned"}
                    </p>

                    <p className="truncate text-[10px] text-slate-600">
                      {assignedEngineer?.email || ""}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Metadata */}
            <section className="rounded-2xl border border-[#20283D] bg-[#0F1424]/95 p-6">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Metadata
              </p>

              <div className="space-y-3">
                <div className="flex justify-between gap-4 text-xs">
                  <span className="text-slate-600">
                    Created
                  </span>
                  <span className="text-right text-slate-400">
                    {formatDate(ticket.createdAt)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-xs">
                  <span className="text-slate-600">
                    Updated
                  </span>
                  <span className="text-right text-slate-400">
                    {formatDate(ticket.updatedAt)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-xs">
                  <span className="text-slate-600">
                    SLA Hours
                  </span>
                  <span className="text-slate-400">
                    {ticket.slaHours || "—"}h
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}