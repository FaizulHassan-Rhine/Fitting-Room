export default function BrowseLoading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-white"
      role="status"
      aria-label="Loading"
    >
      <div
        className="w-14 h-14 rounded-full border-4 border-light-gray border-t-black animate-spin"
        aria-hidden
      />
    </div>
  );
}
