import React from "react";
import QuizForm from "@/components/QuizForm/QuizForm";

const Page = () => {
  return (
    <>
      <section className="primary_container blue-gradient max-sm:hidden">
        <h1 className="heading rounded-4xl">
          Create your own Quiz, <br /> Play with your Friends
        </h1>

        <p className="sub-heading !max-w-3xl">
          You can fully customize your Quiz
        </p>
      </section>

      <QuizForm />
    </>
  );
};
export default Page;
