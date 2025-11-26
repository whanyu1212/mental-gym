# README Stats Automation

This directory contains scripts to automatically update the progress statistics badges in the README header.

## How It Works

### Problem Counting Logic

The automation counts **unique problems**, not individual language implementations:

- **LeetCode**: Counts unique problem numbers (e.g., problem #1, #242, etc.)
  - "Two Sum" in Python + Julia = **1 problem**
  - Each unique problem number is counted once

- **Kattis**: Counts unique problem IDs from the table
  - Each row in the Kattis table = **1 unique problem**

### What Gets Updated

The script automatically updates **only the badges in the header section** of README.md:
- `LeetCode-XX_Solved` badge (top of README)
- `Kattis-XX_Solved` badge (top of README)

The `DSA_Implementations` badge is NOT auto-updated (it tracks DSA topics, not problems solved).

### Files

- `update_stats.py` - Python script that parses README.md and updates badge counts in the header
- `../workflows/update-stats.yml` - GitHub Action that runs the script automatically

## Manual Usage

Run the script locally:

```bash
python .github/scripts/update_stats.py README.md
```

## Automated Updates

The GitHub Action runs automatically when:
- You push changes to `main` or `hy-dev` branches
- Changes are made to:
  - `README.md`
  - Files in `src/leetcode/`
  - Files in `src/kattis/`
- You manually trigger it via the Actions tab

## Adding New Problems

Just add the problem to your README table as usual. The header badges will auto-update on your next push!

**Example:** When you add problem #347 to the README table, the next push will automatically update the header badge from `LeetCode-27_Solved` to `LeetCode-28_Solved`.
