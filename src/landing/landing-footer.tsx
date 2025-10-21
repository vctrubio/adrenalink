"use client";

import { Mail, Linkedin } from "lucide-react";
import { WindToggle } from "@/src/components/themes/WindToggle";
interface DevAboutMeFooterProps {
  onThemeChange?: () => void;
}

export function DevAboutMeFooter({ onThemeChange }: DevAboutMeFooterProps = {}) {
  
  return (
    <section className="h-screen snap-start relative overflow-hidden bg-background">
      <div className="h-full flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center space-y-16">
          {/* Main Content */}
          <div className="space-y-8">
            <h2 className="text-4xl font-light tracking-tight text-foreground">
              Ready to transform your school?
            </h2>
            
            <div className="text-2xl font-mono text-secondary">
              your_school.adrenalink.com
            </div>
            
            <p className="text-xl text-muted-foreground">
              First come, first served
            </p>
          </div>

          {/* Beta Version */}
          <div className="space-y-8">
            <div className="text-lg text-muted-foreground">
              Beta Version Coming: January 1, 2026
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-8">
         
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href="mailto:vctrubio@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 text-lg rounded-xl border-2 transition-all duration-300 text-foreground border-secondary bg-secondary/10 hover:bg-secondary/20 hover:border-secondary hover:shadow-lg"
                title="Email vctrubio"
              >
                <Mail className="w-5 h-5" />
                <span>Get in Touch</span>
              </a>
              
              <a
                href="https://www.linkedin.com/in/vctrubio/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 text-lg rounded-xl border-2 transition-all duration-300 text-foreground border-secondary bg-secondary/10 hover:bg-secondary/20 hover:border-secondary hover:shadow-lg"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-5 h-5" />
                <span>Connect on LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="pt-8">
            <div className="text-sm text-muted-foreground mb-2">
              Developed by <span className="text-secondary">vctrubio</span> 📍 Tarifa
            </div>
            
            <WindToggle onThemeChange={onThemeChange} />
          </div>
        </div>
      </div>
    </section>
  );
}
