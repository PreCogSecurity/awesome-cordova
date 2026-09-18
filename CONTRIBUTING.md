# Contributing to Awesome Cordova

Thanks for taking the time to contribute! This is a curated list of Cordova
libraries, resources, and tools. Keeping the list accurate and useful is a
community effort, and every small contribution helps.

## How to add or update an entry

1. **Fork** this repository and create a branch for your change.
2. **Edit `README.md`** and add your entry under the most relevant section.
   - Use the exact format `- [Name](url)` with a descriptive display name.
   - Place the entry in alphabetical order within its section.
   - Only add resources that are actively maintained and genuinely useful to
     Cordova developers.
3. **Keep changes small and focused.** One pull request per resource addition,
   removal, or correction. Avoid mixing unrelated edits in a single PR.
4. **Run the checks locally** before opening the pull request:

   ```sh
   npm ci
   npm run validate
   ```

   This runs the markdown linter, the list-structure validator, and a link
   check against every URL in the README. All three must pass.

5. **Open a pull request** describing what you added and why. The CI workflow
   re-runs the same checks automatically on every push and pull request.

## Removing or replacing entries

If a link is dead or a project is no longer maintained, open a pull request
that removes the entry (or replaces it with the current canonical URL). The
link check in CI will also flag dead links, so fixing them keeps the list
healthy.

## Code of conduct

Be respectful and constructive. This project is a community resource; treat
other contributors the way you would like to be treated.