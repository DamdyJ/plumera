import { Button } from "../ui/button";

export default function ChatOption() {
  return (
    <>
      <div>
        <div>Hi there!</div>
        <p>What can i help you with?</p>
        <div>
          <Button variant={"outlinePrimary"}>Score</Button>
          <Button variant={"outlinePrimary"}>Summary</Button>
          <Button variant={"outlinePrimary"}>Advise</Button>
        </div>
      </div>
    </>
  );
}
