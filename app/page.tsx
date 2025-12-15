import { supabase } from "@/src/lib/supabase";

// This ensures the page refreshes data every time you visit (no stale cache)
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  // 1. Fetch guides from Supabase
  const { data: guides, error } = await supabase
    .from("guides")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-10 text-red-500">Error loading guides: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Guides</h1>
            <p className="text-gray-500 mt-1">Manage your interactive walkthroughs</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
            + New Guide
          </button>
        </header>

        {/* 2. List of Guides */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {guides && guides.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {guides.map((guide) => (
                <div key={guide.id} className="p-6 hover:bg-gray-50 transition flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {guide.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                        ACTIVE
                      </span>
                      <span>•</span>
                      <span>{guide.trigger_url}</span>
                      <span>•</span>
                      <span>{new Date(guide.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                  <a href={`/guide/${guide.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                  Edit
                  </a>
                    <button className="text-gray-600 hover:text-red-600 font-medium text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="p-12 text-center">
              <div className="inline-block p-4 bg-gray-100 rounded-full mb-4 text-4xl">
                📝
              </div>
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