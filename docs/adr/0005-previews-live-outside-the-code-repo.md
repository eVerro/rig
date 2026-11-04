# 0005 · Previews live outside the code repo

- Status: accepted · 2026-11-04
- Refines: 0003 (previews are public and short-lived)

## Context

ADR 0003 says a preview is a public, short-lived copy that loses its lane marker once its review
is in. It also says: no previews in the repo, in issues, or in chat. But it does not say where a
preview should live, and the obvious host for a repo's page — GitHub Pages served from that same
repo — puts the preview back inside the code repo, where ADR 0003 forbids it. A marked page then
sits in git history even after the clean-up step overwrites the live file.

## Decision

- A preview goes to a **separate** public host, never the code repo: a dedicated Pages repo, a
  bucket, or any static host with a public HTTPS link we can upload over.
- The link is checked the way the reviewer opens it (a fetch of the public URL, not a local file)
  before it is sent, and again after the marker is removed.
- The preview host can be deleted or overwritten freely; the code repo's history never carries a
  marked page.

## Consequences

- The clean-up step (ADR 0003) is a re-upload over the same link, not a commit to the code repo.
- One reusable step covers publish and marker-strip for every plan that ends in a review.
- A marked page never enters the code repo's history, so there is nothing to scrub there later.
