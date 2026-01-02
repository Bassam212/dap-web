import { supabase } from "@/src/lib/supabase";
import Link from "next/link";
import GuideRow from "@/src/components/GuideRow";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { data: guides, error } = await supabase
    .from("guides")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-10 text-red-500">Error loading guides: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Guides</h1>
            <p className="text-gray-500 mt-1">Manage your interactive walkthroughs</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/analytics"
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2"
            >
              📊 View Analytics
            </Link>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
              + New Guide
            </button>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {guides && guides.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {guides.map((guide) => (
                // FIX: Only render the component. Do not write HTML here.
                <GuideRow key={guide.id} guide={guide} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="inline-block p-4 bg-gray-100 rounded-full mb-4 text-4xl">📝</div>
              <h3 className="text-lg font-medium text-gray-900">No guides yet</h3>
              <p className="text-gray-500 mt-1">
                Open your Chrome Extension on any website to create one!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}