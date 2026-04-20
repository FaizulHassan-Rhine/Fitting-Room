export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-white"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div
        className="w-14 h-14 rounded-full border-4 border-light-gray border-t-black animate-spin"
        aria-hidden
      />
    </div>
  );
}
