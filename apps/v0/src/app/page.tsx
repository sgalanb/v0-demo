import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { MarketingHome } from "@/components/marketing-home";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    return <main className="flex flex-1 flex-col" />;
  }

  return (
    <MarketingHome
      landingExtra={
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
          <SignInButton mode="redirect">Get started</SignInButton>
        </div>
      }
    />
  );
}
