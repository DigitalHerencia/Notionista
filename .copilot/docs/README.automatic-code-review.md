---
created: 2025-12-11T20:05:24 (UTC -07:00)
tags: [Copilot]
source: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review/configure-automatic-review
author:
---

# Configuring automatic code review by GitHub Copilot - GitHub Docs

> ## Excerpt
>
> Learn how to configure Copilot to automatically review pull requests.

---

Learn how to configure Copilot to automatically review pull requests.

## Introduction

This article tells you how to set up Copilot code review to review pull requests automatically. For an overview of automatic pull request reviews, see About GitHub Copilot code review.

The three sections in this article tell you how to configure automatic code review for:

- Pull requests that you create yourself
- All new pull requests in a repository
- Pull requests in multiple repositories owned by an organization

## Configuring automatic code review for your own pull requests

Note

This is only available if you are on the Copilot Pro or Copilot Pro+ plan.

1. In the upper-right corner of any page, click your profile picture, then click **Copilot settings**.

2. Locate the **Automatic Copilot code review** option and click the dropdown button.

3. In the dropdown menu, select **Enabled**.

## Configuring automatic code review for a single repository

1. On GitHub, navigate to the main page of the repository.

2. Under your repository name, click **Settings**. If you cannot see the "Settings" tab, select the dropdown menu, then click **Settings**.

3. In the left sidebar, under "Code and automation," click **Rules**, then click **Rulesets**.

4. Click **New ruleset**.

5. Click **New branch ruleset**.

6. Under "Ruleset name," type a name for the ruleset.

7. To activate the ruleset, under "Enforcement Status", select **Active**.

8. Under "Target branches," click **Add target** and choose one of the options—for example, **Include default branch** or **Include all branches**.

9. Under "Target branches," click **Add target** and choose one of the target options.

10. Under "Branch rules," select **Automatically request Copilot code review**.

    This expands a set of subsidiary options.

11. Optionally, if you want Copilot to review all new pushes to the pull request, select **Review new pushes**.

    If this option is not selected, Copilot will only review the pull request once.

12. Optionally, if you want Copilot to review pull requests while they are still drafts, select the **Review draft pull requests**.

    This can be a useful option for catching errors early, before requesting a human review.

13. At the bottom of the page, click **Create**.

## Configuring automatic code review for repositories in an organization

1. In the upper-right corner of GitHub, click your profile picture, then click **Organizations**.

2. Next to the organization, click **Settings**.

3. In the left sidebar, in the "Code, planning, and automation" section, click **Repository**, then click **Rulesets**.

4. Click **New ruleset**.

5. Click **New branch ruleset**.

6. Under "Ruleset name," type a name for the ruleset.

7. To activate the ruleset, under "Enforcement Status", select **Active**.

8. Under "Target repositories," click **Add target** and choose either **Include by pattern** or **Exclude by pattern**.

9. In the dialog box that's displayed, type a pattern that will match the names of repositories in your organization—for example, `*feature` to match all repositories with names that end in `feature`.

   For information about pattern-matching syntax, see Creating rulesets for repositories in your organization.

10. In the dialog box, click **Add inclusion pattern** or **Add exclusion pattern**.

11. Repeat the process for any additional patterns you want to add.

    Note

    You can add multiple targeting criteria to the same ruleset. Exclusion patterns are applied after inclusion patterns. For example, you could include any repositories matching the pattern `*cat*`, and specifically exclude a repository matching the pattern `not-a-cat`.

12. Under "Target branches," click **Add target** and choose one of the target options.

13. Under "Branch rules," select **Automatically request Copilot code review**.

    This expands a set of subsidiary options.

14. Optionally, if you want Copilot to review all new pushes to the pull request, select **Review new pushes**.

    If this option is not selected, Copilot will only review the pull request once.

15. Optionally, if you want Copilot to review pull requests while they are still drafts, select the **Review draft pull requests**.

    This can be a useful option for catching errors early, before requesting a human review.

16. At the bottom of the page, click **Create**.
