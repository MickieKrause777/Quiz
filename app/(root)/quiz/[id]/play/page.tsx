import QuizHeroSection from "@/components/QuizHeroSection";
import QuestionCard from "@/components/QuestionCard";
import { questionByQuizIdQuery } from "@/database/queries";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const _id = (await params).id;
  const post = await questionByQuizIdQuery(_id);
  const { questions } = post;

  return (
    <>
      <QuizHeroSection post={post} />

      <section className="section_container">
        <QuestionCard post={questions} />
      </section>
    </>
  );
};

export default Page;
