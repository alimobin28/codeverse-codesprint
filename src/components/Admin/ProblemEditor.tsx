import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProblems } from "@/hooks/useProblems";
import {
    CodeverseCard,
    CodeverseCardHeader,
    CodeverseCardTitle,
} from "@/components/ui/codeverse-card";
import { CodeverseButton } from "@/components/ui/codeverse-button";
import { CodeverseInput } from "@/components/ui/codeverse-input";
import { FileText, Plus, Save, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Problem = Tables<"problems">;

interface ProblemEditorProps {
    roundNumber?: number;
}

export const ProblemEditor = ({ roundNumber }: ProblemEditorProps) => {
    const { problems, createProblem, updateProblem, deleteProblem, loading } = useProblems(roundNumber);
    const [expandedProblem, setExpandedProblem] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Problem>>({});
    const [newProblem, setNewProblem] = useState<Partial<Problem>>({
        round_number: roundNumber || 1,
        problem_code: "",
        title: "",
        statement: "",
        sort_order: 0,
        individual_time_limit_seconds: null,
        points: 100,
    });

    const handleExpand = (id: string, problem: Problem) => {
        if (expandedProblem === id) {
            setExpandedProblem(null);
        } else {
            setExpandedProblem(id);
            setEditForm(problem);
        }
    };

    const handleSave = async (id: string) => {
        await updateProblem(id, editForm);
        setExpandedProblem(null);
    };

    const handleCreate = async () => {
        if (!newProblem.problem_code || !newProblem.title || !newProblem.statement) {
            return;
        }
        await createProblem(newProblem as Omit<Problem, "id" | "created_at" | "updated_at">);
        setIsCreating(false);
        setNewProblem({
            round_number: roundNumber || 1,
            problem_code: "",
            title: "",
            statement: "",
            sort_order: 0,
            individual_time_limit_seconds: null,
            points: 100,
        });
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this problem?")) {
            await deleteProblem(id);
        }
    };

    if (loading) {
        return <div className="text-gray-400">Loading problems...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-lime-400" />
                    Problems {roundNumber ? `(Round ${roundNumber})` : "(All)"}
                </h2>
                <CodeverseButton
                    size="sm"
                    onClick={() => setIsCreating(true)}
                    className="bg-lime-500 text-black hover:bg-lime-400"
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Problem
                </CodeverseButton>
            </div>

            {/* Create New Problem Form */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <CodeverseCard className="border-lime-500/50 bg-lime-950/20">
                            <CodeverseCardHeader>
                                <CodeverseCardTitle className="text-lime-300">New Problem</CodeverseCardTitle>
                            </CodeverseCardHeader>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <CodeverseInput
                                        placeholder="Problem Code (e.g., A)"
                                        value={newProblem.problem_code || ""}
                                        onChange={(e) => setNewProblem({ ...newProblem, problem_code: e.target.value })}
                                    />
                                    <CodeverseInput
                                        placeholder="Title"
                                        value={newProblem.title || ""}
                                        onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <CodeverseInput
                                        type="number"
                                        placeholder="Round #"
                                        value={newProblem.round_number || ""}
                                        onChange={(e) => setNewProblem({ ...newProblem, round_number: parseInt(e.target.value) })}
                                    />
                                    <CodeverseInput
                                        type="number"
                                        placeholder="Sort Order"
                                        value={newProblem.sort_order || ""}
                                        onChange={(e) => setNewProblem({ ...newProblem, sort_order: parseInt(e.target.value) })}
                                    />
                                    <CodeverseInput
                                        type="number"
                                        placeholder="Time Limit (sec)"
                                        value={newProblem.individual_time_limit_seconds || ""}
                                        onChange={(e) => setNewProblem({ ...newProblem, individual_time_limit_seconds: parseInt(e.target.value) || null })}
                                    />
                                </div>
                                <textarea
                                    placeholder="Problem Statement"
                                    value={newProblem.statement || ""}
                                    onChange={(e) => setNewProblem({ ...newProblem, statement: e.target.value })}
                                    className="w-full h-32 p-3 bg-black/50 border border-white/10 rounded-lg text-white resize-none focus:border-lime-500/50 focus:outline-none"
                                />
                                <div className="flex gap-2">
                                    <CodeverseButton onClick={handleCreate} className="bg-lime-500 text-black">
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

            {/* Problem List */}
            <div className="space-y-2">
                {problems.map((problem) => (
                    <motion.div key={problem.id} layout>
                        <CodeverseCard
                            className={`transition-all cursor-pointer ${expandedProblem === problem.id ? "border-lime-500/50" : "border-white/10"
                                }`}
                        >
                            <div
                                className="flex items-center justify-between p-3"
                                onClick={() => handleExpand(problem.id, problem)}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lime-400 font-mono font-bold">
                                        {problem.problem_code}
                                    </span>
                                    <span className="text-white">{problem.title}</span>
                                    <span className="text-xs text-gray-500">R{problem.round_number}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {problem.individual_time_limit_seconds && (
                                        <span className="text-xs text-orange-400">
                                            {problem.individual_time_limit_seconds}s
                                        </span>
                                    )}
                                    {expandedProblem === problem.id ? (
                                        <ChevronUp className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedProblem === problem.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="border-t border-white/10 p-4 space-y-3"
                                    >
                                        <div className="grid grid-cols-2 gap-3">
                                            <CodeverseInput
                                                placeholder="Problem Code"
                                                value={editForm.problem_code || ""}
                                                onChange={(e) => setEditForm({ ...editForm, problem_code: e.target.value })}
                                            />
                                            <CodeverseInput
                                                placeholder="Title"
                                                value={editForm.title || ""}
                                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <CodeverseInput
                                                type="number"
                                                placeholder="Sort Order"
                                                value={editForm.sort_order || ""}
                                                onChange={(e) => setEditForm({ ...editForm, sort_order: parseInt(e.target.value) })}
                                            />
                                            <CodeverseInput
                                                type="number"
                                                placeholder="Time Limit (sec)"
                                                value={editForm.individual_time_limit_seconds || ""}
                                                onChange={(e) => setEditForm({ ...editForm, individual_time_limit_seconds: parseInt(e.target.value) || null })}
                                            />
                                            <CodeverseInput
                                                type="number"
                                                placeholder="Points"
                                                value={editForm.points || ""}
                                                onChange={(e) => setEditForm({ ...editForm, points: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <textarea
                                            placeholder="Problem Statement"
                                            value={editForm.statement || ""}
                                            onChange={(e) => setEditForm({ ...editForm, statement: e.target.value })}
                                            className="w-full h-32 p-3 bg-black/50 border border-white/10 rounded-lg text-white resize-none focus:border-lime-500/50 focus:outline-none"
                                        />
                                        <div className="flex gap-2">
                                            <CodeverseButton onClick={() => handleSave(problem.id)} className="bg-lime-500 text-black">
                                                <Save className="w-4 h-4 mr-1" />
                                                Save
                                            </CodeverseButton>
                                            <CodeverseButton
                                                variant="ghost"
                                                onClick={() => handleDelete(problem.id)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Delete
                                            </CodeverseButton>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CodeverseCard>
                    </motion.div>
                ))}

                {problems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No problems found. Click "Add Problem" to create one.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProblemEditor;
