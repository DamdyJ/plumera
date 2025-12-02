import { Link } from "react-router";
import { Button } from "../../../components/ui/button";

export default function Hero() {
  return (
    <section className="p-4">
      <div className="relative grid min-h-[calc(100svh-6rem)] items-center p-4">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h1 className="text-5xl font-bold">
            Your AI career advisor, always ready to help.
          </h1>
          <p>
            Plumera analyzes your resume against job descriptions and tells you
            exactly what needs to change. Get a Job Match Score, find your
            weaknesses, and talk to an AI that understands your career.
          </p>
          <Button asChild className="spring-animation">
            <Link to={"/chat"}>Get started</Link>
          </Button>
        </div>
        <>
          <div className="absolute top-20 left-20 size-40 bg-green-200"></div>
          <div className="absolute top-80 right-20 size-40 bg-green-200"></div>
        </>
      </div>
      <div className="h-96 w-full rounded-lg bg-blue-200"></div>
    </section>
  );
}
