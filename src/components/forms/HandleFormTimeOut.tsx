"use client";

import { useState } from "react";
import { Mail, Download, Copy, CheckCircle2 } from "lucide-react";
import type { SchoolFormData } from "./WelcomeSchoolSteps";

interface HandleFormTimeOutProps {
    formData: SchoolFormData;
    onClose: () => void;
}

export function HandleFormTimeOut({ formData, onClose }: HandleFormTimeOutProps) {
    const [emailSent, setEmailSent] = useState(false);
    const [jsonCopied, setJsonCopied] = useState(false);

    // Prepare form data for email (excluding file objects)
    const emailData = {
        schoolName: formData.name,
        username: formData.username,
        country: formData.country,
        phone: formData.phone,
        geolocation: formData.latitude && formData.longitude 
            ? `${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`
            : "Not provided",
        equipmentCategories: formData.equipmentCategories.join(", "),
        ownerEmail: formData.ownerEmail,
        referenceNote: formData.referenceNote || "Not provided",
        iconFileInfo: formData.iconFile ? `${formData.iconFile.name} (${formData.iconFile.size} bytes)` : "Not provided",
        bannerFileInfo: formData.bannerFile ? `${formData.bannerFile.name} (${formData.bannerFile.size} bytes)` : "Not provided",
        submissionDate: new Date().toISOString(),
        issueReason: "Cloudflare R2 upload timeout - network connectivity issue"
    };

    const emailSubject = "Early Bird Adrenalink Request";
    const emailBody = `School Registration Request - Manual Processing Required

School Details:
- Name: ${emailData.schoolName}
- Username: ${emailData.username}
- Country: ${emailData.country}
- Phone: ${emailData.phone}
- Geolocation: ${emailData.geolocation}
- Equipment Categories: ${emailData.equipmentCategories}

Contact Information:
- Email: ${emailData.ownerEmail}
- How they heard about us: ${emailData.referenceNote}

File Information:
- Icon: ${emailData.iconFileInfo}
- Banner: ${emailData.bannerFileInfo}

Technical Details:
- Submission Date: ${emailData.submissionDate}
- Issue: ${emailData.issueReason}

Note: Files need to be manually uploaded to R2 bucket under /${emailData.username}/ folder.`;

    const jsonData = JSON.stringify(emailData, null, 2);

    const handleSendEmail = () => {
        const mailto = `mailto:vctrubio@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.open(mailto, "_blank");
        setEmailSent(true);
    };

    const handleCopyJson = async () => {
        try {
            await navigator.clipboard.writeText(jsonData);
            setJsonCopied(true);
            setTimeout(() => setJsonCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy JSON:", error);
        }
    };

    const handleDownloadJson = () => {
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `adrenalink-registration-${emailData.username}-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                            <Mail className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">Upload Issue - Manual Processing Required</h2>
                            <p className="text-muted-foreground">Cloudflare R2 upload timed out. We&apos;ll process your request manually.</p>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-muted/50 rounded-lg p-4 mb-6">
                        <h3 className="font-medium text-foreground mb-2">What happened?</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Our file upload system is experiencing connectivity issues. Don&apos;t worry - your registration details are saved and we&apos;ll process everything manually.
                        </p>
                        <h3 className="font-medium text-foreground mb-2">Next steps:</h3>
                        <ol className="text-sm text-muted-foreground space-y-1">
                            <li>1. Click &quot;Send Email&quot; to send your details automatically</li>
                            <li>2. We&apos;ll manually create your school account within 1 business day</li>
                            <li>3. You&apos;ll receive a confirmation email when everything is set up</li>
                        </ol>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <button
                            onClick={handleSendEmail}
                            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            {emailSent ? "Email Sent!" : "Send Email"}
                        </button>
                        
                        <button
                            onClick={handleCopyJson}
                            className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors"
                        >
                            {jsonCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {jsonCopied ? "Copied!" : "Copy Data"}
                        </button>

                        <button
                            onClick={handleDownloadJson}
                            className="flex items-center justify-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent/90 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Download JSON
                        </button>
                    </div>

                    {/* Data Preview */}
                    <div className="bg-muted/30 rounded-lg p-4 mb-6">
                        <h3 className="font-medium text-foreground mb-3">Registration Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-muted-foreground">School:</span>
                                <span className="ml-2 font-medium">{emailData.schoolName}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Username:</span>
                                <span className="ml-2 font-medium">{emailData.username}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Country:</span>
                                <span className="ml-2 font-medium">{emailData.country}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Email:</span>
                                <span className="ml-2 font-medium">{emailData.ownerEmail}</span>
                            </div>
                            <div className="md:col-span-2">
                                <span className="text-muted-foreground">Categories:</span>
                                <span className="ml-2 font-medium">{emailData.equipmentCategories}</span>
                            </div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}