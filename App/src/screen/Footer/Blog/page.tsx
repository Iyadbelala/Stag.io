import Link from "next/link";

const posts = [
  {
    title: "How to Land Your First Internship",
    excerpt:
      "Practical tips for students entering the job market, from crafting your CV to acing the interview.",
    date: "Feb 10, 2026",
    tag: "Students",
  },
  {
    title: "Why Internships Matter for Your Company",
    excerpt:
      "Discover how hosting interns can bring fresh perspectives and build your future talent pipeline.",
    date: "Feb 5, 2026",
    tag: "Companies",
  },
  {
    title: "Streamlining Internship Administration",
    excerpt:
      "How Stag.io helps universities move from paperwork to a fully digital validation workflow.",
    date: "Jan 28, 2026",
    tag: "Administration",
  },
  {
    title: "Building a Strong Internship Profile",
    excerpt:
      "What recruiters look for and how to make your Stag.io profile stand out from the crowd.",
    date: "Jan 20, 2026",
    tag: "Students",
  },
];

export default function BlogPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <h1 className="font-heading text-4xl font-bold tracking-tight text-coffee-dark">
        Blog
      </h1>
      <p className="mt-3 text-text-secondary">
        Insights, tips, and news about internships and the Stag.io platform.
      </p>

      <div className="mt-12 flex flex-col gap-8">
        {posts.map((post) => (
          <article
            key={post.title}
            className="rounded-[--radius-card] border border-surface-sand bg-surface-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span className="rounded-full bg-coffee-gold/20 px-3 py-0.5 font-medium text-coffee-warm">
                {post.tag}
              </span>
              <time>{post.date}</time>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-coffee-dark">
              {post.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {post.excerpt}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link
          href="/"
          className="text-sm font-medium text-coffee-warm hover:text-coffee-gold transition-colors"
        >
          &larr; Back to Home
        </Link>
      </div>
    </section>
  );
}
