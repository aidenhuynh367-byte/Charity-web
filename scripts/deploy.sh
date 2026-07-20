#!/usr/bin/env bash
# Deploy charity-web to Firebase App Hosting, then remount Cloud SQL.
#
# App Hosting builds do not reliably keep the Cloud SQL Unix socket attached.
# After each deploy we redeploy the same image with --add-cloudsql-instances
# and shift traffic to that revision.
#
# Usage (from repo root):
#   ./scripts/deploy.sh
#   npm run deploy

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PROJECT="${FIREBASE_PROJECT:-charity-link-f61ff}"
REGION="${CLOUD_RUN_REGION:-asia-southeast1}"
SERVICE="${CLOUD_RUN_SERVICE:-charity-link-backend}"
CLOUDSQL_INSTANCE="${CLOUDSQL_INSTANCE:-project-3735bbba-0864-4d45-a7a:asia-southeast2:free-trial-first-project}"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "error: gcloud is required (Cloud SQL remount step)." >&2
  exit 1
fi

echo "==> Deploying to Firebase App Hosting (project: $PROJECT)..."
npx -y firebase-tools@latest deploy --project "$PROJECT"

echo "==> Locating App Hosting revision image..."
READY_REV="$(
  gcloud run services describe "$SERVICE" \
    --project="$PROJECT" \
    --region="$REGION" \
    --format='value(status.latestReadyRevisionName)'
)"
if [[ -z "$READY_REV" ]]; then
  echo "error: could not determine latestReadyRevisionName for $SERVICE" >&2
  exit 1
fi

IMAGE="$(
  gcloud run revisions describe "$READY_REV" \
    --project="$PROJECT" \
    --region="$REGION" \
    --format='value(spec.containers[0].image)'
)"
if [[ -z "$IMAGE" ]]; then
  echo "error: could not read container image from $READY_REV" >&2
  exit 1
fi

echo "    Revision: $READY_REV"
echo "    Image:    $IMAGE"

echo "==> Remounting Cloud SQL ($CLOUDSQL_INSTANCE)..."
gcloud run deploy "$SERVICE" \
  --project="$PROJECT" \
  --region="$REGION" \
  --image="$IMAGE" \
  --add-cloudsql-instances="$CLOUDSQL_INSTANCE" \
  --quiet

NEW_REV="$(
  gcloud run revisions list \
    --service="$SERVICE" \
    --project="$PROJECT" \
    --region="$REGION" \
    --limit=1 \
    --sort-by=~metadata.creationTimestamp \
    --format='value(metadata.name)'
)"
if [[ -z "$NEW_REV" ]]; then
  echo "error: could not find new Cloud Run revision after remount" >&2
  exit 1
fi

echo "==> Routing 100% traffic to $NEW_REV..."
gcloud run services update-traffic "$SERVICE" \
  --project="$PROJECT" \
  --region="$REGION" \
  --to-revisions="$NEW_REV=100"

echo "==> Checking Cloud SQL annotation on serving revision..."
ATTACHED="$(
  gcloud run revisions describe "$NEW_REV" \
    --project="$PROJECT" \
    --region="$REGION" \
    --format='value(metadata.annotations[run.googleapis.com/cloudsql-instances])'
)"
if [[ -z "$ATTACHED" ]]; then
  echo "error: serving revision $NEW_REV has no Cloud SQL instances attached" >&2
  exit 1
fi

echo
echo "Deploy complete."
echo "  Service:   $SERVICE"
echo "  Revision:  $NEW_REV"
echo "  Cloud SQL: $ATTACHED"
echo "  URL:       https://${SERVICE}--${PROJECT}.${REGION}.hosted.app"
