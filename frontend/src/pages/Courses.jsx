import { useState, useEffect } from "react";
import CourseCard from "../components/CourseCard";
import { Loader, ErrorBox, Empty, PageHeader, useLoad } from "../components/UI";
import { api } from "../api";

export default function Courses() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const cats = useLoad(() => api("/courses/categories"));

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const { data, loading, error } = useLoad(() => {
    const p = new URLSearchParams();
    if (debounced) p.set("q", debounced);
    if (category) p.set("category", category);
    if (difficulty) p.set("difficulty", difficulty);
    return api(`/courses?${p}`);
  }, [debounced, category, difficulty]);

  return (
    <main className="container page">
      <PageHeader
        title="Courses"
        subtitle="Find a course and start learning."
      />
      <div className="filters">
        <input
          type="search"
          placeholder="Search by title, topic or instructor"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search courses"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Category"
        >
          <option value="">All categories</option>
          {(cats.data?.categories || []).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          aria-label="Difficulty"
        >
          <option value="">Any difficulty</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </div>
      {loading && <Loader />}
      <ErrorBox message={error} />
      {!loading && !error && data?.courses.length === 0 && (
        <Empty title="No courses match your search">
          Try a different keyword or clear the filters.
        </Empty>
      )}
      <div className="grid grid-3">
        {(data?.courses || []).map((c) => (
          <CourseCard key={c._id} course={c} />
        ))}
      </div>
    </main>
  );
}
