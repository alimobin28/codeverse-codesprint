import { RoundTemplate } from "./RoundTemplate";

const Round3 = () => {
  return (
    <RoundTemplate
      roundNumber={3}
      title="Core Logic Confrontation"
      contestId="779643"
      durationSeconds={55 * 60} 
      backgroundImage="/e4.png" 
      allowedProblems={['A', 'B', 'C', 'D', 'E']}
      warningMessage="Critical System Failure imminent. No hints available."
    />
  );
};

export default Round3;