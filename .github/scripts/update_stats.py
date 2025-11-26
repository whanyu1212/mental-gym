#!/usr/bin/env python3
"""
Script to count unique problems solved and update README badges.
Counts unique problems, not individual language implementations.
"""

import re
import sys

def count_leetcode_problems(readme_content):
    """Count unique LeetCode problems by problem number."""
    # Match table rows with problem numbers like: | 1 | Two Sum | ...
    # Capture the problem number in the first column
    pattern = r'\|\s*(\d+)\s*\|.*?\|.*?\|.*?\|.*?\|.*?\|'

    # Find all problem numbers in LeetCode section
    if '## LeetCode Questions' not in readme_content:
        print("⚠️  Warning: '## LeetCode Questions' section not found")
        return 0

    sections = readme_content.split('## LeetCode Questions')
    if len(sections) < 2:
        print("⚠️  Warning: Could not split LeetCode section properly")
        return 0

    # Get content after LeetCode Questions header, up to next ## header or end of file
    leetcode_section = sections[1].split('\n## ')[0] if '\n## ' in sections[1] else sections[1]
    problem_numbers = re.findall(pattern, leetcode_section)

    # Return count of unique problem numbers
    unique_problems = set(problem_numbers)
    return len(unique_problems)

def count_kattis_problems(readme_content):
    """Count unique Kattis problems by problem ID."""
    # Find Kattis section
    if '## Kattis Problems' not in readme_content:
        print("⚠️  Warning: '## Kattis Problems' section not found")
        return 0

    sections = readme_content.split('## Kattis Problems')
    if len(sections) < 2:
        print("⚠️  Warning: Could not split Kattis section properly")
        return 0

    # Get content after Kattis Problems header, up to next ## header or end of file
    kattis_section = sections[1].split('\n## ')[0] if '\n## ' in sections[1] else sections[1]

    # Match table rows, count rows in Kattis table (excluding header)
    # Each row represents a unique problem
    pattern = r'\|\s*\d+\s*\|.*?\|.*?\|.*?\|.*?\|.*?\|'
    problem_rows = re.findall(pattern, kattis_section)

    return len(problem_rows)

def update_readme_badges(readme_path):
    """Update the progress badges in README header with current counts."""

    # Read README
    with open(readme_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Count problems
    leetcode_count = count_leetcode_problems(content)
    kattis_count = count_kattis_problems(content)
    total_count = leetcode_count + kattis_count

    print(f"📊 Problem counts:")
    print(f"  LeetCode: {leetcode_count}")
    print(f"  Kattis: {kattis_count}")
    print(f"  Total: {total_count}")

    # Update LeetCode badge (with clickable link and logo)
    content = re.sub(
        r'\[!\[LeetCode\]\(https://img\.shields\.io/badge/LeetCode-\d+_Solved-FFA116\?style=flat&logo=leetcode\)\]\(https://leetcode\.com\)',
        f'[![LeetCode](https://img.shields.io/badge/LeetCode-{leetcode_count}_Solved-FFA116?style=flat&logo=leetcode)](https://leetcode.com)',
        content
    )

    # Update Kattis badge (with clickable link)
    content = re.sub(
        r'\[!\[Kattis\]\(https://img\.shields\.io/badge/Kattis-\d+_Solved-00A6A6\?style=flat\)\]\(https://open\.kattis\.com\)',
        f'[![Kattis](https://img.shields.io/badge/Kattis-{kattis_count}_Solved-00A6A6?style=flat)](https://open.kattis.com)',
        content
    )

    # Update DSA badge (total topics count - keeping at 9 as it's DSA implementations, not problems)
    # This badge doesn't need to change based on problems solved

    # Write back to README
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ Updated badges in {readme_path}")

    return leetcode_count, kattis_count, total_count

if __name__ == '__main__':
    readme_path = sys.argv[1] if len(sys.argv) > 1 else 'README.md'

    try:
        update_readme_badges(readme_path)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
