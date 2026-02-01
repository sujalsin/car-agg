'use client';

import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function DisclaimerPage() {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                    <span className="font-bold">Disclaimer</span>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="flex items-center gap-3 mb-8">
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-3xl font-bold">Important Disclaimer</h1>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-xl p-6 mb-8">
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                        CARAG is an independent research tool. We are NOT affiliated with any government agency,
                        vehicle manufacturer, or dealership.
                    </p>
                </div>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">Data Sources</h2>
                        <p className="text-muted-foreground mb-4">
                            CARAG aggregates publicly available data from official government sources:
                        </p>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="bg-card border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">NHTSA</h3>
                                <p className="text-sm text-muted-foreground">
                                    Complaint data, recall information, and safety ratings from the
                                    National Highway Traffic Safety Administration.
                                </p>
                                <a href="https://www.nhtsa.gov" target="_blank" rel="noopener noreferrer"
                                    className="text-sm text-blue-500 hover:underline">www.nhtsa.gov</a>
                            </div>
                            <div className="bg-card border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">EPA</h3>
                                <p className="text-sm text-muted-foreground">
                                    Fuel economy data and emissions information from the
                                    Environmental Protection Agency.
                                </p>
                                <a href="https://www.fueleconomy.gov" target="_blank" rel="noopener noreferrer"
                                    className="text-sm text-blue-500 hover:underline">www.fueleconomy.gov</a>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">CARAG Estimates</h2>
                        <p className="text-muted-foreground mb-4">
                            The following data points are <strong>CARAG estimates</strong> based on proprietary algorithms
                            and industry averages. They are NOT official government data:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li><strong>Reliability Score</strong> - Calculated from NHTSA complaint and recall data using CARAG's methodology</li>
                            <li><strong>Ownership Costs</strong> - Estimated using industry averages for fuel, insurance, maintenance, and depreciation</li>
                            <li><strong>Pros/Cons</strong> - Auto-generated summaries based on available data</li>
                            <li><strong>Verdict (Recommended/Caution/Avoid)</strong> - CARAG's opinion based on data analysis</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Limitations</h2>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>Data may not be complete or up-to-date for all vehicles</li>
                            <li>Newer vehicles may have limited complaint history</li>
                            <li>Individual vehicle condition may vary significantly</li>
                            <li>Ownership costs are estimates and actual costs may differ</li>
                            <li>Always verify recall status with your local dealer</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Before You Buy</h2>
                        <p className="text-muted-foreground">
                            We strongly recommend the following before purchasing any vehicle:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
                            <li>Get a professional pre-purchase inspection</li>
                            <li>Review the vehicle history report (Carfax, AutoCheck)</li>
                            <li>Check for open recalls at <a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">NHTSA.gov</a></li>
                            <li>Test drive the vehicle thoroughly</li>
                            <li>Compare prices from multiple sources</li>
                        </ul>
                    </section>

                    <section className="bg-muted/50 rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-3">No Warranty</h2>
                        <p className="text-muted-foreground">
                            CARAG provides information "as is" without warranty of any kind. We are not responsible
                            for any decisions made based on information from this website. Use this tool as one of
                            many resources in your car research process.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
