import { Octokit } from "@octokit/rest";
import { scanText, type Finding } from "./scanner.js";

export interface GithubScanOptions {
  token: string;
  /** Hanya memindai repo di bawah login/org ini. Wajib diisi secara eksplisit. */
  owner: string;
  /** Jika true, memindai juga repo privat yang bisa diakses token (default: hanya publik). */
  includePrivate?: boolean;
}

/**
 * Memindai repo milik satu akun/organisasi GitHub (default: hanya repo publik).
 * Dirancang untuk memindai akun/organisasi SENDIRI atau yang sudah memberi izin eksplisit —
 * bukan untuk memindai repo pihak lain tanpa izin.
 */
export async function scanGithubOwner(options: GithubScanOptions): Promise<Finding[]> {
  const octokit = new Octokit({ auth: options.token });
  const findings: Finding[] = [];

  const repos = await octokit.paginate(octokit.repos.listForUser, {
    username: options.owner,
    per_page: 100,
  });

  for (const repo of repos) {
    if (repo.private && !options.includePrivate) continue;
    if (repo.archived) continue;

    let tree;
    try {
      tree = await octokit.git.getTree({
        owner: options.owner,
        repo: repo.name,
        tree_sha: repo.default_branch ?? "main",
        recursive: "true",
      });
    } catch {
      continue; // repo kosong atau branch default tidak ditemukan
    }

    for (const item of tree.data.tree) {
      if (item.type !== "blob" || !item.path || !item.sha) continue;
      if (item.size && item.size > 2 * 1024 * 1024) continue;

      try {
        const blob = await octokit.git.getBlob({
          owner: options.owner,
          repo: repo.name,
          file_sha: item.sha,
        });
        const content = Buffer.from(blob.data.content, "base64").toString("utf-8");
        const fileFindings = scanText(content, `${repo.name}/${item.path}`);
        findings.push(...fileFindings);
      } catch {
        continue;
      }
    }
  }

  return findings;
}
