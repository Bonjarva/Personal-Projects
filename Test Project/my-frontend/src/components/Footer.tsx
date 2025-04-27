import { SiGithub, SiLinkedin } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white px-4 py-8 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl space-y-6 text-center md:flex md:items-center md:justify-between md:space-y-0">
        {/* Left: Copyright */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} MyTasks. All rights reserved.
        </div>

        {/* Center: Nav links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {["About", "Docs", "Privacy", "Contact"].map((label) => (
            <a
              key={label}
              href={`/${label.toLowerCase()}`}
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right: Social Icons */}
        <div className="flex justify-center gap-4">
          <a
            href="https://github.com/Bonjarva"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="group"
          >
            <SiGithub
              size={24}
              className="transition-colors group-hover:text-gray-800 dark:group-hover:text-white"
            />
          </a>
          <a
            href="https://linkedin.com/in/jaydin-mcmullan"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="group"
          >
            <SiLinkedin
              size={24}
              className="transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-300"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
