import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import studyBuddyApi, {
  BuddyConnectionRequest,
  BuddyMessage,
  BuddySession,
  StudyBuddyCard,
} from "@/api/studyBuddyApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Loader2, MessageCircle, RefreshCw, Search, Send, Star, Users, Video, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";

type BuddyThread = {
  buddy: StudyBuddyCard;
  mode: "messages" | "sessions";
};

const parseDateValue = (value: string | number[] | undefined): Date => {
  if (!value) return new Date(NaN);
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0] = value;
    return new Date(year, month - 1, day, hour, minute);
  }
  return new Date(value);
};

const formatRelativeDate = (value: string | number[] | undefined) => {
  const date = parseDateValue(value);
  if (Number.isNaN(date.getTime())) return "No date";

  const diffDays = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `${diffDays} days`;
  const weeks = Math.floor(diffDays / 7);
  return `${weeks} week${weeks > 1 ? "s" : ""}`;
};

const formatAbsoluteDate = (value: string | number[] | undefined) => {
  const date = parseDateValue(value);
  return Number.isNaN(date.getTime()) ? "No date" : date.toLocaleString();
};

const toLocalDateTimeInput = (value = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
};

const initials = (name?: string, surname?: string, username?: string) => {
  const source = name || surname ? `${name ?? ""} ${surname ?? ""}` : username ?? "";
  return source
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SB";
};

const StudyBuddies = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"discover" | "requests" | "mybuddies">("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [discoverBuddies, setDiscoverBuddies] = useState<StudyBuddyCard[]>([]);
  const [myBuddies, setMyBuddies] = useState<StudyBuddyCard[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<BuddyConnectionRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<BuddyConnectionRequest[]>([]);
  const [loadingDiscover, setLoadingDiscover] = useState(true);
  const [loadingMine, setLoadingMine] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [connectLoadingUsername, setConnectLoadingUsername] = useState<string | null>(null);
  const [requestActionId, setRequestActionId] = useState<number | null>(null);
  const [thread, setThread] = useState<BuddyThread | null>(null);
  const [threadOpen, setThreadOpen] = useState(false);
  const [messages, setMessages] = useState<BuddyMessage[]>([]);
  const [sessions, setSessions] = useState<BuddySession[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [joiningBuddyId, setJoiningBuddyId] = useState<number | null>(null);
  const [removingBuddyId, setRemovingBuddyId] = useState<number | null>(null);
  const [sessionLocation, setSessionLocation] = useState("Online study call");
  const [sessionMinutes, setSessionMinutes] = useState(60);
  const requestRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [pendingFocusRequestId, setPendingFocusRequestId] = useState<number | null>(null);
  const [pendingFocusBuddyId, setPendingFocusBuddyId] = useState<number | null>(null);

  const loadDiscover = useCallback(async () => {
    setLoadingDiscover(true);
    try {
      const data = await studyBuddyApi.discover();
      setDiscoverBuddies(data);
      return data;
    } catch (error) {
      console.error("Failed to load study buddy recommendations:", error);
      toast({ title: "Error", description: "Failed to load study buddy recommendations.", variant: "destructive" });
      return [];
    } finally {
      setLoadingDiscover(false);
    }
  }, [toast]);

  const loadMine = useCallback(async () => {
    setLoadingMine(true);
    try {
      const data = await studyBuddyApi.mine();
      setMyBuddies(data);
      return data;
    } catch (error) {
      console.error("Failed to load study buddies:", error);
      toast({ title: "Error", description: "Failed to load your study buddies.", variant: "destructive" });
      return [];
    } finally {
      setLoadingMine(false);
    }
  }, [toast]);

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const [incoming, outgoing] = await Promise.all([
        studyBuddyApi.incomingRequests(),
        studyBuddyApi.outgoingRequests(),
      ]);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
      return { incoming, outgoing };
    } catch (error) {
      console.error("Failed to load buddy requests:", error);
      toast({ title: "Error", description: "Failed to load connection requests.", variant: "destructive" });
      return { incoming: [], outgoing: [] };
    } finally {
      setLoadingRequests(false);
    }
  }, [toast]);

  const refreshAll = useCallback(async () => {
    const [, mine] = await Promise.all([loadDiscover(), loadMine(), loadRequests()]);
    return { mine };
  }, [loadDiscover, loadMine, loadRequests]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "requests" || tab === "discover" || tab === "mybuddies") {
      setActiveTab(tab);
    }

    const requestIdParam = searchParams.get("requestId");
    if (requestIdParam) {
      const requestId = Number(requestIdParam);
      if (Number.isFinite(requestId)) {
        setPendingFocusRequestId(requestId);
      }
    }

    const buddyIdParam = searchParams.get("buddyId");
    if (buddyIdParam) {
      const buddyId = Number(buddyIdParam);
      if (Number.isFinite(buddyId)) {
        setPendingFocusBuddyId(buddyId);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab !== "requests" || pendingFocusRequestId == null) return;

    const element = requestRefs.current[pendingFocusRequestId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-2", "ring-primary", "ring-offset-2", "ring-offset-background");
      const timer = window.setTimeout(() => {
        element.classList.remove("ring-2", "ring-primary", "ring-offset-2", "ring-offset-background");
      }, 2500);

      setPendingFocusRequestId(null);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("requestId");
      setSearchParams(nextParams, { replace: true });

      return () => window.clearTimeout(timer);
    }
  }, [activeTab, pendingFocusRequestId, searchParams, setSearchParams]);

  const openThread = useCallback(async (buddy: StudyBuddyCard, mode: BuddyThread["mode"]) => {
    if (!buddy.id) return;
    setThread({ buddy, mode });
    setThreadOpen(true);
    setThreadLoading(true);
    try {
      const [loadedMessages, loadedSessions] = await Promise.all([
        studyBuddyApi.messages(buddy.id),
        studyBuddyApi.sessions(buddy.id),
      ]);
      setMessages(loadedMessages);
      setSessions(loadedSessions);
    } catch (error) {
      console.error("Failed to load buddy thread:", error);
      toast({ title: "Error", description: "Failed to load buddy conversations.", variant: "destructive" });
      setMessages([]);
      setSessions([]);
    } finally {
      setThreadLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (activeTab !== "mybuddies" || pendingFocusBuddyId == null || myBuddies.length === 0) return;

    const buddy = myBuddies.find((item) => item.id === pendingFocusBuddyId);
    if (!buddy?.id) return;

    openThread(buddy, "messages");
    setPendingFocusBuddyId(null);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("buddyId");
    setSearchParams(nextParams, { replace: true });
  }, [activeTab, pendingFocusBuddyId, myBuddies, openThread, searchParams, setSearchParams]);

  const connectBuddy = async (username: string, openAfter = false) => {
    setConnectLoadingUsername(username);
    try {
      const response = await studyBuddyApi.connect(username);
      const wasAccepted = response.status === "ACCEPTED";

      toast({
        title: wasAccepted ? "Connected" : "Request sent",
        description: wasAccepted
          ? `You are now matched with ${username}.`
          : `A connection request was sent to ${username}.`,
      });

      const { mine } = await refreshAll();
      if (openAfter && wasAccepted) {
        const buddyToOpen = mine.find((buddy) => buddy.username === username);
        if (buddyToOpen?.id) {
          await openThread(buddyToOpen, "messages");
        }
      }
    } catch (error) {
      console.error("Failed to connect buddy:", error);
      toast({ title: "Error", description: "Failed to connect with this study buddy.", variant: "destructive" });
    } finally {
      setConnectLoadingUsername(null);
    }
  };

  const acceptRequest = async (request: BuddyConnectionRequest) => {
    setRequestActionId(request.id);
    try {
      await studyBuddyApi.acceptRequest(request.id);
      toast({
        title: "Connection accepted",
        description: `${request.sender_name ?? request.sender_username} has been added to your study buddies.`,
      });
      await refreshAll();
    } catch (error) {
      console.error("Failed to accept request:", error);
      toast({ title: "Error", description: "Failed to accept the request.", variant: "destructive" });
    } finally {
      setRequestActionId(null);
    }
  };

  const declineRequest = async (request: BuddyConnectionRequest) => {
    setRequestActionId(request.id);
    try {
      await studyBuddyApi.declineRequest(request.id);
      toast({
        title: "Request declined",
        description: `The request from ${request.sender_name ?? request.sender_username} was declined.`,
      });
      await refreshAll();
    } catch (error) {
      console.error("Failed to decline request:", error);
      toast({ title: "Error", description: "Failed to decline the request.", variant: "destructive" });
    } finally {
      setRequestActionId(null);
    }
  };

  const sendMessage = async () => {
    if (!thread?.buddy.id || !messageDraft.trim()) return;
    setSendingMessage(true);
    try {
      const created = await studyBuddyApi.sendMessage(thread.buddy.id, { content: messageDraft.trim() });
      setMessages((prev) => [...prev, created]);
      setMessageDraft("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    } finally {
      setSendingMessage(false);
    }
  };

  const joinStudyCall = async (buddy: StudyBuddyCard) => {
    if (!buddy.id) return;
    setJoiningBuddyId(buddy.id);
    try {
      await studyBuddyApi.createSession(buddy.id, {
        scheduled_time: toLocalDateTimeInput(new Date()),
        location: sessionLocation,
        duration_minutes: sessionMinutes,
        notes: "Started from the Study Buddies page",
      });
      toast({
        title: "Study call created",
        description: `A ${sessionMinutes}-minute session was created for ${buddy.name ?? buddy.username}.`,
      });
      await loadMine();
      if (thread?.buddy.id === buddy.id) {
        const updatedSessions = await studyBuddyApi.sessions(buddy.id);
        setSessions(updatedSessions);
      }
    } catch (error) {
      console.error("Failed to start study call:", error);
      toast({ title: "Error", description: "Failed to start a study call.", variant: "destructive" });
    } finally {
      setJoiningBuddyId(null);
    }
  };

  const removeBuddy = async (buddy: StudyBuddyCard) => {
    if (!buddy.id) return;
    const confirmed = window.confirm(`Remove ${buddy.name ?? buddy.username} from your study buddies?`);
    if (!confirmed) return;

    setRemovingBuddyId(buddy.id);
    try {
      await studyBuddyApi.removeBuddy(buddy.id);
      toast({
        title: "Buddy removed",
        description: `${buddy.name ?? buddy.username} was removed from your active buddies.`,
      });
      if (thread?.buddy.id === buddy.id) {
        setThreadOpen(false);
      }
      await refreshAll();
    } catch (error) {
      console.error("Failed to remove buddy:", error);
      toast({ title: "Error", description: "Failed to remove this buddy.", variant: "destructive" });
    } finally {
      setRemovingBuddyId(null);
    }
  };

  const subjects = useMemo(() => {
    const counts = new Map<string, number>();
    [...discoverBuddies, ...myBuddies].forEach((buddy) => {
      buddy.courses.forEach((course) => {
        counts.set(course, (counts.get(course) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [discoverBuddies, myBuddies]);

  const filteredDiscover = discoverBuddies.filter((buddy) => {
    const haystack = [
      buddy.name,
      buddy.surname,
      buddy.username,
      buddy.major,
      buddy.year,
      buddy.study_style,
      buddy.availability,
      buddy.bio,
      ...buddy.courses,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Study Buddies
              </h1>
              <p className="text-muted-foreground mt-2">
                Find, match, message, and study with people from your courses.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeTab === "discover" ? "default" : "ghost"}
                onClick={() => setActiveTab("discover")}
                className={activeTab === "discover" ? "gradient-primary border-0" : ""}
              >
                <Search className="w-4 h-4 mr-2" />
                Discover
              </Button>
              <Button
                variant={activeTab === "requests" ? "default" : "ghost"}
                onClick={() => setActiveTab("requests")}
                className={activeTab === "requests" ? "gradient-primary border-0" : ""}
              >
                <Users className="w-4 h-4 mr-2" />
                Requests
                {incomingRequests.length > 0 && (
                  <Badge className="ml-2 bg-white/20 text-current border-0">{incomingRequests.length}</Badge>
                )}
              </Button>
              <Button
                variant={activeTab === "mybuddies" ? "default" : "ghost"}
                onClick={() => setActiveTab("mybuddies")}
                className={activeTab === "mybuddies" ? "gradient-primary border-0" : ""}
              >
                <Users className="w-4 h-4 mr-2" />
                My Buddies
              </Button>
            </div>
          </div>
        </div>

        <Card className="glass-card p-6 border-0">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Subject Channels
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {subjects.length > 0 ? (
              subjects.map((subject, index) => (
                <button
                  key={subject.name}
                  className="glass p-4 rounded-2xl hover:scale-105 transition-transform text-left"
                >
                  <div className={`w-12 h-12 rounded-xl ${index % 3 === 0 ? "bg-primary" : index % 3 === 1 ? "bg-secondary" : "bg-accent"} mb-3 flex items-center justify-center`}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">{subject.name}</h3>
                  <p className="text-xs text-muted-foreground">{subject.count} students</p>
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No subject data yet.</p>
            )}
          </div>
        </Card>

        {activeTab === "discover" && (
          <>
            <Card className="glass-card p-6 border-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by course, major, or study style..."
                  className="pl-12 h-14 text-lg glass-card border-0"
                />
              </div>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Top Matches for You</h2>
                <Button variant="outline" className="glass" onClick={() => { loadDiscover(); loadMine(); }}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {loadingDiscover ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Finding matches...</span>
                </div>
              ) : filteredDiscover.length === 0 ? (
                <Card className="glass-card p-8 border-0 text-center">
                  <p className="text-muted-foreground">No study buddy matches found yet.</p>
                </Card>
              ) : (
                filteredDiscover.map((buddy) => (
                  <Card key={buddy.username} className="glass-card p-6 border-0 hover:shadow-xl transition-shadow">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-primary text-white flex items-center justify-center text-xl font-bold">
                          {initials(buddy.name, buddy.surname, buddy.username)}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold">
                              {buddy.name ?? buddy.username}
                              {buddy.surname ? ` ${buddy.surname}` : ""}
                            </h3>
                            <Badge className="gradient-primary border-0">
                              <Star className="w-3 h-3 mr-1" />
                              {buddy.match_score ?? 0}% Match
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-1">
                            {(buddy.major ?? "General Studies")} • {(buddy.year ?? "Student")}
                          </p>
                          <p className="text-sm mb-4">{buddy.bio ?? "Ready to study and help out."}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {buddy.courses.map((course) => (
                              <Badge key={course} variant="outline" className="glass">
                                {course}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>📚 {buddy.study_style ?? "Discussion"}</span>
                            <span>🕐 {buddy.availability ?? "Flexible"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex md:flex-col gap-2 justify-end">
                        <Button
                          className="gradient-primary border-0"
                          onClick={() => connectBuddy(buddy.username)}
                          disabled={connectLoadingUsername === buddy.username}
                        >
                          {connectLoadingUsername === buddy.username ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Users className="w-4 h-4 mr-2" />
                          )}
                          Connect
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === "requests" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Connection Requests</h2>
              <Button variant="outline" className="glass" onClick={loadRequests} disabled={loadingRequests}>
                {loadingRequests ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card p-6 border-0 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Incoming</h3>
                  <Badge variant="outline" className="glass">{incomingRequests.length}</Badge>
                </div>

                {loadingRequests ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : incomingRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No incoming connection requests.</p>
                ) : (
                incomingRequests.map((request) => (
                  <div
                    key={request.id}
                    ref={(node) => {
                      requestRefs.current[request.id] = node;
                    }}
                    className="p-4 rounded-2xl glass space-y-3 transition-shadow"
                  >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">
                            {request.sender_name ?? request.sender_username}
                            {request.sender_surname ? ` ${request.sender_surname}` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">@{request.sender_username}</p>
                        </div>
                        <Badge>{request.status}</Badge>
                      </div>
                      {request.message && <p className="text-sm">{request.message}</p>}
                      <div className="flex gap-2">
                        <Button
                          className="gradient-primary border-0"
                          onClick={() => acceptRequest(request)}
                          disabled={requestActionId === request.id}
                        >
                          {requestActionId === request.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : null}
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          className="glass"
                          onClick={() => declineRequest(request)}
                          disabled={requestActionId === request.id}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </Card>

              <Card className="glass-card p-6 border-0 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Sent</h3>
                  <Badge variant="outline" className="glass">{outgoingRequests.length}</Badge>
                </div>

                {loadingRequests ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : outgoingRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">You have not sent any requests yet.</p>
                ) : (
                  outgoingRequests.map((request) => (
                    <div key={request.id} className="p-4 rounded-2xl glass space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">
                            {request.receiver_name ?? request.receiver_username}
                            {request.receiver_surname ? ` ${request.receiver_surname}` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">@{request.receiver_username}</p>
                        </div>
                        <Badge>{request.status}</Badge>
                      </div>
                      {request.message && <p className="text-sm">{request.message}</p>}
                      <p className="text-xs text-muted-foreground">
                        Sent {formatAbsoluteDate(request.created_at)}
                      </p>
                    </div>
                  ))
                )}
              </Card>
            </div>
          </div>
        )}

        {activeTab === "mybuddies" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Study Partners</h2>
              <Button variant="outline" className="glass" onClick={loadMine} disabled={loadingMine}>
                {loadingMine ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Refresh
              </Button>
            </div>

            {loadingMine ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading your buddies...</span>
              </div>
            ) : myBuddies.length === 0 ? (
              <Card className="glass-card p-8 border-0 text-center">
                <p className="text-muted-foreground">You have no study buddies yet. Find some in Discover.</p>
              </Card>
            ) : (
              myBuddies.map((buddy) => (
                <Card key={buddy.id ?? buddy.username} className="glass-card p-6 border-0">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-primary text-white flex items-center justify-center text-xl font-bold">
                          {initials(buddy.name, buddy.surname, buddy.username)}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ${buddy.status === "ACTIVE" ? "bg-accent" : "bg-muted"} border-2 border-white`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold">
                          {buddy.name ?? buddy.username}
                          {buddy.surname ? ` ${buddy.surname}` : ""}
                          </h3>
                          {((buddy.unread_count ?? 0) > 0) && (
                            <Badge className="bg-red-500 text-white border-0">
                              {buddy.unread_count > 99 ? "99+" : buddy.unread_count} new
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {buddy.courses[0] ?? buddy.major ?? "Study buddy"}
                        </p>
                        <p className="text-sm mt-1">📊 {buddy.session_count ?? 0} sessions completed</p>
                        <p className="text-sm text-primary font-medium mt-1">
                          Next: {buddy.next_session_at ? `${formatRelativeDate(buddy.next_session_at)} • ${formatAbsoluteDate(buddy.next_session_at)}` : "No session scheduled"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="lg"
                        className="gradient-primary border-0"
                        onClick={() => buddy.id && joinStudyCall(buddy)}
                        disabled={joiningBuddyId === buddy.id}
                      >
                        {joiningBuddyId === buddy.id ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <Video className="w-5 h-5 mr-2" />
                        )}
                        Start Study Session
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="glass"
                        onClick={() => openThread(buddy, "messages")}
                      >
                        <MessageCircle className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="glass text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeBuddy(buddy)}
                        disabled={removingBuddyId === buddy.id}
                      >
                        {removingBuddyId === buddy.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      <Dialog open={threadOpen} onOpenChange={setThreadOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {thread?.buddy.name ?? thread?.buddy.username}
              {thread?.buddy.surname ? ` ${thread.buddy.surname}` : ""}{" "}
              {thread?.mode === "messages" ? "Messages" : "Sessions"}
            </DialogTitle>
          </DialogHeader>

          {threadLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading buddy details...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Messages</h3>
                  <Badge variant="outline" className="glass">{messages.length} total</Badge>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div key={message.id} className={`p-3 rounded-2xl glass ${message.sender_username === user?.username ? "ml-8" : "mr-8"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {message.sender_name ?? message.sender_username ?? "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatAbsoluteDate(message.sent_at)}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Textarea
                    value={messageDraft}
                    onChange={(e) => setMessageDraft(e.target.value)}
                    placeholder="Write a message..."
                    rows={4}
                  />
                  <Button className="w-full gradient-primary border-0" onClick={sendMessage} disabled={!messageDraft.trim() || sendingMessage || !thread?.buddy.id}>
                    {sendingMessage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Send Message
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Sessions</h3>
                  <Badge variant="outline" className="glass">{sessions.length} scheduled</Badge>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {sessions.length > 0 ? (
                    sessions.map((session) => (
                      <div key={session.id} className="p-3 glass rounded-2xl">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{formatRelativeDate(session.scheduled_time)}</span>
                          <Badge>{session.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{formatAbsoluteDate(session.scheduled_time)}</p>
                        <p className="text-sm">Location: {session.location ?? "Online"}</p>
                        <p className="text-sm">Duration: {session.duration_minutes ?? 60} min</p>
                        {session.notes && <p className="text-sm text-muted-foreground mt-1">{session.notes}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No sessions yet.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    value={sessionLocation}
                    onChange={(e) => setSessionLocation(e.target.value)}
                    placeholder="Session location or online link"
                  />
                  <Input
                    type="number"
                    min="15"
                    step="15"
                    value={sessionMinutes}
                    onChange={(e) => setSessionMinutes(parseInt(e.target.value, 10) || 60)}
                    placeholder="Duration minutes"
                  />
                  <Button
                    className="w-full gradient-primary border-0"
                    onClick={() => thread?.buddy.id && joinStudyCall(thread.buddy)}
                    disabled={!thread?.buddy.id || joiningBuddyId === thread.buddy.id}
                  >
                    {joiningBuddyId === thread?.buddy.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Video className="w-4 h-4 mr-2" />}
                    Start Study Session
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudyBuddies;
