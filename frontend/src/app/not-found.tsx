import ErrorScreen from "@/Components/Shared/ErrorScreen";

export default function NotFound() {
  return (
    <ErrorScreen
      code="404"
      title="We couldn’t find that page"
      description="The link may be outdated, or the page may have moved. Go back to the previous page or sign in to your account."
    />
  );
}
