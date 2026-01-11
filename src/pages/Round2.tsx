import { RoundTemplate } from "./RoundTemplate";

const Round2 = () => {
  return (
    <RoundTemplate
      roundNumber={2}
      title="Failing Time Flow"
      contestId="779643"
      durationSeconds={55 * 60} 
      backgroundImage="/e3.png" 
      allowedProblems={['A', 'B', 'C', 'D', 'E']}
      warningMessage="Temporal instability detected. Focus required."
    />
  );
};

export default Round2;