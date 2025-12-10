import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
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
            <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
            <p className="text-center text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-gray dark:prose-invert max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using DevSocial, you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, 
                  please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
                <p className="text-muted-foreground mb-2">
                  Permission is granted to temporarily use DevSocial for personal, non-commercial 
                  transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on the platform</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
                <p className="text-muted-foreground">
                  When you create an account with us, you must provide information that is accurate, 
                  complete, and current at all times. You are responsible for safeguarding the password 
                  and for all activities that occur under your account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Content Guidelines</h2>
                <p className="text-muted-foreground mb-2">Users agree not to post content that:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Is unlawful, harmful, threatening, abusive, or defamatory</li>
                  <li>Violates any intellectual property rights</li>
                  <li>Contains spam, advertising, or promotional material</li>
                  <li>Impersonates any person or entity</li>
                  <li>Contains malicious code or harmful links</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Privacy Policy</h2>
                <p className="text-muted-foreground">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs 
                  your use of the service, to understand our practices.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Termination</h2>
                <p className="text-muted-foreground">
                  We may terminate or suspend your account and bar access to the service immediately, 
                  without prior notice or liability, under our sole discretion, for any reason whatsoever 
                  and without limitation, including but not limited to a breach of the Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Disclaimer</h2>
                <p className="text-muted-foreground">
                  The information on this platform is provided on an &apos;as is&apos; basis. To the fullest extent 
                  permitted by law, this Company excludes all representations, warranties, conditions and 
                  terms relating to our platform and the use of this platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. We will notify users of any 
                  changes by posting the new Terms of Service on this page and updating the &quot;Last updated&quot; date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Contact Information</h2>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms of Service, please contact us at{" "}
                  <a href="mailto:legal@devsocial.com" className="text-primary hover:underline">
                    legal@devsocial.com
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