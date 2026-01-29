#!/usr/bin/env python3
"""
Helper script to create Jira tickets with custom fields using jira-cli.

This script constructs the proper jira-cli command with support for:
- Work types: Epic, Story, Bug, A/B Test
- Custom fields: Components, Platform
- Standard fields: Summary, Description, Status
"""

import argparse
import json
import subprocess
import sys


def create_jira_ticket(
    work_type: str,
    summary: str,
    description: str,
    components: str = "Dev",
    platform: str = "Dev",
    parent_epic: str = None,
):
    """
    Create a Jira ticket using jira-cli.

    Args:
        work_type: Issue type (Epic, Story, Bug, or A/B Test)
        summary: Ticket summary/title
        description: Ticket description
        components: Components custom field value (default: Dev)
        platform: Platform custom field value (default: Dev)
        parent_epic: Optional parent epic key (e.g., PROJ-123)

    Returns:
        The created ticket key and URL
    """

    # Build the base command
    cmd = [
        "jira", "issue", "create",
        "-t", work_type,
        "-s", summary,
        "-b", description,
        "--no-input",
    ]

    # Add parent epic if provided
    if parent_epic:
        cmd.extend(["-P", parent_epic])

    # Add custom fields for Components and Platform
    # Note: Custom field IDs may need to be adjusted based on your Jira instance
    # Use 'jira issue create' interactively once to see available custom fields
    custom_fields = {
        "Components": components,
        "Platform": platform,
    }

    for field_name, field_value in custom_fields.items():
        cmd.extend(["--custom", f"{field_name}={field_value}"])

    # Execute the command
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True,
        )

        # Parse output to extract ticket key
        # The jira-cli typically outputs something like "✓ Issue created: PROJ-123"
        output = result.stdout.strip()
        print(output)

        # Try to extract the issue key
        for line in output.split("\n"):
            if "Issue created:" in line or "created" in line.lower():
                # Extract the issue key (e.g., PROJ-123)
                parts = line.split()
                for part in parts:
                    if "-" in part and part.replace("-", "").replace(":", "").isalnum():
                        issue_key = part.rstrip(":")
                        # Get the Jira base URL from config to construct full URL
                        # For now, just return the key and user can construct URL
                        print(f"\n✓ Ticket created: {issue_key}")
                        print(f"View ticket: jira issue view {issue_key}")
                        return issue_key

        return None

    except subprocess.CalledProcessError as e:
        print(f"Error creating Jira ticket: {e.stderr}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Create Jira tickets with custom fields using jira-cli"
    )
    parser.add_argument(
        "-t", "--type",
        required=True,
        choices=["Epic", "Story", "Bug", "A/B Test"],
        help="Work type",
    )
    parser.add_argument(
        "-s", "--summary",
        required=True,
        help="Ticket summary/title",
    )
    parser.add_argument(
        "-b", "--description",
        required=True,
        help="Ticket description",
    )
    parser.add_argument(
        "-c", "--components",
        default="Dev",
        help="Components value (default: Dev)",
    )
    parser.add_argument(
        "-p", "--platform",
        default="Dev",
        help="Platform value (default: Dev)",
    )
    parser.add_argument(
        "-P", "--parent",
        help="Parent epic key (e.g., PROJ-123)",
    )

    args = parser.parse_args()

    create_jira_ticket(
        work_type=args.type,
        summary=args.summary,
        description=args.description,
        components=args.components,
        platform=args.platform,
        parent_epic=args.parent,
    )


if __name__ == "__main__":
    main()
