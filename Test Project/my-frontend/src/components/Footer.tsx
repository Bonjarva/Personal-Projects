export default function Footer() {
  return (
    <footer className="bg-white shadow-inner mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} My Tasks App. All rights reserved.
      </div>
    </footer>
  );
}
