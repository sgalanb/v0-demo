import { MarketingHome } from "@/components/marketing-home"
import { PageHeader } from "@/components/page-header"
import { SignInButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { Button } from "@workspace/ui/components/button"

export default async function Home() {
  const { userId } = await auth()

  if (!userId) {
    return (
      <MarketingHome
        landingExtra={
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
            <h1 className="text-center font-semibold text-3xl text-v0-gray-1000 tracking-tight">
              Welcome to the v0-demo experiment
            </h1>
            <Button
              className="cursor-pointer"
              render={<SignInButton mode="redirect" />}
            >
              Get started
            </Button>
          </div>
        }
      />
    )
  }

  return (
    <>
      <PageHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 rounded-xl md:min-h-min">
          <h1 className="text-center font-semibold text-3xl text-v0-gray-1000 tracking-tight">
            What do you want to create?
          </h1>
          <form className="z-20 w-full max-w-2xl overflow-visible rounded-xl border border-v0-alpha-400 bg-v0-background-300 p-3 focus-within:border-v0-alpha-500 hover:cursor-not-allowed">
            <textarea
              className="max-h-[200px] min-h-[54px] w-full resize-none overflow-y-auto border-none bg-transparent pb-2 text-label-14 outline-none placeholder:text-v0-gray-900 disabled:cursor-not-allowed disabled:opacity-50 sm:text-[15px]"
              disabled
              placeholder="TODO: Ask v0 to build…"
            />
          </form>
        </div>
      </div>
    </>
  )
}
