import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-900 items-center justify-center">
      <div className="flex gap-8">
        <Link
          href="/3d"
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold rounded-lg transition-colors"
        >
          3D
        </Link>
        <Link
          href="/2d"
          className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-semibold rounded-lg transition-colors"
        >
          2D
        </Link>
      </div>
    </div>
  );
}
