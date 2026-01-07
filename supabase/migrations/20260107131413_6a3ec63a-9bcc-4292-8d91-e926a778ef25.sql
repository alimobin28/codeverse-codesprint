-- Create teams table
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    session_id TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rounds table
CREATE TABLE public.rounds (
    id SERIAL PRIMARY KEY,
    round_number INTEGER NOT NULL UNIQUE CHECK (round_number IN (1, 2, 3)),
    is_unlocked BOOLEAN NOT NULL DEFAULT false,
    timer_active BOOLEAN NOT NULL DEFAULT false,
    timer_started_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default rounds
INSERT INTO public.rounds (round_number, is_unlocked, timer_active) VALUES
    (1, false, false),
    (2, false, false),
    (3, false, false);

-- Create problems table
CREATE TABLE public.problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_number INTEGER NOT NULL REFERENCES public.rounds(round_number),
    problem_code TEXT NOT NULL,
    title TEXT NOT NULL,
    statement TEXT NOT NULL,
    guidance TEXT,
    timer_duration_seconds INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_progress table
CREATE TABLE public.team_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    is_solved BOOLEAN NOT NULL DEFAULT false,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    locked_at TIMESTAMP WITH TIME ZONE,
    current_problem_started_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (team_id, problem_id)
);

-- Create team_round_state table to track current problem per round
CREATE TABLE public.team_round_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL REFERENCES public.rounds(round_number),
    current_problem_id UUID REFERENCES public.problems(id),
    round_started_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (team_id, round_number)
);

-- Create admin_settings table
CREATE TABLE public.admin_settings (
    id SERIAL PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default admin password (hashed in real app, simple for demo)
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES
    ('admin_password', 'codeverse2024'),
    ('round3_global_timer_seconds', '660');

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_round_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams (public access for this competition app)
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Anyone can insert teams" ON public.teams FOR INSERT WITH CHECK (true);

-- RLS Policies for rounds (public read, admin controls via edge functions)
CREATE POLICY "Anyone can view rounds" ON public.rounds FOR SELECT USING (true);
CREATE POLICY "Anyone can update rounds" ON public.rounds FOR UPDATE USING (true);

-- RLS Policies for problems
CREATE POLICY "Anyone can view problems" ON public.problems FOR SELECT USING (true);

-- RLS Policies for team_progress
CREATE POLICY "Anyone can view team_progress" ON public.team_progress FOR SELECT USING (true);
CREATE POLICY "Anyone can insert team_progress" ON public.team_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update team_progress" ON public.team_progress FOR UPDATE USING (true);

-- RLS Policies for team_round_state
CREATE POLICY "Anyone can view team_round_state" ON public.team_round_state FOR SELECT USING (true);
CREATE POLICY "Anyone can insert team_round_state" ON public.team_round_state FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update team_round_state" ON public.team_round_state FOR UPDATE USING (true);

-- RLS Policies for admin_settings (protected, only via edge functions)
CREATE POLICY "Anyone can view admin_settings" ON public.admin_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can update admin_settings" ON public.admin_settings FOR UPDATE USING (true);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_round_state;

-- Insert sample problems for each round
-- Round 1: Multiple problems, guidance allowed
INSERT INTO public.problems (round_number, problem_code, title, statement, guidance, sort_order) VALUES
    (1, 'A', 'Binary Reconstruction', 'In the fragmented memory of CodeVerse, a sequence of binary data has been corrupted. Given an array of integers, reconstruct the original binary sequence by finding the XOR of all elements.', 'Hint: XOR operation is commutative and associative. Think about what happens when you XOR a number with itself.', 1),
    (1, 'B', 'Logic Gate Repair', 'A critical logic gate in the system has malfunctioned. Given a boolean expression in CNF form, determine if it is satisfiable.', 'Hint: For small inputs, try all possible truth assignments. For larger ones, look for unit clauses first.', 2),
    (1, 'C', 'Memory Fragment Merge', 'Two sorted memory fragments need to be merged into a single sorted sequence. Write an algorithm to merge them efficiently.', 'Hint: Use two pointers, one for each array. Compare and advance the pointer with smaller value.', 3),
    (1, 'D', 'Recursion Recovery', 'A recursive function has lost its base case. Given the recursive relation f(n) = f(n-1) + f(n-2) with f(1)=1, f(2)=1, compute f(n).', 'Hint: This is the Fibonacci sequence. Consider using memoization or bottom-up DP.', 4);

-- Round 2: Problems with individual timers, no hints
INSERT INTO public.problems (round_number, problem_code, title, statement, timer_duration_seconds, sort_order) VALUES
    (2, 'A', 'Temporal Paradox', 'In the failing time flow of CodeVerse, temporal anomalies have created a paradox. You are given a sequence of events that must occur in a specific order. Each event has a timestamp and a dependency list. Your task is to determine if all events can be scheduled without violating any dependencies. The time flows unpredictably, sometimes forward, sometimes backward. Consider the implications of causality in a non-linear timeline. Output YES if a valid schedule exists, NO otherwise.', 180, 1),
    (2, 'B', 'Quantum State Collapse', 'The quantum processing unit has entered an unstable state. You are observing a superposition of N possible states, each with an associated probability amplitude. When measured, the system will collapse to one state. Given the amplitudes as complex numbers, calculate the probability of each outcome and determine which state is most likely to be observed. Remember that probabilities are the squared magnitudes of amplitudes.', 180, 2),
    (2, 'C', 'Entropy Cascade', 'The entropy of the system is increasing rapidly. You are given a string representing the current state of chaos. Each second, adjacent characters may swap positions if they are different. Calculate the minimum number of seconds required to reach maximum entropy, defined as a state where no two adjacent characters are the same. If impossible, return -1.', 180, 3),
    (2, 'D', 'Time Loop Detection', 'A section of code is stuck in an infinite loop across time. You are given a directed graph representing temporal jumps. Detect if there exists a cycle in this graph. If a cycle exists, return the length of the shortest cycle. The implications of breaking such a loop could unravel the fabric of CodeVerse itself. Proceed with extreme caution.', 180, 4);

-- Round 3: Final confrontation problems, no hints, visible all at once
INSERT INTO public.problems (round_number, problem_code, title, statement, sort_order) VALUES
    (3, 'A', 'Core Logic Alpha', 'The first layer of the core logic has been exposed. Solve the primary decryption challenge.', 1),
    (3, 'B', 'Core Logic Beta', 'The second layer requires pattern recognition across multiple dimensions.', 2),
    (3, 'C', 'Core Logic Gamma', 'The third layer tests your understanding of recursive structures.', 3),
    (3, 'D', 'Core Logic Delta', 'The fourth layer combines all previous concepts in a final synthesis.', 4),
    (3, 'E', 'The Impossible Script', 'This is it. The final challenge. Erevos-901 watches. Prove your worth.', 5);