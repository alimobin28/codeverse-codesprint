import { RoundTemplate } from "./RoundTemplate";

const Round3 = () => {
  return (
    <RoundTemplate
      roundNumber={3}
      title="Core Logic Confrontation"
      backgroundImage="/e4.png"
      allowedProblems={["A", "B", "C", "D", "E", "F"]}
      warningMessage="Critical System Failure imminent. Focus is critical."
      showHints={true} // Hints enabled for all rounds now
    />
  );
};

export default Round3;