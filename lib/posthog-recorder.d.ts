// posthog-js ships dist/posthog-recorder.js without a declaration file.
// Importing it is side-effect only (registers the session-replay recorder,
// including the initSessionRecording extension the SDK waits for), so an
// empty module shape is accurate.
declare module "posthog-js/dist/posthog-recorder";
