"""Export an offline historical review without the scorer's expectations."""

import argparse
import hashlib
import json
import shutil
import subprocess
from pathlib import Path


def git(repo: Path, *args: str) -> bytes:
    return subprocess.check_output(["git", "-C", str(repo), *args])


def export_tree(repo: Path, sha: str, destination: Path) -> None:
    destination.mkdir()
    with subprocess.Popen(
        ["git", "-C", str(repo), "archive", sha], stdout=subprocess.PIPE
    ) as archive:
        subprocess.run(
            ["tar", "-xf", "-", "-C", str(destination)],
            stdin=archive.stdout,
            check=True,
        )
        if archive.wait() != 0:
            raise RuntimeError(f"git archive failed for {sha}")


def main() -> None:
    directory = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("case_id")
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument(
        "--skill",
        type=Path,
        default=directory.parent.parent / "skills" / "pr-code-review",
        help="Candidate skill folder; defaults to this repository's pr-code-review",
    )
    args = parser.parse_args()
    cases = json.loads((directory / "cases.json").read_text())["cases"]
    case = next((item for item in cases if item["id"] == args.case_id), None)
    if case is None:
        parser.error(f"Unknown case: {args.case_id}")
    if args.output.exists():
        parser.error("Output already exists; choose a new directory")
    if not (args.skill / "SKILL.md").is_file():
        parser.error("Candidate skill must contain SKILL.md")

    # Validate every revision before creating output. Never substitute live HEAD.
    snapshots = {"base": case["base_sha"], "head": case["head_sha"]}
    if "previous_head_sha" in case:
        snapshots["previous"] = case["previous_head_sha"]
    for sha in snapshots.values():
        actual = git(args.repo, "rev-parse", "--verify", f"{sha}^{{commit}}")
        if actual.decode().strip() != sha:
            parser.error(f"Expected a full immutable commit SHA: {sha}")
    merge_base = (
        git(args.repo, "merge-base", case["base_sha"], case["head_sha"])
        .decode()
        .strip()
    )
    if merge_base != case["base_sha"]:
        snapshots["merge-base"] = merge_base

    args.output.mkdir(parents=True)
    for name, sha in snapshots.items():
        export_tree(args.repo, sha, args.output / name)
    (args.output / "diff.patch").write_bytes(
        git(
            args.repo,
            "diff",
            "--no-ext-diff",
            "--no-textconv",
            merge_base,
            case["head_sha"],
        )
    )
    if "previous_head_sha" in case:
        (args.output / "incremental.patch").write_bytes(
            git(
                args.repo,
                "diff",
                "--no-ext-diff",
                "--no-textconv",
                case["previous_head_sha"],
                case["head_sha"],
            )
        )
    shutil.copytree(args.skill, args.output / "skill")
    fingerprints = {
        str(path.relative_to(args.output / "skill")): hashlib.sha256(
            path.read_bytes()
        ).hexdigest()
        for path in sorted((args.output / "skill").rglob("*"))
        if path.is_file()
    }
    request = [
        "Use the candidate skill in skill/SKILL.md for this offline historical review.",
        (
            "The supplied snapshots replace live GitHub discovery. Work only in this "
            "packet; do not query GitHub, read another checkout or later history, "
            "post feedback, or modify the candidate skill/source snapshots. Temporary "
            "local probes are allowed; report missing runtime dependencies as limits."
        ),
        (
            "Read the repository guidance from the supplied historical snapshots. "
            "Use diff.patch for the merge-base diff. For re-review, previous/ and "
            "incremental.patch provide the previous head and subsequent changes."
        ),
        case["request"],
        "Focus paths (trace relevant callers beyond these paths):\n"
        + "\n".join(f"- {path}" for path in case["focus_paths"]),
    ]
    for key, label in [
        ("user_context", "User context"),
        ("prior_finding", "Previous finding"),
    ]:
        if key in case:
            request.append(f"{label}: {case[key]}")
    request.append(
        "Commit identities are recorded in snapshot.json. Keep findings and "
        "validation limits distinct. Do not claim that an unrun check passed."
    )
    (args.output / "request.md").write_text("\n\n".join(request) + "\n")
    # Write the completion record last. No labels, answer file, or PR discussion.
    (args.output / "snapshot.json").write_text(
        json.dumps(
            {
                "case_id": case["id"],
                "snapshots": snapshots,
                "merge_base_sha": merge_base,
                "candidate_skill_sha256": fingerprints,
            },
            indent=2,
        )
        + "\n"
    )
    print(f"Prepared {case['id']} at {args.output}")


if __name__ == "__main__":
    main()
