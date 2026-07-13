const teamMembers = [
  {
    name: "Alexander Shabanovich",
    role: "Developer",
    github: "https://github.com/shalick",
  },
];

const technologies = ["Next.js", "React", "TypeScript", "Tailwind CSS", "OpenAPI tooling"];

const resources = [
  { label: "RS School", href: "https://rs.school/" },
  { label: "OpenAPI Specification", href: "https://spec.openapis.org/oas/latest.html" },
  { label: "Swagger Editor", href: "https://editor.swagger.io/" },
];

export default function AboutPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col gap-10 px-6 py-16 lg:px-8 lg:py-20">
      <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-10">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">
          About Swagger Studio
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          A polished workspace for learning, inspecting, and testing APIs.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          This project was built as a practical showcase for the RS School React course, combining an OpenAPI-focused editor, request tooling, and a guided developer experience in one place.
        </p>
      </section>

      <section className="grid gap-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-2xl font-semibold tracking-tight">RS School course</h2>
          <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">
            Swagger Studio is designed to reflect the spirit of the RS School learning path: practical implementation, modern frontend architecture, and a focus on real-world developer workflows.
          </p>
          <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">
            The app helps learners connect spec authoring, request building, and validation in a single interface, making API concepts easier to understand and explore.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-2xl font-semibold tracking-tight">Team</h2>
          <div className="mt-6 space-y-4">
            {teamMembers.map((member) => (
              <div key={member.name} className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-200 px-4 py-4 dark:border-zinc-800">
                <div>
                  <p className="font-semibold text-zinc-950 dark:text-white">{member.name}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">{member.role}</p>
                </div>
                <a
                  href={member.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-200 dark:hover:text-white"
                >
                  GitHub
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-2xl font-semibold tracking-tight">Technologies</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                {tech}
              </span>
            ))}
          </div>

          <h2 className="mt-8 text-2xl font-semibold tracking-tight">Resources</h2>
          <ul className="mt-4 space-y-3 text-base text-zinc-600 dark:text-zinc-300">
            {resources.map((resource) => (
              <li key={resource.label}>
                <a href={resource.href} target="_blank" rel="noreferrer" className="font-medium text-zinc-950 transition hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300">
                  {resource.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
