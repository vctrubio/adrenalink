import { LandingHero } from "./landing-hero"
import { LandingDescription } from "./landing-description"
import { DevAboutMeFooter } from "./landing-footer"

export function LandingPage() {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1">
        <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
          <LandingHero />
          <LandingDescription />
          <DevAboutMeFooter />
        </div>
      </main>
    </div>
  )
}
