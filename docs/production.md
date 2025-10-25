# AdrenaLink Production Guide

## About AdrenaLink

AdrenaLink is a first-of-a-kind application that connects teachers and students for adrenaline sports lessons. Our mission is to revolutionize how extreme sports education is delivered by creating seamless connections between instructors and learners.

## Production Environment

### Domain Configuration
- **Production Domain**: `adrenalink.tech`
- **Subdomain Architecture**: School-specific subdomains (e.g., `schoolname.adrenalink.tech`)
- **CDN Domain**: `cdn.adrenalink.tech` - Direct link to Cloudflare R2 bucket for optimized asset delivery

### Middleware Implementation
The production environment uses Next.js middleware (`src/middleware.ts`) to handle:
- **Subdomain Detection**: Automatically detects school subdomains
- **School Context Headers**: Sets `x-school-username` header for proper school identification
- **Route Handling**: Redirects subdomain traffic to `/subdomain` directory
- **School Validation**: Validates schools via username and fetches appropriate data tables

## Version Roadmap

### v0.1 (Current Production) 
**Status**: Live on production
- Simple landing site
- Basic branding and information architecture
- Foundation for future development

### v0.2 (Pre-Beta Development)
**Status**: In development
- School request form implementation
- School onboarding system for beta preparation
- Administrative tools for school management
- **Target**: Complete before beta launch

### v1.0 (Beta Release)
**Launch Date**: January 1, 2026
**Target**: 6 participating schools

#### Three Core Interfaces:
1. **Admin Interface** (Main App)
   - School management and oversight
   - System administration tools
   - Analytics and reporting

2. **Student Portal**
   - Lesson booking and management
   - Progress tracking
   - Communication with instructors

3. **Teacher Portal**
   - Lesson scheduling and management
   - Student progress monitoring
   - Communication tools

## Technical Architecture

### Branch Strategy
- **Production Branch**: `prod` - deployed to adrenalink.tech
- **Development Branch**: `main` - development and testing

### School Context System
Schools are identified and managed through:
- Subdomain-based routing
- Header-based context passing (`x-school-username`)
- Dynamic table fetching based on school context
- Multi-tenant data architecture

## Branding
**AdrenaLink** - Connecting the adrenaline sports community through innovative technology, enabling seamless teacher-student connections for extreme sports education.