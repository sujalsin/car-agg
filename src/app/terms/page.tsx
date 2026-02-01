'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                    <span className="font-bold">Terms of Service</span>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
                <p className="text-muted-foreground mb-6">Last updated: February 2026</p>

                <div className="prose dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground">
                            By accessing and using CARAG ("the Service"), you accept and agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
                        <p className="text-muted-foreground">
                            CARAG is a vehicle research aggregator that compiles publicly available data from government sources
                            (NHTSA, EPA) and third-party platforms to help users research vehicle reliability, safety, and ownership costs.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">3. Data Sources and Attribution</h2>
                        <p className="text-muted-foreground mb-3">The Service aggregates data from the following sources:</p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li><strong>NHTSA</strong> - National Highway Traffic Safety Administration (U.S. Government public data)</li>
                            <li><strong>EPA</strong> - Environmental Protection Agency / FuelEconomy.gov (U.S. Government public data)</li>
                            <li><strong>YouTube</strong> - Video content embedded via official YouTube API per their Terms of Service</li>
                            <li><strong>News Sources</strong> - Headlines and links to third-party automotive news sites</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">4. Disclaimer of Warranties</h2>
                        <p className="text-muted-foreground">
                            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. We make no warranties regarding the accuracy,
                            completeness, or reliability of any information presented. Reliability scores, ownership cost estimates,
                            and other calculated metrics are CARAG estimates based on publicly available data and industry averages,
                            NOT official government ratings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">5. Limitation of Liability</h2>
                        <p className="text-muted-foreground">
                            CARAG shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages
                            resulting from your use of or inability to use the Service. Vehicle purchase decisions should be made after
                            consulting official sources, professional inspectors, and dealers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">6. Not Professional Advice</h2>
                        <p className="text-muted-foreground">
                            Information on CARAG is for educational and informational purposes only. It does not constitute professional
                            automotive, financial, or legal advice. Always verify information with official sources before making
                            purchasing decisions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">7. Third-Party Content</h2>
                        <p className="text-muted-foreground">
                            The Service may contain links to third-party websites and content. We do not endorse, control, or assume
                            responsibility for third-party content. Your use of third-party sites is governed by their respective terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">8. Changes to Terms</h2>
                        <p className="text-muted-foreground">
                            We reserve the right to modify these terms at any time. Continued use of the Service after changes
                            constitutes acceptance of the modified terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">9. Contact</h2>
                        <p className="text-muted-foreground">
                            For questions about these Terms of Service, please contact us through the website.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
