import { useState } from "react";
import { motion } from "framer-motion";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import {
    CodeverseCard,
    CodeverseCardHeader,
    CodeverseCardTitle,
} from "@/components/ui/codeverse-card";
import { CodeverseButton } from "@/components/ui/codeverse-button";
import { Radio, Send, X, AlertCircle, Info, CheckCircle, AlertTriangle } from "lucide-react";

const typeIcons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
};

const typeColors = {
    info: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    success: "text-lime-400 bg-lime-500/10 border-lime-500/30",
    warning: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    error: "text-red-400 bg-red-500/10 border-red-500/30",
};

export const BroadcastPanel = () => {
    const { broadcasts, sendBroadcast, dismissBroadcast, loading } = useBroadcasts();
    const [message, setMessage] = useState("");
    const [type, setType] = useState<"info" | "warning" | "success" | "error">("info");
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        setSending(true);
        await sendBroadcast(message, type);
        setMessage("");
        setSending(false);
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-400" />
                Broadcast to All Participants
            </h2>

            {/* Send New Broadcast */}
            <CodeverseCard className="border-blue-500/30 bg-blue-950/20">
                <CodeverseCardHeader>
                    <CodeverseCardTitle className="text-blue-300">New Broadcast</CodeverseCardTitle>
                </CodeverseCardHeader>
                <div className="space-y-4">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message to all participants..."
                        className="w-full h-24 p-3 bg-black/50 border border-white/10 rounded-lg text-white resize-none focus:border-blue-500/50 focus:outline-none"
                    />

                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            {(["info", "warning", "success", "error"] as const).map((t) => {
                                const Icon = typeIcons[t];
                                return (
                                    <button
                                        key={t}
                                        onClick={() => setType(t)}
                                        className={`p-2 rounded-lg border transition-all ${type === t
                                                ? typeColors[t]
                                                : "border-white/10 text-gray-400 hover:border-white/30"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </button>
                                );
                            })}
                        </div>

                        <CodeverseButton
                            onClick={handleSend}
                            disabled={!message.trim() || sending}
                            className="bg-blue-500 text-white hover:bg-blue-400 ml-auto"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {sending ? "Sending..." : "Send Broadcast"}
                        </CodeverseButton>
                    </div>
                </div>
            </CodeverseCard>

            {/* Recent Broadcasts */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-400">Recent Broadcasts</h3>

                {loading && <div className="text-gray-500">Loading...</div>}

                {!loading && broadcasts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No active broadcasts. Send one above!
                    </div>
                )}

                {broadcasts.map((broadcast) => {
                    const Icon = typeIcons[broadcast.type as keyof typeof typeIcons] || Info;
                    const colors = typeColors[broadcast.type as keyof typeof typeColors] || typeColors.info;

                    return (
                        <motion.div
                            key={broadcast.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <CodeverseCard className={`${colors} transition-all`}>
                                <div className="flex items-start gap-3">
                                    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-white">{broadcast.message}</p>
                                        <p className="text-xs opacity-60 mt-1">{formatTime(broadcast.created_at)}</p>
                                    </div>
                                    <CodeverseButton
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => dismissBroadcast(broadcast.id)}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        <X className="w-4 h-4" />
                                    </CodeverseButton>
                                </div>
                            </CodeverseCard>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default BroadcastPanel;
