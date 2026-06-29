import { Button } from "@/components/ui/button";

interface Props {
  option: string;
  onClick: (answer: string) => void;
}

const AnswerButton = ({ option, onClick }: Props) => {
  return (
    <Button
      className="w-full"
      variant="outline"
      onClick={() => onClick(option)}
    >
      {option}
    </Button>
  );
};

export default AnswerButton;