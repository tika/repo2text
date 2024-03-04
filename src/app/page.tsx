"use client";

import { useState } from "react";

export default function Home() {
  const [token, setToken] = useState("");
  const [repo, setRepo] = useState(""); // {owner}/{repo}
  const [allowedExtensions, setAllowedExtensions] = useState(
    ["tsx", "ts", "example", "json", "js", "css", "html", "prisma"].join(",")
  );
  const [output, setOutput] = useState("");

  async function run() {
    const data = await fetch("/api", {
      method: "POST",
      body: JSON.stringify({
        repo,
        token,
        allowedExtensions: allowedExtensions.split(","),
      }),
    }).then((res) => res.json());

    setOutput(data.contents);
  }

  return (
    <main className="px-64 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Repo2Text</h1>
        <h2>Converts a GitHub repository to a text file</h2>
      </div>

      <form className="flex flex-col gap-4">
        <label>GitHub API Token</label>
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="text-black rounded-md px-4 py-2"
        />

        <label>Repository</label>
        <input
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          className="text-black rounded-md px-4 py-2"
        />

        <label>Allowed Extensions (format: tsx,ts,env,example...)</label>
        <input
          value={allowedExtensions}
          onChange={(e) => setAllowedExtensions(e.target.value)}
          className="text-black rounded-md px-4 py-2"
        />

        <button onClick={run} className="bg-blue-700 px-4 py-2 rounded-md">
          Get contents
        </button>
      </form>
      <pre>{output}</pre>
    </main>
  );
}
