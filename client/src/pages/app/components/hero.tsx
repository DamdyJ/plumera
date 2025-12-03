import { Link } from "react-router";
import { Button } from "../../../components/ui/button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden p-4">
      <div className="relative grid min-h-[calc(100svh-6rem)] items-center p-4">
        <div className="mx-auto max-w-3xl space-y-6 text-center z-10">
          <h1 className="text-5xl font-bold">
            Your AI career advisor, always ready to help.
          </h1>
          <p className="text-lg text-muted-foreground">
            Plumera analyzes your resume against job descriptions and tells you
            exactly what needs to change. Get a Job Match Score, find your
            weaknesses, and talk to an AI that understands your career.
          </p>
          <Button asChild className="spring-animation">
            <Link to={"/chat"}>Get started</Link>
          </Button>
        </div>

        {/* decorative blobs */}
        <div className="absolute top-20 left-20 h-40 w-40 rounded-full bg-green-200/60 blur-2xl transform-gpu" />
        <div className="absolute top-80 right-20 h-40 w-40 rounded-full bg-green-200/60 blur-2xl transform-gpu" />
      </div>

      {/* image area */}
      <div className="relative mt-8">
        {/* background shape behind image so transparency looks nice */}
        <div className="absolute -inset-x-8 -bottom-8 z-0 mx-auto h-60 max-w-4xl rounded-2xl bg-gradient-to-t from-white to-transparent dark:from-black/70 dark:to-transparent" />

        <img
          src="/hero_img.jpg"
          alt="hero-image"
          className="relative z-10 mx-auto max-w-[90rem] rounded-2xl object-cover w-full"
          // inline style for mask — tune the stops to change height/softness
          style={{
            // WebKit prefix for Safari
            WebkitMaskImage:
              "linear-gradient(to top, transparent 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.85) 40%, black 100%)",
            maskImage:
              "linear-gradient(to top, transparent 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.85) 40%, black 100%)",
          }}
        />
      </div>
    </section>
  );
}
