export default function DocsPage() {
  return (
    <div className="prose mx-auto py-12 px-4">
      <h1>Documentation</h1>
      <p>Welcome to the API & usage guide. Below you’ll find:</p>
      <ul>
        <li>
          <strong>API Endpoints</strong> – how to authenticate and CRUD tasks.
        </li>
        <li>
          <strong>Front-end Usage</strong> – component overview & props.
        </li>
        <li>
          <strong>Deployment</strong> – getting it running in production.
        </li>
      </ul>

      <h2>Authentication</h2>
      <pre className="bg-gray-100 p-4 rounded">
        <code>
          POST /api/auth/register {"{ username, password }"}
          POST /api/auth/login {"{ username, password }"}
        </code>
      </pre>

      {/* Extend with more docs as you go */}
    </div>
  );
}
