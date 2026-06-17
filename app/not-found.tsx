import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-extrabold text-blue-600 mb-2">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-400 text-sm max-w-xs mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
        >
          Go Home
        </Link>
        <Link
          href="/businesses"
          className="bg-white border border-gray-200 hover:border-blue-400 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition"
        >
          Browse Businesses
        </Link>
      </div>
    </div>
  );
}
