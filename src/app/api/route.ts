import { Octokit } from "octokit";

// TypeScript defs

interface ContentTreeEntry {
  type: string;
  size: number;
  name: string;
  path: string;
  content: string;
  sha: string;
  url: string;
  git_url?: string | null;
  html_url?: string | null;
  download_url?: string | null;
  _links: {
    git: string | null;
    html: string | null;
    self: string;
  };
}

interface ContentTree {
  type: string;
  size: number;
  name: string;
  path: string;
  sha: string;
  url: string;
  git_url?: string | null;
  html_url?: string | null;
  download_url?: string | null;
  entries: ContentTreeEntry[];
  _links: {
    git: string | null;
    html: string | null;
    self: string;
  };
}

// The required properties for ContentTree
const contentTreeRequired: Array<keyof ContentTree> = [
  "_links",
  "git_url",
  "html_url",
  "download_url",
  "name",
  "path",
  "sha",
  "size",
  "type",
  "url",
];

// The required properties for ContentTreeEntry
const contentTreeEntryRequired: Array<keyof ContentTreeEntry> = [
  "_links",
  "git_url",
  "html_url",
  "download_url",
  "name",
  "path",
  "sha",
  "size",
  "type",
  "url",
];

// Route
export async function POST(req: Request) {
  console.log("Processing");
  const { repo, token, allowedExtensions } = (await req.json()) as {
    allowedExtensions: string[];
    repo: string;
    token: string;
  };

  // Create a new GitHub Octokit for every request
  const octokit = new Octokit({
    auth: token,
  });

  const files = [];
  const dirPaths: string[] = [""];

  // Get every file inside of repo recursively
  while (dirPaths.length > 0) {
    const currentPath = dirPaths.pop();

    const contents = await octokit.request(
      `GET /repos/${repo}/contents/${currentPath}`,
      {
        owner: "OWNER",
        repo: "REPO",
        path: "PATH",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    // Now for every directory we need to find the files inside
    const data: ContentTreeEntry[] = contents.data;
    files.push(...data.filter((it) => it.type === "file"));
    dirPaths.push(
      ...data.filter((it) => it.type === "dir").map((it) => it.path)
    );
  }

  // Filter out files that aren't allowed extensions
  const allowedFiles = files.filter((it) =>
    allowedExtensions.some((extension) =>
      it.path.toLowerCase().endsWith(`.${extension.toLowerCase()}`)
    )
  );

  let text = "";

  // Once file is found, get download URL
  for (const file of allowedFiles) {
    if (!file.download_url) continue;

    console.log(file.path);

    const download = await fetch(file.download_url);
    text += `\n\n${file.path}\n
    ${await download.text()}`;
  }

  return Response.json({ contents: text });
}
