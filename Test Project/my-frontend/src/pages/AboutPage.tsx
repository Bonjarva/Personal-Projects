export default function AboutPage() {
  return (
    <div className="prose mx-auto py-12 px-4">
      <h1>About MyTasks</h1>
      <p>
        MyTasks is a simple, secure task-management app built with React,
        TypeScript, Tailwind CSS, and an ASP.NET Core back end. Our goal is to
        help you stay organized and boost productivity.
      </p>
      <p>
        This project is open-source on{" "}
        <a
          href="https://github.com/Bonjarva/Personal-Projects"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          GitHub
        </a>
        .
      </p>
    </div>
  );
}
