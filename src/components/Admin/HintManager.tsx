import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHints } from "@/hooks/useHints";
import { useProblems } from "@/hooks/useProblems";
import {
    CodeverseCard,
    CodeverseCardHeader,
    CodeverseCardTitle,
} from "@/components/ui/codeverse-card";
import { CodeverseButton } from "@/components/ui/codeverse-button";
import { CodeverseInput } from "@/components/ui/codeverse-input";
import { Lightbulb, Plus, Save, Trash2, X, Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Hint = Tables<"hints">;

export const HintManager = () => {
    const { hints, createHint, updateHint, deleteHint, loading } = useHints();
    const { problems } = useProblems();
    const [selectedProblem, setSelectedProblem] = useState<string>("");
    const [isCreating, setIsCreating] = useState(false);
    const [editingHint, setEditingHint] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Hint>>({});
    const [newHint, setNewHint] = useState<Partial<Hint>>({
        problem_id: "",
        content: "",
        unlock_after_minutes: 0,
        sort_order: 0,
    });

    // Show all problems (hints can be for any round now)
    const allProblems = problems;

    const filteredHints = selectedProblem
        ? hints.filter((h) => h.problem_id === selectedProblem)
        : hints;

    const getProblemInfo = (problemId: string) => {
        return problems.find((p) => p.id === problemId);
    };

    const handleCreate = async () => {
        if (!newHint.problem_id || !newHint.content) {
            return;
        }
        await createHint(newHint as Omit<Hint, "id" | "created_at">);
        setIsCreating(false);
        setNewHint({
            problem_id: selectedProblem || "",
            content: "",
            unlock_after_minutes: 0,
            sort_order: 0,
        });
    };

    const handleEdit = (hint: Hint) => {
        setEditingHint(hint.id);
        setEditForm(hint);
    };

    const handleSave = async (id: string) => {
        await updateHint(id, editForm);
        setEditingHint(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this hint?")) {
            await deleteHint(id);
        }
    };

    if (loading) {
        return <div className="text-gray-400">Loading hints...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    Hints Manager
                </h2>
                <CodeverseButton
                    size="sm"
                    onClick={() => setIsCreating(true)}
                    className="bg-yellow-500 text-black hover:bg-yellow-400"
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Hint
                </CodeverseButton>
            </div>

            {/* Filter by Problem */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Filter by Problem:</span>
                <select
                    value={selectedProblem}
                    onChange={(e) => setSelectedProblem(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-lime-500/50 focus:outline-none"
                >
                    <option value="">All Problems</option>
                    {allProblems.map((problem) => (
                        <option key={problem.id} value={problem.id}>
                            R{problem.round_number} - {problem.problem_code}: {problem.title}
                        </option>
                    ))}
                </select>
            </div>

            {/* Create New Hint Form */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <CodeverseCard className="border-yellow-500/50 bg-yellow-950/20">
                            <CodeverseCardHeader>
                                <CodeverseCardTitle className="text-yellow-300">New Hint</CodeverseCardTitle>
                            </CodeverseCardHeader>
                            <div className="space-y-3">
                                <select
                                    value={newHint.problem_id || ""}
                                    onChange={(e) => setNewHint({ ...newHint, problem_id: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-yellow-500/50 focus:outline-none"
                                >
                                    <option value="">Select Problem</option>
                                    {allProblems.map((problem) => (
                                        <option key={problem.id} value={problem.id}>
                                            {problem.problem_code}: {problem.title}
                                        </option>
                                    ))}
                                </select>
                                <div className="grid grid-cols-2 gap-3">
                                    <CodeverseInput
                                        type="number"
                                        placeholder="Unlock After (minutes)"
                                        value={newHint.unlock_after_minutes || ""}
                                        onChange={(e) => setNewHint({ ...newHint, unlock_after_minutes: parseInt(e.target.value) || 0 })}
                                    />
                                    <CodeverseInput
                                        type="number"
                                        placeholder="Sort Order"
                                        value={newHint.sort_order || ""}
                                        onChange={(e) => setNewHint({ ...newHint, sort_order: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <textarea
                                    placeholder="Hint Content"
                                    value={newHint.content || ""}
                                    onChange={(e) => setNewHint({ ...newHint, content: e.target.value })}
                                    className="w-full h-24 p-3 bg-black/50 border border-white/10 rounded-lg text-white resize-none focus:border-yellow-500/50 focus:outline-none"
                                />
                                <div className="flex gap-2">
                                    <CodeverseButton onClick={handleCreate} className="bg-yellow-500 text-black">
                                        <Save className="w-4 h-4 mr-1" />
                                        Create
                                    </CodeverseButton>
                                    <CodeverseButton variant="ghost" onClick={() => setIsCreating(false)}>
                                        <X className="w-4 h-4 mr-1" />
                                        Cancel
                                    </CodeverseButton>
                                </div>
                            </div>
                        </CodeverseCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hints List */}
            <div className="space-y-2">
                {filteredHints.map((hint) => {
                    const problem = getProblemInfo(hint.problem_id);

                    return (
                        <CodeverseCard
                            key={hint.id}
                            className={`transition-all ${editingHint === hint.id ? "border-yellow-500/50" : "border-white/10"
                                }`}
                        >
                            {editingHint === hint.id ? (
                                <div className="p-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <CodeverseInput
                                            type="number"
                                            placeholder="Unlock After (min)"
                                            value={editForm.unlock_after_minutes || ""}
                                            onChange={(e) => setEditForm({ ...editForm, unlock_after_minutes: parseInt(e.target.value) || 0 })}
                                        />
                                        <CodeverseInput
                                            type="number"
                                            placeholder="Sort Order"
                                            value={editForm.sort_order || ""}
                                            onChange={(e) => setEditForm({ ...editForm, sort_order: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <textarea
                                        value={editForm.content || ""}
                                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                        className="w-full h-24 p-3 bg-black/50 border border-white/10 rounded-lg text-white resize-none focus:border-yellow-500/50 focus:outline-none"
                                    />
                                    <div className="flex gap-2">
                                        <CodeverseButton onClick={() => handleSave(hint.id)} className="bg-yellow-500 text-black">
                                            <Save className="w-4 h-4 mr-1" />
                                            Save
                                        </CodeverseButton>
                                        <CodeverseButton variant="ghost" onClick={() => setEditingHint(null)}>
                                            Cancel
                                        </CodeverseButton>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs px-2 py-1 bg-lime-500/20 text-lime-300 rounded">
                                                    {problem?.problem_code || "?"} - {problem?.title || "Unknown"}
                                                </span>
                                                {hint.unlock_after_minutes > 0 && (
                                                    <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {hint.unlock_after_minutes}m
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-300 text-sm">{hint.content}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <CodeverseButton
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEdit(hint)}
                                                className="text-gray-400 hover:text-white"
                                            >
                                                Edit
                                            </CodeverseButton>
                                            <CodeverseButton
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDelete(hint.id)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </CodeverseButton>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CodeverseCard>
                    );
                })}

                {filteredHints.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No hints found. Click "Add Hint" to create one.
                    </div>
                )}
            </div>
        </div>
    );
};

export default HintManager;
