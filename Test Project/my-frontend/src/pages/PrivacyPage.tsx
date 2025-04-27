export default function PrivacyPage() {
  return (
    <div className="prose mx-auto py-12 px-4">
      <h1>Privacy Policy</h1>
      <p>
        Your data is yours. We only store what’s needed to provide the
        task-management service:
      </p>
      <ul>
        <li>Email (for login)</li>
        <li>Task content</li>
        <li>Authentication tokens (securely hashed/stored)</li>
      </ul>
      <p>
        We do not share your information with any third parties. Full details
        will be added soon.
      </p>
    </div>
  );
}
