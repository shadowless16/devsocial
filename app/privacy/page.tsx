import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/auth/signup">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Signup
            </Button>
          </Link>
        </div>
        
        <Card className="shadow-xl border">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
            <p className="text-center text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-gray dark:prose-invert max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                <p className="text-muted-foreground">
                  We collect information you provide directly to us, such as when you create an account, 
                  update your profile, or communicate with us. This includes your name, email address, 
                  username, and any other information you choose to provide.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-2">We use the information we collect to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices and support messages</li>
                  <li>Communicate with you about products, services, and events</li>
                  <li>Monitor and analyze trends and usage</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
                <p className="text-muted-foreground">
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  without your consent, except as described in this policy. We may share your information 
                  in certain limited circumstances, such as with service providers who assist us in 
                  operating our platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement appropriate security measures to protect your personal information against 
                  unauthorized access, alteration, disclosure, or destruction. However, no method of 
                  transmission over the internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
                <p className="text-muted-foreground mb-2">You have the right to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of certain communications</li>
                  <li>Request a copy of your data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this privacy policy, please contact us at{" "}
                  <a href="mailto:privacy@devsocial.com" className="text-primary hover:underline">
                    privacy@devsocial.com
                  </a>
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}