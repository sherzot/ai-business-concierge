import React from "react";

export function ProfileForm({ onSave }: { onSave?: (payload: { name: string; email: string; company: string }) => void }) {
  const [name, setName] = React.useState("Jasurbek Abdullayev");
  const [email, setEmail] = React.useState("jasurbek@example.com");
  const [company, setCompany] = React.useState("Acme Logistics LLC");

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">Profile</h3>
      <div className="space-y-3">
        <label className="text-xs text-slate-500">Full name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
        />
        <label className="text-xs text-slate-500">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
        />
        <label className="text-xs text-slate-500">Company</label>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => onSave?.({ name, email, company })}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
