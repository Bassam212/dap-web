import { supabase } from "@/src/lib/supabase";
import Link from "next/link";
import GuideCard from "@/src/components/GuideCard";
import { BarChart3, Plus, FileText } from "lucide-react";

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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Guides</h1>
            <p className="text-gray-500 mt-1">Manage your interactive walkthroughs</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/analytics"
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2"
            >
              <BarChart3 size={18} />
              View Analytics
            </Link>

            <button className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2">
              <Plus size={18} />
              New Guide
            </button>
          </div>
        </header>

        {guides && guides.length > 0 ? (
          <div className="space-y-4">
            {guides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
              <FileText size={48} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No guides yet</h3>
            <p className="text-gray-500 mt-1">
              Open your Chrome Extension on any website to create one!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}