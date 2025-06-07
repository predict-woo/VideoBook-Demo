import { z } from "zod";
import { InputContainer } from "./InputContainer";
import { Input } from "./Input";
import { Spacing } from "./Spacing";
import { CompositionProps } from "../../app/remotion/schemata";

export const RenderControls: React.FC<{
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  inputProps: z.infer<typeof CompositionProps>;
}> = ({ text, setText }) => {
  return (
    <InputContainer>
      <Input
        setText={setText}
        text={text}
      />
      <Spacing />
    </InputContainer>
  );
}; 