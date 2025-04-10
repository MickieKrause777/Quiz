import SearchForm from "@/components/SearchForm";
import { quizQuery } from "@/database/queries";
import QuizCard from "@/components/QuizCard";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const query = (await searchParams).query;
  const posts = await quizQuery(query);

  return (
    <>
      <section className="primary_container blue-gradient">
        <h1 className="heading rounded-4xl">
          Pitch your Quiz, <br /> Play with your Friends
        </h1>

        <p className="sub-heading !max-w-3xl">Submit your Quizzes and Play</p>

        <SearchForm query={query} />
      </section>

      <section className="section_container">
        <p className="text-30-semibold">
          {query ? `Search results for ${query}` : "All Quizzes"}
        </p>

        <ul className="mt-7 card_grid">
          {posts?.length > 0 ? (
            posts.map((post: QuizTypeCard) => (
              <QuizCard key={post?.quizzes.id} post={post} />
            ))
          ) : (
            <p className="no-results">No Quizzes found</p>
          )}
        </ul>
      </section>
    </>
  );
}
