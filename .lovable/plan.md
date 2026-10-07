# History, CSV Export, and Dashboard Totals

## What will change
- Replace the sample prediction rows with the actual successful classifications saved by the app.
- Keep breed/ID search, animal-type filtering, and pagination; make the table respond cleanly when the search or filter changes and when there are no saved predictions.
- Export the currently filtered prediction results as a properly escaped CSV file, including date, animal type, breed, and confidence.
- Replace invented dashboard totals, charts, and activity with summaries derived from the same saved predictions: total predictions/images, today's count, average confidence, cow/buffalo counts, breed distribution, and recent activity.
- Keep the existing local-device history storage and its current 100-entry limit; do not add accounts or cloud storage.

## Technical approach
- Share the prediction-history shape and safe browser-storage helpers between classification, history, and dashboard views.
- Read browser storage after hydration to avoid server/client rendering mismatches; refresh visible history when the same-tab classification flow saves a new result.
- Add CSV download in the browser using the visible filtered results, with correct quoting for commas, quotes, and line breaks.
- Preserve the existing dashboard layout and design tokens, with explicit empty states when no saved results exist.
- Verify the history search/filter/pagination, CSV content, and dashboard summaries against saved test predictions in the running preview.
